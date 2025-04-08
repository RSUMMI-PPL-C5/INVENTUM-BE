import MedicalEquipmentRepository from "../../../../src/repository/medicalequipment.repository";
import prisma from "../../../../src/configs/db.config";

// Mock the prisma client
jest.mock("../../../../src/configs/db.config", () => ({
  medicalEquipment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe("MedicalEquipmentRepository", () => {
  let repository: MedicalEquipmentRepository;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create repository instance
    repository = new MedicalEquipmentRepository();
  });

  describe("addMedicalEquipment", () => {
    it("should create medical equipment and return created data", async () => {
      // Mock data
      const equipmentData = {
        inventorisId: "INV123",
        name: "New Equipment",
        brandName: "New Brand",
        modelName: "New Model",
      };

      const mockCreatedEquipment = {
        id: "test-id-123",
        ...equipmentData,
      };

      // Setup mock implementation
      (mockPrisma.medicalEquipment.create as jest.Mock).mockResolvedValue(
        mockCreatedEquipment,
      );

      // Call the repository method
      const result = await repository.addMedicalEquipment(equipmentData);

      // Assertions
      expect(mockPrisma.medicalEquipment.create).toHaveBeenCalledWith({
        data: equipmentData,
        select: {
          id: true,
          inventorisId: true,
          name: true,
          brandName: true,
          modelName: true,
        },
      });
      expect(result).toEqual(mockCreatedEquipment);
    });

    it("should handle null brandName and modelName when creating equipment", async () => {
      // Mock data
      const equipmentData = {
        inventorisId: "INV456",
        name: "New Equipment Without Brand and Model",
      };

      const mockCreatedEquipment = {
        id: "test-id-456",
        ...equipmentData,
        brandName: null,
        modelName: null,
      };

      // Setup mock implementation
      (mockPrisma.medicalEquipment.create as jest.Mock).mockResolvedValue(
        mockCreatedEquipment,
      );

      // Call the repository method
      const result = await repository.addMedicalEquipment(equipmentData);

      // Assertions
      expect(mockPrisma.medicalEquipment.create).toHaveBeenCalledWith({
        data: equipmentData,
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
        ...mockCreatedEquipment,
        brandName: undefined,
        modelName: undefined,
      });
    });

    it("should propagate errors from the database when creating equipment", async () => {
      // Mock data
      const equipmentData = {
        inventorisId: "INV789",
        name: "Problematic Equipment",
      };

      // Setup mock implementation to throw an error
      const dbError = new Error("Database error");
      (mockPrisma.medicalEquipment.create as jest.Mock).mockRejectedValue(
        dbError,
      );

      // Call the repository method and expect it to throw
      await expect(
        repository.addMedicalEquipment(equipmentData),
      ).rejects.toThrow(dbError);

      // Verify the call was made
      expect(mockPrisma.medicalEquipment.create).toHaveBeenCalledWith({
        data: equipmentData,
        select: {
          id: true,
          inventorisId: true,
          name: true,
          brandName: true,
          modelName: true,
        },
      });
    });
  });

  describe("findByInventorisId", () => {
    it("should find medical equipment by inventorisId and return data", async () => {
      // Mock data
      const inventorisId = "INV123";
      const mockEquipment = {
        id: "test-id-123",
        inventorisId,
        name: "Test Equipment",
        brandName: "Test Brand",
        modelName: "Test Model",
      };

      // Setup mock implementation
      (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(
        mockEquipment,
      );

      // Call the repository method
      const result = await repository.findByInventorisId(inventorisId);

      // Assertions
      expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
        where: { inventorisId },
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

    it("should return null when equipment is not found by inventorisId", async () => {
      // Mock data
      const inventorisId = "non-existent-id";

      // Setup mock implementation
      (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      // Call the repository method
      const result = await repository.findByInventorisId(inventorisId);

      // Assertions
      expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
        where: { inventorisId },
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

    it("should handle null brandName and modelName when finding by inventorisId", async () => {
      // Mock data
      const inventorisId = "INV456";
      const mockEquipment = {
        id: "test-id-456",
        inventorisId,
        name: "Test Equipment",
        brandName: null,
        modelName: null,
      };

      // Setup mock implementation
      (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(
        mockEquipment,
      );

      // Call the repository method
      const result = await repository.findByInventorisId(inventorisId);

      // Assertions
      expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
        where: { inventorisId },
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
        ...mockEquipment,
        brandName: undefined,
        modelName: undefined,
      });
    });
  });

  describe("findById", () => {
    it("should find medical equipment by id and return data", async () => {
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

    it("should handle null brandName and modelName when finding by id", async () => {
      // Mock data
      const id = "test-id-456";
      const mockEquipment = {
        id,
        inventorisId: "INV456",
        name: "Test Equipment",
        brandName: null,
        modelName: null,
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

      // Verify that null values are converted to undefined
      expect(result).toEqual({
        ...mockEquipment,
        brandName: undefined,
        modelName: undefined,
      });
    });
  });

  describe("updateMedicalEquipment", () => {
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
  });
});
