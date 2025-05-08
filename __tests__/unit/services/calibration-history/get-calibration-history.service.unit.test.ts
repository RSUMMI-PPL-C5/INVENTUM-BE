import CalibrationHistoryService from "../../../../src/services/calibration-history.service";
import CalibrationHistoryRepository from "../../../../src/repository/calibration-history.repository";
import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { CalibrationHistoryFilterOptions } from "../../../../src/interfaces/calibration-history.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";

// Mock the repositories
jest.mock("../../../../src/repository/calibration-history.repository");
jest.mock("../../../../src/repository/medical-equipment.repository");

describe("CalibrationHistoryService - getCalibrationHistories", () => {
  let service: CalibrationHistoryService;
  let calibrationHistoryRepository: jest.Mocked<CalibrationHistoryRepository>;
  let medicalEquipmentRepository: jest.Mocked<MedicalEquipmentRepository>;
  const defaultEquipmentId = "equip123";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup repository mocks
    calibrationHistoryRepository =
      new CalibrationHistoryRepository() as jest.Mocked<CalibrationHistoryRepository>;
    medicalEquipmentRepository =
      new MedicalEquipmentRepository() as jest.Mocked<MedicalEquipmentRepository>;

    (
      CalibrationHistoryRepository as jest.MockedClass<
        typeof CalibrationHistoryRepository
      >
    ).mockImplementation(() => calibrationHistoryRepository);
    (
      MedicalEquipmentRepository as jest.MockedClass<
        typeof MedicalEquipmentRepository
      >
    ).mockImplementation(() => medicalEquipmentRepository);

    // Create service instance
    service = new CalibrationHistoryService();
  });

  // Positive case - with search parameter
  it("should retrieve calibration records using search parameter", async () => {
    // Arrange
    const search = "John";
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockCalibrationHistories = [
      {
        id: "cal1",
        medicalEquipmentId: defaultEquipmentId,
        actionPerformed: "Annual calibration",
        technician: "John Doe",
        result: "Success",
        calibrationDate: new Date("2025-04-20"),
        calibrationMethod: "Standard reference",
        nextCalibrationDue: new Date("2026-04-20"),
        createdBy: "user123",
        createdOn: new Date(),
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 1,
      });

    // Act
    const result = await service.getCalibrationHistories(search, filters);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(defaultEquipmentId);
    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).toHaveBeenCalledWith(search, filters, undefined);
    expect(result).toEqual({
      data: mockCalibrationHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Positive case - retrieve with equipment ID only
  it("should retrieve calibration history records with just equipment ID", async () => {
    // Arrange
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockCalibrationHistories = [
      {
        id: "cal1",
        medicalEquipmentId: defaultEquipmentId,
        actionPerformed: "Annual calibration",
        technician: "John Doe",
        result: "Success",
        calibrationDate: new Date("2025-04-20"),
        calibrationMethod: "Standard reference",
        nextCalibrationDue: new Date("2026-04-20"),
        createdBy: "user123",
        createdOn: new Date(),
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 1,
      });

    // Act
    const result = await service.getCalibrationHistories(undefined, filters);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(defaultEquipmentId);
    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).toHaveBeenCalledWith(undefined, filters, undefined);
    expect(result).toEqual({
      data: mockCalibrationHistories,
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
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const pagination: PaginationOptions = { page: 2, limit: 10 };

    const mockCalibrationHistories = [
      {
        id: "cal11",
        medicalEquipmentId: defaultEquipmentId,
        actionPerformed: "Quarterly calibration",
        technician: "Jane Smith",
        result: "Success",
        calibrationDate: new Date("2025-03-15"),
        calibrationMethod: "Standard reference",
        nextCalibrationDue: new Date("2025-06-15"),
        createdBy: "user456",
        createdOn: new Date(),
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 15, // 15 total records, so with limit 10, we'd have 2 pages
      });

    // Act
    const result = await service.getCalibrationHistories(
      undefined,
      filters,
      pagination,
    );

    // Assert
    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).toHaveBeenCalledWith(undefined, filters, pagination);
    expect(result).toEqual({
      data: mockCalibrationHistories,
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
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: "nonexistent-equip",
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.getCalibrationHistories(undefined, filters),
    ).rejects.toThrow(
      `Medical equipment with ID ${filters.medicalEquipmentId} does not exist`,
    );

    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).not.toHaveBeenCalled();
  });

  // Positive case - with multiple filters
  it("should apply multiple filters correctly", async () => {
    // Arrange
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Success"],
      calibrationDateStart: new Date("2025-01-01"),
      calibrationDateEnd: new Date("2025-04-30"),
    };

    const mockCalibrationHistories = [
      {
        id: "cal1",
        medicalEquipmentId: defaultEquipmentId,
        actionPerformed: "Annual calibration",
        technician: "John Doe",
        result: "Success",
        calibrationDate: new Date("2025-03-15"),
        calibrationMethod: "Standard reference",
        nextCalibrationDue: new Date("2026-03-15"),
        createdBy: "user123",
        createdOn: new Date(),
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 1,
      });

    // Act
    const result = await service.getCalibrationHistories(undefined, filters);

    // Assert
    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).toHaveBeenCalledWith(undefined, filters, undefined);
    expect(result.data).toEqual(mockCalibrationHistories);
  });

  // Positive case - with search and filters
  it("should combine search and filters correctly", async () => {
    // Arrange
    const search = "calibration";
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Success"],
      calibrationDateStart: new Date("2025-01-01"),
      calibrationDateEnd: new Date("2025-04-30"),
    };

    const mockCalibrationHistories = [
      {
        id: "cal1",
        medicalEquipmentId: defaultEquipmentId,
        actionPerformed: "Monthly calibration",
        technician: "John Doe",
        result: "Success",
        calibrationDate: new Date("2025-03-15"),
        calibrationMethod: "Standard reference",
        nextCalibrationDue: new Date("2025-06-15"),
        createdBy: "user123",
        createdOn: new Date(),
      },
    ];

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 1,
      });

    // Act
    const result = await service.getCalibrationHistories(search, filters);

    // Assert
    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).toHaveBeenCalledWith(search, filters, undefined);
    expect(result.data).toEqual(mockCalibrationHistories);
  });

  // Edge case - no records found
  it("should return empty data array when no records match filters", async () => {
    // Arrange
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: ["Failed"],
    };

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: [],
        total: 0,
      });

    // Act
    const result = await service.getCalibrationHistories(undefined, filters);

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
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };
    const repoError = new Error("Database connection failed");

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockRejectedValue(repoError);

    // Act & Assert
    await expect(
      service.getCalibrationHistories(undefined, filters),
    ).rejects.toThrow("Database connection failed");
  });

  // Edge case - only search without filters
  it("should work with just search without filters", async () => {
    // Arrange
    const search = "calibration";
    const mockCalibrationHistories = [
      {
        id: "cal1",
        actionPerformed: "Annual calibration",
        calibrationDate: new Date("2025-04-20"),
        result: "Success",
        technician: "John Doe",
        calibrationMethod: "Standard reference",
        medicalEquipmentId: "equip456",
        nextCalibrationDue: new Date("2026-04-20"),
        createdBy: "user123",
        createdOn: new Date(),
      },
    ];

    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 1,
      });

    // Act
    const result = await service.getCalibrationHistories(search);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).not.toHaveBeenCalled();
    expect(
      calibrationHistoryRepository.getCalibrationHistories,
    ).toHaveBeenCalledWith(search, undefined, undefined);
    expect(result).toEqual({
      data: mockCalibrationHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Edge case - pagination math
  it("should correctly calculate total pages for odd number of records", async () => {
    // Arrange
    const filters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
    };

    const pagination: PaginationOptions = { page: 1, limit: 10 };
    const mockCalibrationHistories = Array(5)
      .fill({})
      .map((_, i) => ({
        id: `cal${i + 1}`,
        medicalEquipmentId: defaultEquipmentId,
      }));

    const mockEquipment = { id: defaultEquipmentId, name: "MRI Scanner" };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    calibrationHistoryRepository.getCalibrationHistories = jest
      .fn()
      .mockResolvedValue({
        calibrationHistories: mockCalibrationHistories,
        total: 25, // 25 records with limit 10 should be 3 pages
      });

    // Act
    const result = await service.getCalibrationHistories(
      undefined,
      filters,
      pagination,
    );

    // Assert
    expect(result.meta.totalPages).toBe(3);
  });
});
