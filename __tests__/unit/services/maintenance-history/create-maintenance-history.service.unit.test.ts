import MaintenanceHistoryService from "../../../../src/services/maintenance-history.service";
import MaintenanceHistoryRepository from "../../../../src/repository/maintenance-history.repository";
import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { CreateMaintenanceHistoryDTO } from "../../../../src/dto/maintenance-history.dto";

// Mock UUID to return predictable IDs
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

// Mock the repositories
jest.mock("../../../../src/repository/maintenance-history.repository");
jest.mock("../../../../src/repository/medical-equipment.repository");

describe("MaintenanceHistoryService - createMaintenanceHistory", () => {
  let service: MaintenanceHistoryService;
  let maintenanceHistoryRepository: jest.Mocked<MaintenanceHistoryRepository>;
  let medicalEquipmentRepository: jest.Mocked<MedicalEquipmentRepository>;

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

  // Positive case
  it("should successfully create a maintenance history record", async () => {
    // Arrange
    const maintenanceData: CreateMaintenanceHistoryDTO = {
      medicalEquipmentId: "equip123",
      actionPerformed: "Calibrated and tested",
      technician: "John Doe",
      maintenanceDate: new Date("2025-04-28"),
      result: "Successful",
      createdBy: "user123",
    };

    const mockEquipment = {
      id: "equip123",
      name: "MRI Scanner",
      // other equipment properties
    };

    const mockCreatedRecord = {
      id: "test-uuid-123",
      ...maintenanceData,
    };

    // Setup repository mocks
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.createMaintenanceHistory = jest
      .fn()
      .mockResolvedValue(mockCreatedRecord);

    // Act
    const result = await service.createMaintenanceHistory(maintenanceData);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(maintenanceData.medicalEquipmentId);
    expect(
      maintenanceHistoryRepository.createMaintenanceHistory,
    ).toHaveBeenCalledWith({
      id: "test-uuid-123",
      ...maintenanceData,
    });
    expect(result).toEqual(mockCreatedRecord);
  });

  // Negative case
  it("should throw an error when medical equipment doesn't exist", async () => {
    // Arrange
    const maintenanceData: CreateMaintenanceHistoryDTO = {
      medicalEquipmentId: "nonexistent-equip",
      actionPerformed: "Routine check",
      technician: "Jane Smith",
      maintenanceDate: new Date("2025-04-28"),
      result: "Successful",
      createdBy: "user123",
    };

    // Equipment not found
    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.createMaintenanceHistory(maintenanceData),
    ).rejects.toThrow(
      `Medical equipment with ID ${maintenanceData.medicalEquipmentId} does not exist`,
    );

    expect(
      maintenanceHistoryRepository.createMaintenanceHistory,
    ).not.toHaveBeenCalled();
  });

  // Edge case - repository error during creation
  it("should propagate errors from the repository", async () => {
    // Arrange
    const maintenanceData: CreateMaintenanceHistoryDTO = {
      medicalEquipmentId: "equip123",
      actionPerformed: "Repair",
      technician: "Bob Johnson",
      maintenanceDate: new Date("2025-04-28"),
      result: "Failed",
      createdBy: "user123",
    };

    const mockEquipment = { id: "equip123", name: "X-Ray Machine" };
    const repoError = new Error("Database connection failed");

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.createMaintenanceHistory = jest
      .fn()
      .mockRejectedValue(repoError);

    // Act & Assert
    await expect(
      service.createMaintenanceHistory(maintenanceData),
    ).rejects.toThrow("Database connection failed");
  });

  // Edge case - minimal required fields
  it("should create a record with only required fields", async () => {
    // Arrange
    const minimalMaintenanceData: CreateMaintenanceHistoryDTO = {
      medicalEquipmentId: "equip123",
      maintenanceDate: new Date("2025-04-28"),
      result: "Successful",
      createdBy: "user123",
      actionPerformed: "Minimal maintenance",
      technician: "Technician",
    };

    const mockEquipment = { id: "equip123", name: "X-Ray Machine" };
    const mockCreatedRecord = {
      id: "test-uuid-123",
      ...minimalMaintenanceData,
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);
    maintenanceHistoryRepository.createMaintenanceHistory = jest
      .fn()
      .mockResolvedValue(mockCreatedRecord);

    // Act
    const result = await service.createMaintenanceHistory(
      minimalMaintenanceData,
    );

    // Assert
    expect(
      maintenanceHistoryRepository.createMaintenanceHistory,
    ).toHaveBeenCalledWith({
      id: "test-uuid-123",
      ...minimalMaintenanceData,
    });
    expect(result).toEqual(mockCreatedRecord);
  });
});
