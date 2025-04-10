import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import MedicalEquipmentRepository from "../../../../src/repository/medicalequipment.repository";
import { UpdateMedicalEquipmentDTO } from "../../../../src/dto/medicalequipment.dto";

jest.mock("../../../../src/repository/medicalequipment.repository");

describe("MedicalEquipmentService - updateMedicalEquipment", () => {
  let service: MedicalEquipmentService;
  let mockRepository: jest.Mocked<MedicalEquipmentRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock repository
    mockRepository =
      new MedicalEquipmentRepository() as jest.Mocked<MedicalEquipmentRepository>;

    // Create service instance
    service = new MedicalEquipmentService();

    // Access private property and assign mock
    (service as any).medicalEquipmentRepository = mockRepository;
  });

  it("should update medical equipment successfully", async () => {
    // Mock data
    const id = "test-id-123";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      brandName: "Updated Brand",
      modelName: "Updated Model",
      modifiedBy: 2,
    };

    const existingEquipment = {
      id,
      inventorisId: "INV123",
      name: "Original Equipment",
      brandName: "Original Brand",
      modelName: "Original Model",
    };

    const updatedEquipment = {
      ...existingEquipment,
      name: updateData.name ?? existingEquipment.name,
      brandName: updateData.brandName ?? existingEquipment.brandName,
      modelName: updateData.modelName ?? existingEquipment.modelName,
    };

    // Setup mock implementations
    mockRepository.findById.mockResolvedValue(existingEquipment);
    mockRepository.updateMedicalEquipment.mockResolvedValue(updatedEquipment);

    // Call the service method
    const result = await service.updateMedicalEquipment(id, updateData);

    // Assertions
    expect(mockRepository.findById).toHaveBeenCalledWith(id);
    expect(mockRepository.updateMedicalEquipment).toHaveBeenCalledWith(id, {
      ...updateData,
      modifiedOn: expect.any(Date),
    });
    expect(result).toEqual(updatedEquipment);
  });

  it("should throw error if equipment id is empty", async () => {
    // Mock data - empty id
    const id = "";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: 2,
    };

    // Call the service method and expect it to throw
    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow("Equipment ID is required and must be a valid string");

    // Verify the repository methods were not called
    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(mockRepository.updateMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw error if modifiedBy is not a number", async () => {
    // Mock data - invalid modifiedBy
    const id = "test-id-123";
    const updateData = {
      name: "Updated Equipment",
      modifiedBy: "not-a-number", // Invalid type
    } as unknown as UpdateMedicalEquipmentDTO;

    // Call the service method and expect it to throw
    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow("modifiedBy is required and must be a number");

    // Verify the repository methods were not called
    expect(mockRepository.findById).not.toHaveBeenCalled();
    expect(mockRepository.updateMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should throw error if equipment is not found", async () => {
    // Mock data
    const id = "non-existent-id";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: 2,
    };

    // Setup mock implementation to return null (not found)
    mockRepository.findById.mockResolvedValue(null);

    // Call the service method and expect it to throw
    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow("Medical equipment not found");

    // Verify only findById was called, but not updateMedicalEquipment
    expect(mockRepository.findById).toHaveBeenCalledWith(id);
    expect(mockRepository.updateMedicalEquipment).not.toHaveBeenCalled();
  });

  it("should handle repository errors during update", async () => {
    // Mock data
    const id = "test-id-123";
    const updateData: UpdateMedicalEquipmentDTO = {
      name: "Updated Equipment",
      modifiedBy: 2,
    };

    const existingEquipment = {
      id,
      inventorisId: "INV123",
      name: "Original Equipment",
      brandName: "Original Brand",
      modelName: "Original Model",
    };

    // Setup mock implementations
    mockRepository.findById.mockResolvedValue(existingEquipment);

    // Mock repository update to throw error
    const dbError = new Error("Database update error");
    mockRepository.updateMedicalEquipment.mockRejectedValue(dbError);

    // Call the service method and expect it to throw
    await expect(
      service.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow(dbError);

    // Verify both methods were called
    expect(mockRepository.findById).toHaveBeenCalledWith(id);
    expect(mockRepository.updateMedicalEquipment).toHaveBeenCalledWith(id, {
      ...updateData,
      modifiedOn: expect.any(Date),
    });
  });
});
