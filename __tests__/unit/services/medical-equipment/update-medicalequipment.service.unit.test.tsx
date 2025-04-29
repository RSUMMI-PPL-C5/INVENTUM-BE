import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import AppError from "../../../../src/utils/appError";
import {
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
} from "../../../../src/dto/medical-equipment.dto";

describe("MedicalEquipmentService - updateMedicalEquipment", () => {
  let service: MedicalEquipmentService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      findById: jest.fn(),
      updateMedicalEquipment: jest.fn(),
    };

    service = new MedicalEquipmentService();
    (service as any).medicalEquipmentRepository = mockRepository;
  });

  it("should update medical equipment successfully", async () => {
    const id = "test-id-123";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      brandName: "Updated Brand",
      modelName: "Updated Model",
      status: "Maintenance",
      modifiedBy: "user-123",
    };

    const existingEquipment = {
      id,
      inventorisId: "INV123",
      name: "Original Equipment",
      brandName: "Original Brand",
      modelName: "Original Model",
    };

    const updatedEquipment: AddMedicalEquipmentResponseDTO = {
      id,
      inventorisId: "INV123",
      name: "Updated Equipment",
      brandName: "Updated Brand",
      modelName: "Updated Model",
    };

    mockRepository.findById.mockResolvedValue(existingEquipment);
    mockRepository.updateMedicalEquipment.mockResolvedValue(updatedEquipment);

    const result = await service.updateMedicalEquipment(id, updateData);

    // Assertions
    expect(mockRepository.findById).toHaveBeenCalledWith(id);
    expect(mockRepository.updateMedicalEquipment).toHaveBeenCalledWith(
      id,
      updateData,
    );
    expect(result).toEqual(updatedEquipment);
  });

  it("should update medical equipment with partial data", async () => {
    const id = "test-id-123";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: "user-123",
    };

    const existingEquipment = {
      id,
      inventorisId: "INV123",
      name: "Original Equipment",
      brandName: "Original Brand",
      modelName: "Original Model",
    };

    const updatedEquipment: AddMedicalEquipmentResponseDTO = {
      id,
      inventorisId: "INV123",
      name: "Updated Equipment",
      brandName: "Original Brand",
      modelName: "Original Model",
    };

    mockRepository.findById.mockResolvedValue(existingEquipment);
    mockRepository.updateMedicalEquipment.mockResolvedValue(updatedEquipment);

    const result = await service.updateMedicalEquipment(id, updateData);

    // Assertions
    expect(mockRepository.updateMedicalEquipment).toHaveBeenCalledWith(
      id,
      updateData,
    );
    expect(result).toEqual(updatedEquipment);
  });

  it("should throw error if equipment id is empty", async () => {
    const id = "";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: "user-123",
    };

    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow(
      new AppError("Equipment ID is required and must be a valid string", 400),
    );

    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(mockRepository.updateMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw error if equipment id is whitespace", async () => {
    const id = "   ";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: "user-123",
    };

    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow(
      new AppError("Equipment ID is required and must be a valid string", 400),
    );
  });

  it("should throw error if equipment is not found", async () => {
    const id = "non-existent-id";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: "user-123",
    };

    mockRepository.findById.mockResolvedValue(null);

    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow(new AppError("Medical equipment not found", 404));

    expect(mockRepository.findById).toHaveBeenCalledWith(id);
    expect(mockRepository.updateMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should handle repository errors during update", async () => {
    const id = "test-id-123";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: "user-123",
    };

    const existingEquipment = {
      id,
      inventorisId: "INV123",
      name: "Original Equipment",
      brandName: "Original Brand",
      modelName: "Original Model",
    };

    mockRepository.findById.mockResolvedValue(existingEquipment);

    const dbError = new Error("Database update error");
    mockRepository.updateMedicalEquipment.mockRejectedValue(dbError);

    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow("Database update error");

    expect(mockRepository.findById).toHaveBeenCalledWith(id);
    expect(mockRepository.updateMedicalEquipment).toHaveBeenCalledWith(
      id,
      updateData,
    );
  });
});
