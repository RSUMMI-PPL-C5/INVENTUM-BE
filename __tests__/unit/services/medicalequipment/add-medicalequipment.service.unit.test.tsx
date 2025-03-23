import MedicalEquipmentService from "../../../../src/services/add-medicalequipment.service";
import MedicalEquipmentRepository from "../../../../src/repository/add-medicalequipment.repository";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
} from "../../../../src/dto/medicalequipment.dto";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../../../src/repository/add-medicalequipment.repository");

describe("MedicalEquipmentService", () => {
  let medicalEquipmentService: MedicalEquipmentService;
  let mockRepository: jest.Mocked<MedicalEquipmentRepository>;

  beforeEach(() => {
    mockRepository =
      new MedicalEquipmentRepository() as jest.Mocked<MedicalEquipmentRepository>;
    medicalEquipmentService = new MedicalEquipmentService();
    (medicalEquipmentService as any).medicalEquipmentRepository =
      mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully add medical equipment", async () => {
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-001",
      name: "X-Ray Machine",
      brandName: "MedCorp",
      modelName: "XR-2000",
      createdBy: 1,
    };

    const expectedOutput = {
      id: uuidv4(),
      ...inputData,
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    mockRepository.findByInventorisId.mockResolvedValue(null);
    mockRepository.addMedicalEquipment.mockResolvedValue(expectedOutput);

    const result = await medicalEquipmentService.addMedicalEquipment(inputData);

    expect(result).toEqual(expectedOutput);
    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-001");
    expect(mockRepository.addMedicalEquipment).toHaveBeenCalledWith(
      expect.objectContaining(inputData),
    );
  });

  it("should throw an error if inventorisId already exists", async () => {
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-001",
      name: "MRI Scanner",
      brandName: "HealthTech",
      modelName: "MRI-5000",
      createdBy: 1,
    };

    const existingEquipment = {
      id: uuidv4(),
      ...inputData,
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    mockRepository.findByInventorisId.mockResolvedValue(existingEquipment);

    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow("Inventoris ID already in use");

    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-001");
    expect(mockRepository.addMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw an error if inventorisId is empty or invalid", async () => {
    const invalidInputs: AddMedicalEquipmentDTO[] = [
      {
        inventorisId: "",
        name: "Ultrasound",
        brandName: "MediScan",
        modelName: "US-300",
      },
      {
        inventorisId: "   ",
        name: "CT Scanner",
        brandName: "ScanCo",
        modelName: "CT-1000",
      } as any,
      {
        inventorisId: null as any,
        name: "Ventilator",
        brandName: "BreathEasy",
        modelName: "V-600",
      },
    ];

    for (const input of invalidInputs) {
      await expect(
        medicalEquipmentService.addMedicalEquipment(input),
      ).rejects.toThrow("inventorisId is required and must be a valid string");
    }
  });

  it("should throw an error if repository fails", async () => {
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-002",
      name: "Defibrillator",
      brandName: "HeartSafe",
      modelName: "DF-900",
      createdBy: 1,
    };

    mockRepository.findByInventorisId.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow("Database connection failed");

    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-002");
  });

  it("should throw an error if name or createdBy is missing", async () => {
    const invalidInputs: AddMedicalEquipmentDTO[] = [
      {
        inventorisId: "INV-005",
        name: "",
        brandName: "MediScan",
        modelName: "US-300",
        createdBy: 1,
      },
      {
        inventorisId: "INV-006",
        name: "CT Scanner",
        brandName: "ScanCo",
        modelName: "CT-1000",
        createdBy: null as any,
      },
      {
        inventorisId: "INV-007",
        name: undefined as any,
        brandName: "ScanCo",
        modelName: "CT-1000",
        createdBy: 2,
      },
    ];

    for (const input of invalidInputs) {
      await expect(
        medicalEquipmentService.addMedicalEquipment(input),
      ).rejects.toThrow("name and createdBy are required");
    }
  });

  // Positive Case
  it("should successfully find medical equipment by inventorisId", async () => {
    const existingEquipment: AddMedicalEquipmentResponseDTO = {
      id: uuidv4(),
      inventorisId: "INV-010",
      name: "Ultrasound Machine",
      brandName: "MedCo",
      modelName: "U-1000",
    };

    mockRepository.findByInventorisId.mockResolvedValue(existingEquipment);

    const result = await medicalEquipmentService.findByInventorisId("INV-010");

    expect(result).toEqual(existingEquipment);
    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-010");
  });

  it("should throw an error if findByInventorisId fails", async () => {
    mockRepository.findByInventorisId.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(
      medicalEquipmentService.findByInventorisId("INV-999"),
    ).rejects.toThrow("Database error");
  });

  // Corner Case
  it("should return null if medical equipment is not found", async () => {
    mockRepository.findByInventorisId.mockResolvedValue(null);

    const result = await medicalEquipmentService.findByInventorisId("INV-404");

    expect(result).toBeNull();
    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-404");
  });

  // Negative case
  it("should throw an error if repository.findByInventorisId fails", async () => {
    const inputData: AddMedicalEquipmentDTO = {
      inventorisId: "INV-ERR",
      name: "ECG Machine",
      createdBy: 1,
    };

    mockRepository.findByInventorisId.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(
      medicalEquipmentService.addMedicalEquipment(inputData),
    ).rejects.toThrow("Database error");

    expect(mockRepository.findByInventorisId).toHaveBeenCalledWith("INV-ERR");
    expect(mockRepository.addMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw an error if inventorisId is empty or invalid in findByInventorisId", async () => {
    const invalidInventorisIds = [
      "",
      "   ",
      null as any,
      undefined as any,
      123 as any,
    ];

    for (const invalidId of invalidInventorisIds) {
      await expect(
        medicalEquipmentService.findByInventorisId(invalidId),
      ).rejects.toThrow("inventorisId is required and must be a valid string");
    }
  });
});
