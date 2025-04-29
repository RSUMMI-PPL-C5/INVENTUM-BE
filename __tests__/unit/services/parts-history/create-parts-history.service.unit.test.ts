import PartsHistoryService from "../../../../src/services/parts-history.service";
import PartsHistoryRepository from "../../../../src/repository/parts-history.repository";
import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { CreatePartsHistoryDTO } from "../../../../src/dto/parts-history.dto";

// Mock UUID to return predictable IDs
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

// Mock the repositories
jest.mock("../../../../src/repository/parts-history.repository");
jest.mock("../../../../src/repository/medical-equipment.repository");
jest.mock("../../../../src/repository/sparepart.repository");

describe("PartsHistoryService - createPartsHistory", () => {
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

  // Positive case
  it("should successfully create a parts history record", async () => {
    // Arrange
    const partsData: CreatePartsHistoryDTO = {
      medicalEquipmentId: "equip-123",
      sparepartId: "part-123",
      actionPerformed: "Replaced motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-15"),
      createdBy: "user-123",
    };

    const mockEquipment = {
      id: "equip-123",
      name: "ECG Machine",
      // Additional properties as needed
    };

    const mockSparepart = {
      id: "part-123",
      partsName: "Motor",
      // Additional properties as needed
    };

    const mockCreatedRecord = {
      id: "test-uuid-123",
      ...partsData,
      createdOn: new Date(),
    };

    // Setup repository mocks
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    sparepartRepository.getSparepartById = jest
      .fn()
      .mockResolvedValue(mockSparepart);
    partsHistoryRepository.createPartsHistory = jest
      .fn()
      .mockResolvedValue(mockCreatedRecord);

    // Act
    const result = await service.createPartsHistory(partsData);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(partsData.medicalEquipmentId);
    expect(sparepartRepository.getSparepartById).toHaveBeenCalledWith(
      partsData.sparepartId,
    );
    expect(partsHistoryRepository.createPartsHistory).toHaveBeenCalledWith({
      id: "test-uuid-123",
      ...partsData,
    });
    expect(result).toEqual(mockCreatedRecord);
  });

  // Negative case - equipment does not exist
  it("should throw an error when medical equipment doesn't exist", async () => {
    // Arrange
    const partsData: CreatePartsHistoryDTO = {
      medicalEquipmentId: "nonexistent-equip",
      sparepartId: "part-123",
      actionPerformed: "Replace motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-15"),
      createdBy: "user-123",
    };

    // Equipment not found
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(null);

    // Act & Assert
    await expect(service.createPartsHistory(partsData)).rejects.toThrow(
      `Medical equipment with ID ${partsData.medicalEquipmentId} does not exist`,
    );

    expect(sparepartRepository.getSparepartById).not.toHaveBeenCalled();
    expect(partsHistoryRepository.createPartsHistory).not.toHaveBeenCalled();
  });

  // Negative case - sparepart does not exist
  it("should throw an error when sparepart doesn't exist", async () => {
    // Arrange
    const partsData: CreatePartsHistoryDTO = {
      medicalEquipmentId: "equip-123",
      sparepartId: "nonexistent-part",
      actionPerformed: "Replace motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-15"),
      createdBy: "user-123",
    };

    const mockEquipment = {
      id: "equip-123",
      name: "ECG Machine",
    };

    // Setup mocks
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    sparepartRepository.getSparepartById = jest.fn().mockResolvedValue(null);

    // Act & Assert
    await expect(service.createPartsHistory(partsData)).rejects.toThrow(
      `Sparepart with ID ${partsData.sparepartId} does not exist`,
    );

    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(partsData.medicalEquipmentId);
    expect(sparepartRepository.getSparepartById).toHaveBeenCalledWith(
      partsData.sparepartId,
    );
    expect(partsHistoryRepository.createPartsHistory).not.toHaveBeenCalled();
  });

  // Edge case - repository error
  it("should propagate errors from the repository", async () => {
    // Arrange
    const partsData: CreatePartsHistoryDTO = {
      medicalEquipmentId: "equip-123",
      sparepartId: "part-123",
      actionPerformed: "Replace motor",
      technician: "John Doe",
      result: "Success",
      replacementDate: new Date("2023-05-15"),
      createdBy: "user-123",
    };

    const mockEquipment = { id: "equip-123", name: "ECG Machine" };
    const mockSparepart = { id: "part-123", partsName: "Motor" };
    const repoError = new Error("Database connection failed");

    // Setup mocks
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    sparepartRepository.getSparepartById = jest
      .fn()
      .mockResolvedValue(mockSparepart);
    partsHistoryRepository.createPartsHistory = jest
      .fn()
      .mockRejectedValue(repoError);

    // Act & Assert
    await expect(service.createPartsHistory(partsData)).rejects.toThrow(
      "Database connection failed",
    );

    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalled();
    expect(sparepartRepository.getSparepartById).toHaveBeenCalled();
    expect(partsHistoryRepository.createPartsHistory).toHaveBeenCalled();
  });
});
