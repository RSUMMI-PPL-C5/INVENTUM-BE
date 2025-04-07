import MedicalEquipmentRepository from "../../../../src/repository/medicalequipment.repository";
import prisma from "../../../../src/configs/db.config";

// Mock the prisma client
jest.mock("../../../../src/configs/db.config", () => ({
  medicalEquipment: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe("MedicalEquipmentRepository - updateMedicalEquipment", () => {
  let repository: MedicalEquipmentRepository;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create repository instance
    repository = new MedicalEquipmentRepository();
  });

  it("should update medical equipment and return updated data", async () => {
    // Mock data
    const id = "test-id-123";
    const updateData = {
      name: "Updated Equipment",
      brandName: "Updated Brand",
      modelName: "Updated Model",
    };

    const mockUpdatedEquipment = {
      id,
      inventorisId: "INV123",
      name: "Updated Equipment",
      brandName: "Updated Brand",
      modelName: "Updated Model",
    };

    // Setup mock implementation
    (mockPrisma.medicalEquipment.update as jest.Mock).mockResolvedValue(
      mockUpdatedEquipment,
    );

    // Call the repository method
    const result = await repository.updateMedicalEquipment(id, updateData);

    // Assertions
    expect(mockPrisma.medicalEquipment.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });
    expect(result).toEqual(mockUpdatedEquipment);
  });

  it("should handle null brandName and modelName in response", async () => {
    // Mock data
    const id = "test-id-123";
    const updateData = {
      name: "Updated Equipment",
    };

    const mockResponse = {
      id,
      inventorisId: "INV123",
      name: "Updated Equipment",
      brandName: null,
      modelName: null,
    };

    // Setup mock implementation
    (mockPrisma.medicalEquipment.update as jest.Mock).mockResolvedValue(
      mockResponse,
    );

    // Call the repository method
    const result = await repository.updateMedicalEquipment(id, updateData);

    // Assertions
    expect(mockPrisma.medicalEquipment.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });

    // Verify that null values are converted to undefined
    expect(result).toEqual({
      ...mockResponse,
      brandName: undefined,
      modelName: undefined,
    });
  });

  it("should propagate errors from the database", async () => {
    // Mock data
    const id = "test-id-123";
    const updateData = {
      name: "Updated Equipment",
    };

    // Setup mock implementation to throw an error
    const dbError = new Error("Database error");
    (mockPrisma.medicalEquipment.update as jest.Mock).mockRejectedValue(
      dbError,
    );

    // Call the repository method and expect it to throw
    await expect(
      repository.updateMedicalEquipment(id, updateData),
    ).rejects.toThrow(dbError);

    // Verify the call was made
    expect(mockPrisma.medicalEquipment.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });
  });

  it("should test findById method for equipment existence check", async () => {
    // Mock data
    const id = "test-id-123";
    const mockEquipment = {
      id,
      inventorisId: "INV123",
      name: "Test Equipment",
      brandName: "Test Brand",
      modelName: "Test Model",
    };

    // Setup mock implementation
    (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(
      mockEquipment,
    );

    // Call the repository method
    const result = await repository.findById(id);

    // Assertions
    expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
      where: { id },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });
    expect(result).toEqual(mockEquipment);
  });

  it("should return null when equipment is not found by id", async () => {
    // Mock data
    const id = "non-existent-id";

    // Setup mock implementation
    (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(
      null,
    );

    // Call the repository method
    const result = await repository.findById(id);

    // Assertions
    expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
      where: { id },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });
    expect(result).toBeNull();
  });
});
