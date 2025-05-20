import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import { MedicalEquipmentDTO } from "../../../../src/dto/medical-equipment.dto";
import AppError from "../../../../src/utils/appError";

describe("MedicalEquipmentService - deleteMedicalEquipment", () => {
  let service: MedicalEquipmentService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      deleteMedicalEquipment: jest.fn(),
    };

    service = new MedicalEquipmentService();
    (service as any).medicalEquipmentRepository = mockRepository;
  });

  it("should successfully delete a medical equipment", async () => {
    // Arrange
    const equipmentId = "test-equipment-id";
    const deletedById = "user-123";

    const mockEquipment: MedicalEquipmentDTO = {
      id: equipmentId,
      inventorisId: "INV001",
      name: "Test Equipment",
      brandName: null,
      modelName: null,
      purchaseDate: null,
      purchasePrice: null,
      status: "Active",
      vendor: null,
      lastLocation: "Room 101",
      createdOn: new Date(),
      modifiedOn: new Date(),
      createdBy: "creator-123",
      modifiedBy: "creator-123",
      deletedOn: null,
      deletedBy: null,
    };

    const deletedEquipment = {
      ...mockEquipment,
      deletedOn: new Date(),
      deletedBy: deletedById,
    };

    mockRepository.findById.mockResolvedValue(mockEquipment);
    mockRepository.deleteMedicalEquipment.mockResolvedValue(deletedEquipment);

    // Act
    const result = await service.deleteMedicalEquipment(
      equipmentId,
      deletedById,
    );

    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith(equipmentId);
    expect(mockRepository.deleteMedicalEquipment).toHaveBeenCalledWith(
      equipmentId,
      deletedById,
    );
    expect(result).toEqual(deletedEquipment);
  });

  it("should throw an error for invalid equipment ID", async () => {
    // Act & Assert
    await expect(service.deleteMedicalEquipment("")).rejects.toThrow(
      new AppError("Equipment ID is required and must be a valid string", 400),
    );

    await expect(service.deleteMedicalEquipment("   ")).rejects.toThrow(
      new AppError("Equipment ID is required and must be a valid string", 400),
    );

    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(mockRepository.deleteMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw an error if equipment not found", async () => {
    // Arrange
    const equipmentId = "nonexistent-id";
    mockRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.deleteMedicalEquipment(equipmentId)).rejects.toThrow(
      new AppError("Medical equipment not found", 404),
    );

    expect(mockRepository.findById).toHaveBeenCalledWith(equipmentId);
    expect(mockRepository.deleteMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should work without deletedById parameter", async () => {
    // Arrange
    const equipmentId = "test-equipment-id";

    const mockEquipment: MedicalEquipmentDTO = {
      id: equipmentId,
      inventorisId: "INV001",
      name: "Test Equipment",
      brandName: null,
      modelName: null,
      purchaseDate: null,
      purchasePrice: null,
      status: "Active",
      vendor: null,
      lastLocation: "Room 101",
      createdOn: new Date(),
      modifiedOn: new Date(),
      createdBy: "creator-123",
      modifiedBy: "creator-123",
      deletedOn: null,
      deletedBy: null,
    };

    const deletedEquipment = {
      ...mockEquipment,
      deletedOn: new Date(),
      deletedBy: undefined,
    };

    mockRepository.findById.mockResolvedValue(mockEquipment);
    mockRepository.deleteMedicalEquipment.mockResolvedValue(deletedEquipment);

    // Act
    const result = await service.deleteMedicalEquipment(equipmentId);

    // Assert
    expect(mockRepository.deleteMedicalEquipment).toHaveBeenCalledWith(
      equipmentId,
      undefined,
    );
    expect(result).toEqual(deletedEquipment);
  });
});
