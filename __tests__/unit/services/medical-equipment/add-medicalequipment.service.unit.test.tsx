import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import AppError from "../../../../src/utils/appError";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
} from "../../../../src/dto/medical-equipment.dto";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

describe("MedicalEquipmentService - addMedicalEquipment", () => {
  let medicalEquipmentService: MedicalEquipmentService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findByInventorisId: jest.fn(),
      addMedicalEquipment: jest.fn(),
    };

    medicalEquipmentService = new MedicalEquipmentService();
    (medicalEquipmentService as any).medicalEquipmentRepository =
      mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully add medical equipment", async () => {
    // Arrange
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
      createdBy: "user-123",
      lastLocation: "Room 101",
    };

    const expectedResponse: AddMedicalEquipmentResponseDTO = {
      id: "mocked-uuid",
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
      lastLocation: "Room 101",
    };

    mockRepository.findByInventorisId.mockResolvedValue(null);
    mockRepository.addMedicalEquipment.mockResolvedValue(expectedResponse);

    // Act
    const result = await medicalEquipmentService.addMedicalEquipment(inputData);

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-001");
    expect(mockRepository.addMedicalEquipment).toHaveBeenCalledWith({
      id: "mocked-uuid",
      ...inputData,
    });
  });

  it("should throw an error if inventorisId already exists", async () => {
    // Arrange
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-001",
      name: "MRI Scanner",
      brandName: "HealthTech",
      modelName: "MRI-5000",
      createdBy: "user-123",
    };

    const existingEquipment: AddMedicalEquipmentResponseDTO = {
      id: "existing-id",
      inventorisId: "INV-001",
      name: "MRI Scanner",
      brandName: "HealthTech",
      modelName: "MRI-5000",
    };

    mockRepository.findByInventorisId.mockResolvedValue(existingEquipment);

    // Act & Assert
    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow(new AppError("Inventoris ID already in use", 400));

    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-001");
    expect(mockRepository.addMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw an error if inventorisId is empty", async () => {
    // Arrange
    const inputData = {
      inventorisId: "",
      name: "Ultrasound",
      brandName: "MediScan",
      modelName: "US-300",
      createdBy: "user-123",
    } as AddMedicalEquipmentDTO;

    // Act & Assert
    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow(
      new AppError("inventorisId is required and must be a valid string", 400),
    );

    expect(mockRepository.findByInventorisId).not.toHaveBeenCalled();
    expect(mockRepository.addMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw an error if inventorisId is whitespace", async () => {
    // Arrange
    const inputData = {
      inventorisId: "   ",
      name: "CT Scanner",
      brandName: "ScanCo",
      modelName: "CT-1000",
      createdBy: "user-123",
    } as AddMedicalEquipmentDTO;

    // Act & Assert
    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow(
      new AppError("inventorisId is required and must be a valid string", 400),
    );
  });

  it("should throw an error if repository fails", async () => {
    // Arrange
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-002",
      name: "Defibrillator",
      brandName: "HeartSafe",
      modelName: "DF-900",
      createdBy: "user-123",
    };

    mockRepository.findByInventorisId.mockRejectedValue(
      new Error("Database connection failed"),
    );

    // Act & Assert
    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow("Database connection failed");

    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-002");
  });
});
