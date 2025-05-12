import PartsHistoryService from "../../../../src/services/parts-history.service";
import PartsHistoryRepository from "../../../../src/repository/parts-history.repository";
import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { PartsHistoryFilterOptions } from "../../../../src/interfaces/parts-history.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";

// Mock the repositories
jest.mock("../../../../src/repository/parts-history.repository");
jest.mock("../../../../src/repository/medical-equipment.repository");
jest.mock("../../../../src/repository/sparepart.repository");

describe("PartsHistoryService - getPartsHistories", () => {
  let service: PartsHistoryService;
  let partsHistoryRepository: jest.Mocked<PartsHistoryRepository>;
  let medicalEquipmentRepository: jest.Mocked<MedicalEquipmentRepository>;
  let sparepartRepository: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup repository mocks with type safety
    partsHistoryRepository =
      new PartsHistoryRepository() as jest.Mocked<PartsHistoryRepository>;
    medicalEquipmentRepository =
      new MedicalEquipmentRepository() as jest.Mocked<MedicalEquipmentRepository>;
    sparepartRepository =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;

    // Mock the repositories by reassigning their instances
    (
      PartsHistoryRepository as jest.MockedClass<typeof PartsHistoryRepository>
    ).mockImplementation(() => partsHistoryRepository);
    (
      MedicalEquipmentRepository as jest.MockedClass<
        typeof MedicalEquipmentRepository
      >
    ).mockImplementation(() => medicalEquipmentRepository);
    (
      SparepartRepository as jest.MockedClass<typeof SparepartRepository>
    ).mockImplementation(() => sparepartRepository);

    // Create service instance
    service = new PartsHistoryService();
  });

  // Positive case - no filters or pagination
  it("should get parts histories without filters or pagination", async () => {
    // Arrange
    const mockHistories = [
      {
        id: "hist-123",
        medicalEquipmentId: "equip-123",
        sparepartId: "part-123",
        actionPerformed: "Replace motor",
        technician: "John Doe",
        result: "Success",
        replacementDate: new Date("2023-05-10"),
        createdBy: "user-123",
        createdOn: new Date("2023-05-10"),
        partsName: "Motor",
      },
    ];

    // Setup mock
    partsHistoryRepository.getPartsHistories = jest.fn().mockResolvedValue({
      partsHistories: mockHistories,
      total: 1,
    });

    // Act
    const result = await service.getPartsHistories();

    // Assert
    expect(partsHistoryRepository.getPartsHistories).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );

    expect(result).toEqual({
      data: mockHistories,
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  });

  // Positive case - with filters and pagination
  it("should get parts histories with filters and pagination", async () => {
    // Arrange
    const search = "motor";
    const filters: PartsHistoryFilterOptions = {
      medicalEquipmentId: "equip-123",
      result: ["Success"],
    };
    const pagination: PaginationOptions = {
      page: 2,
      limit: 10,
    };

    const mockEquipment = {
      id: "equip-123",
      name: "ECG Machine",
    };

    const mockHistories = [
      {
        id: "hist-123",
        medicalEquipmentId: "equip-123",
        sparepartId: "part-123",
        actionPerformed: "Replace motor",
        technician: "John Doe",
        result: "Success",
        replacementDate: new Date("2023-05-10"),
        createdBy: "user-123",
        createdOn: new Date("2023-05-10"),
        partsName: "Motor",
      },
    ];

    // Setup mocks
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    partsHistoryRepository.getPartsHistories = jest.fn().mockResolvedValue({
      partsHistories: mockHistories,
      total: 15,
    });

    // Act
    const result = await service.getPartsHistories(search, filters, pagination);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith("equip-123");
    expect(partsHistoryRepository.getPartsHistories).toHaveBeenCalledWith(
      search,
      filters,
      pagination,
    );

    expect(result).toEqual({
      data: mockHistories,
      meta: {
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      },
    });
  });

  // Negative case - invalid equipment ID
  it("should throw an error when filtering with invalid equipment ID", async () => {
    // Arrange
    const filters: PartsHistoryFilterOptions = {
      medicalEquipmentId: "nonexistent-equip",
    };

    // Setup mock
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(null);

    // Act & Assert
    await expect(service.getPartsHistories(undefined, filters)).rejects.toThrow(
      `Medical equipment with ID ${filters.medicalEquipmentId} does not exist`,
    );

    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(filters.medicalEquipmentId);
    expect(partsHistoryRepository.getPartsHistories).not.toHaveBeenCalled();
  });

  // Negative case - invalid sparepart ID
  it("should throw an error when filtering with invalid sparepart ID", async () => {
    // Arrange
    const filters: PartsHistoryFilterOptions = {
      sparepartId: "nonexistent-part",
    };

    // Setup mock
    sparepartRepository.getSparepartById = jest.fn().mockResolvedValue(null);

    // Act & Assert
    await expect(service.getPartsHistories(undefined, filters)).rejects.toThrow(
      `Sparepart with ID ${filters.sparepartId} does not exist`,
    );

    expect(sparepartRepository.getSparepartById).toHaveBeenCalledWith(
      filters.sparepartId,
    );
    expect(partsHistoryRepository.getPartsHistories).not.toHaveBeenCalled();
  });

  // Edge case - repository throws error
  it("should propagate errors from the repository", async () => {
    // Arrange
    const repositoryError = new Error("Database error");

    // Setup mock
    partsHistoryRepository.getPartsHistories = jest
      .fn()
      .mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(service.getPartsHistories()).rejects.toThrow("Database error");

    expect(partsHistoryRepository.getPartsHistories).toHaveBeenCalled();
  });

  // Edge case - calculating pagination with no results
  it("should handle empty result set correctly", async () => {
    // Arrange
    partsHistoryRepository.getPartsHistories = jest.fn().mockResolvedValue({
      partsHistories: [],
      total: 0,
    });

    // Act
    const result = await service.getPartsHistories();

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
});
