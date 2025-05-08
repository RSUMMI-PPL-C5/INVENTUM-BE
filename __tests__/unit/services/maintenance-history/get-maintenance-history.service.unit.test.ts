import MaintenanceHistoryService from "../../../../src/services/maintenance-history.service";
import MaintenanceHistoryRepository from "../../../../src/repository/maintenance-history.repository";
import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { MaintenanceHistoryFilterOptions } from "../../../../src/interfaces/maintenance-history.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";

// Mock the repositories
jest.mock("../../../../src/repository/maintenance-history.repository");
jest.mock("../../../../src/repository/medical-equipment.repository");

describe("MaintenanceHistoryService - getMaintenanceHistories", () => {
  let service: MaintenanceHistoryService;
  let maintenanceHistoryRepository: jest.Mocked<MaintenanceHistoryRepository>;
  let medicalEquipmentRepository: jest.Mocked<MedicalEquipmentRepository>;
  const defaultEquipmentId = "equip123";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup repository mocks with type safety
    maintenanceHistoryRepository =
      new MaintenanceHistoryRepository() as jest.Mocked<MaintenanceHistoryRepository>;
    medicalEquipmentRepository =
      new MedicalEquipmentRepository() as jest.Mocked<MedicalEquipmentRepository>;

    // Mock the repositories by reassigning their instances
    (
      MaintenanceHistoryRepository as jest.MockedClass<
        typeof MaintenanceHistoryRepository
      >
    ).mockImplementation(() => maintenanceHistoryRepository);
    (
      MedicalEquipmentRepository as jest.MockedClass<
        typeof MedicalEquipmentRepository
      >
    ).mockImplementation(() => medicalEquipmentRepository);

    // Create service instance
    service = new MaintenanceHistoryService();
  });

  // Positive case - with search parameter
  it("should retrieve maintenance records using search parameter", async () => {
    // Arrange
    const search = "John";
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockMaintenanceHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-04-20"),
        result: "Successful",
        technician: "John Doe",
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories(search, filters);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(defaultEquipmentId);
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(search, filters, undefined);
    expect(result).toEqual({
      data: mockMaintenanceHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Positive case - retrieve with equipment ID only
  it("should retrieve maintenance history records with just equipment ID", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockMaintenanceHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-04-20"),
        result: "Successful",
        technician: "John Doe",
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(defaultEquipmentId);
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(undefined, filters, undefined);
    expect(result).toEqual({
      data: mockMaintenanceHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Positive case - with pagination
  it("should correctly apply pagination", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const pagination: PaginationOptions = { page: 2, limit: 10 };

    const mockMaintenanceHistories = [
      {
        id: "maint11",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-03-15"),
        result: "Successful",
        technician: "Jane Smith",
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 15, // 15 total records, so with limit 10, we'd have 2 pages
      });

    // Act
    const result = await service.getMaintenanceHistories(
      undefined,
      filters,
      pagination,
    );

    // Assert
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(undefined, filters, pagination);
    expect(result).toEqual({
      data: mockMaintenanceHistories,
      meta: {
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      },
    });
  });

  // Negative case - equipment doesn't exist
  it("should throw an error when specified equipment doesn't exist", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: "nonexistent-equip",
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.getMaintenanceHistories(undefined, filters),
    ).rejects.toThrow(
      `Medical equipment with ID ${filters.medicalEquipmentId} does not exist`,
    );

    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).not.toHaveBeenCalled();
  });

  // Positive case - with multiple filters
  it("should apply multiple filters correctly", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Success"],
      maintenanceDateStart: new Date("2025-01-01"),
      maintenanceDateEnd: new Date("2025-04-30"),
    };

    const mockMaintenanceHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-03-15"),
        result: "Successful",
        technician: "John Doe",
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(undefined, filters, undefined);
    expect(result.data).toEqual(mockMaintenanceHistories);
  });

  // Positive case - with search and filters
  it("should combine search and filters correctly", async () => {
    // Arrange
    const search = "calibration";
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Success"],
      maintenanceDateStart: new Date("2025-01-01"),
      maintenanceDateEnd: new Date("2025-04-30"),
    };

    const mockMaintenanceHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-03-15"),
        result: "Successful",
        actionPerformed: "Monthly calibration",
        technician: "John Doe",
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories(search, filters);

    // Assert
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(search, filters, undefined);
    expect(result.data).toEqual(mockMaintenanceHistories);
  });

  // Edge case - no records found
  it("should return empty data array when no records match filters", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Failed"],
    };

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: [],
        total: 0,
      });

    // Act
    const result = await service.getMaintenanceHistories(undefined, filters);

    // Assert
    expect(result).toEqual({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 1,
      },
    });
  });

  // Edge case - repository error
  it("should propagate errors from the repository", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };
    const repoError = new Error("Database connection failed");

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockRejectedValue(repoError);

    // Act & Assert
    await expect(
      service.getMaintenanceHistories(undefined, filters),
    ).rejects.toThrow("Database connection failed");
  });

  // Edge case - pagination math
  it("should correctly calculate total pages for odd number of records", async () => {
    // Arrange
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const pagination: PaginationOptions = { page: 1, limit: 10 };
    const mockMaintenanceHistories = Array(5)
      .fill({})
      .map((_, i) => ({
        id: `maint${i + 1}`,
        medicalEquipmentId: defaultEquipmentId,
      }));

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 25, // 25 records with limit 10 should be 3 pages
      });

    // Act
    const result = await service.getMaintenanceHistories(
      undefined,
      filters,
      pagination,
    );

    // Assert
    expect(result.meta.totalPages).toBe(3);
  });

  // Edge case - only search without filters
  it("should work with just search without filters", async () => {
    // Arrange
    const search = "calibration";
    const mockMaintenanceHistories = [
      {
        id: "maint1",
        actionPerformed: "Annual calibration",
        maintenanceDate: new Date("2025-04-20"),
        result: "Successful",
      },
    ];

    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories(search);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).not.toHaveBeenCalled();
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(search, undefined, undefined);
    expect(result).toEqual({
      data: mockMaintenanceHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Edge case - undefined filters
  it("should work with undefined filters", async () => {
    // Arrange
    const mockMaintenanceHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-04-20"),
        result: "Successful",
      },
    ];

    // No equipment check should happen
    medicalEquipmentRepository.getMedicalEquipmentById = jest.fn();

    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories();

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).not.toHaveBeenCalled();
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result).toEqual({
      data: mockMaintenanceHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Edge case - empty search string
  it("should work with empty search string", async () => {
    // Arrange
    const search = "";
    const filters: MaintenanceHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockMaintenanceHistories = [
      {
        id: "maint1",
        medicalEquipmentId: defaultEquipmentId,
        maintenanceDate: new Date("2025-04-20"),
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.getMaintenanceHistories = jest
      .fn()
      .mockResolvedValue({
        maintenanceHistories: mockMaintenanceHistories,
        total: 1,
      });

    // Act
    const result = await service.getMaintenanceHistories(search, filters);

    // Assert
    expect(
      maintenanceHistoryRepository.getMaintenanceHistories,
    ).toHaveBeenCalledWith(search, filters, undefined);
    expect(result.data).toEqual(mockMaintenanceHistories);
  });
});
