import CalibrationHistoryService from "../../../../src/services/calibration-history.service";
import CalibrationHistoryRepository from "../../../../src/repository/calibration-history.repository";
import MedicalEquipmentRepository from "../../../../src/repository/medical-equipment.repository";
import { CreateCalibrationHistoryDTO } from "../../../../src/dto/calibration-history.dto";
import { v4 as uuidv4 } from "uuid";

// Mock dependencies and uuid
jest.mock("../../../../src/repository/calibration-history.repository");
jest.mock("../../../../src/repository/medical-equipment.repository");
jest.mock("uuid");

describe("CalibrationHistoryService - createCalibrationHistory", () => {
  let service: CalibrationHistoryService;
  let calibrationHistoryRepository: jest.Mocked<CalibrationHistoryRepository>;
  let medicalEquipmentRepository: jest.Mocked<MedicalEquipmentRepository>;

  const mockUUID = "mock-uuid-1234";

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

    // Mock UUID generation
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);

    // Create service instance
    service = new CalibrationHistoryService();
  });

  // Positive case - create with all required fields
  it("should successfully create a calibration history record", async () => {
    // Arrange
    const equipmentId = "equip123";
    const calibrationData: CreateCalibrationHistoryDTO = {
      medicalEquipmentId: equipmentId,
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-28"),
      calibrationMethod: "Standard reference",
      createdBy: "user123",
    };

    const mockEquipment = { id: equipmentId, name: "MRI Scanner" };
    const mockCreatedRecord = {
      id: mockUUID,
      ...calibrationData,
      createdOn: new Date(),
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);

    calibrationHistoryRepository.createCalibrationHistory = jest
      .fn()
      .mockResolvedValue(mockCreatedRecord);

    // Act
    const result = await service.createCalibrationHistory(calibrationData);

    // Assert
    expect(
      medicalEquipmentRepository.getMedicalEquipmentById,
    ).toHaveBeenCalledWith(equipmentId);
    expect(uuidv4).toHaveBeenCalled();
    expect(
      calibrationHistoryRepository.createCalibrationHistory,
    ).toHaveBeenCalledWith({
      id: mockUUID,
      ...calibrationData,
    });
    expect(result).toEqual(mockCreatedRecord);
  });

  // Positive case - with optional nextCalibrationDue
  it("should create record with nextCalibrationDue field", async () => {
    // Arrange
    const equipmentId = "equip123";
    const nextCalibrationDate = new Date("2026-04-28");
    const calibrationData: CreateCalibrationHistoryDTO = {
      medicalEquipmentId: equipmentId,
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-28"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: nextCalibrationDate,
      createdBy: "user123",
    };

    const mockEquipment = { id: equipmentId, name: "MRI Scanner" };
    const mockCreatedRecord = {
      id: mockUUID,
      ...calibrationData,
      createdOn: new Date(),
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);

    calibrationHistoryRepository.createCalibrationHistory = jest
      .fn()
      .mockResolvedValue(mockCreatedRecord);

    // Act
    const result = await service.createCalibrationHistory(calibrationData);

    // Assert
    expect(
      calibrationHistoryRepository.createCalibrationHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        nextCalibrationDue: nextCalibrationDate,
      }),
    );
    expect(result.nextCalibrationDue).toEqual(nextCalibrationDate);
  });

  // Negative case - equipment doesn't exist
  it("should throw an error when equipment doesn't exist", async () => {
    // Arrange
    const equipmentId = "nonexistent";
    const calibrationData: CreateCalibrationHistoryDTO = {
      medicalEquipmentId: equipmentId,
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-28"),
      calibrationMethod: "Standard reference",
      createdBy: "user123",
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.createCalibrationHistory(calibrationData),
    ).rejects.toThrow(
      `Medical equipment with ID ${equipmentId} does not exist`,
    );

    expect(
      calibrationHistoryRepository.createCalibrationHistory,
    ).not.toHaveBeenCalled();
  });

  // Negative case - repository error
  it("should propagate repository errors", async () => {
    // Arrange
    const equipmentId = "equip123";
    const calibrationData: CreateCalibrationHistoryDTO = {
      medicalEquipmentId: equipmentId,
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-28"),
      calibrationMethod: "Standard reference",
      createdBy: "user123",
    };

    const mockEquipment = { id: equipmentId, name: "MRI Scanner" };
    const mockError = new Error("Database error");

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);

    calibrationHistoryRepository.createCalibrationHistory = jest
      .fn()
      .mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      service.createCalibrationHistory(calibrationData),
    ).rejects.toThrow("Database error");
  });

  // Edge case - null nextCalibrationDue
  it("should handle null nextCalibrationDue", async () => {
    // Arrange
    const equipmentId = "equip123";
    const calibrationData: CreateCalibrationHistoryDTO = {
      medicalEquipmentId: equipmentId,
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Failed", // Failed calibration shouldn't set next due date
      calibrationDate: new Date("2025-04-28"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: null,
      createdBy: "user123",
    };

    const mockEquipment = { id: equipmentId, name: "MRI Scanner" };
    const mockCreatedRecord = {
      id: mockUUID,
      ...calibrationData,
      createdOn: new Date(),
    };

    medicalEquipmentRepository.getMedicalEquipmentById = jest
      .fn()
      .mockResolvedValue(mockEquipment);

    calibrationHistoryRepository.createCalibrationHistory = jest
      .fn()
      .mockResolvedValue(mockCreatedRecord);

    // Act
    const result = await service.createCalibrationHistory(calibrationData);

    // Assert
    expect(
      calibrationHistoryRepository.createCalibrationHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        nextCalibrationDue: null,
      }),
    );
    expect(result.nextCalibrationDue).toBeNull();
  });
});
