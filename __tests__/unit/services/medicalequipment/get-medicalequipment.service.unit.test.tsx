import { Prisma } from "@prisma/client";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import MedicalEquipmentRepository from "../../../../src/repository/medicalequipment.repository";
import { MedicalEquipmentFilterOptions } from "../../../../src/filters/interface/medicalequipment.filter.interface";
import { filterHandlers } from "../../../../src/filters/medicalequipment.filter";

// Mock dependencies
jest.mock("../../../../src/repository/medicalequipment.repository");
jest.mock("../../../../src/filters/medicalequipment.filter", () => ({
  filterHandlers: [jest.fn()],
}));

describe("MedicalEquipmentService", () => {
  let service: MedicalEquipmentService;
  let mockRepository: jest.Mocked<MedicalEquipmentRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository =
      new MedicalEquipmentRepository() as jest.Mocked<MedicalEquipmentRepository>;
    service = new MedicalEquipmentService();
    // @ts-ignore - Replace repository with our mock
    service["medicalEquipmentRepository"] = mockRepository;
  });

  describe("getMedicalEquipment", () => {
    // Positive test case
    it("should return all medical equipment", async () => {
      // Arrange
      const mockData = [
        { id: "1", name: "Stetoskop" },
        { id: "2", name: "MRI Machine" },
      ];
      mockRepository.getMedicalEquipment = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.getMedicalEquipment();

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it("should throw error when repository throws an error", async () => {
      // Arrange
      const error = new Error("Database error");
      mockRepository.getMedicalEquipment = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(service.getMedicalEquipment()).rejects.toThrow(error);
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalled();
    });

    // Corner case
    it("should return empty array when no equipment exists", async () => {
      // Arrange
      mockRepository.getMedicalEquipment = jest.fn().mockResolvedValue([]);

      // Act
      const result = await service.getMedicalEquipment();

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("getMedicalEquipmentById", () => {
    // Positive test case
    it("should return equipment when found by ID", async () => {
      // Arrange
      const id = "valid-id";
      const mockData = { id, name: "Stetoskop" };
      mockRepository.getMedicalEquipmentById = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.getMedicalEquipmentById(id);

      // Assert
      expect(mockRepository.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it("should return null when equipment not found by ID", async () => {
      // Arrange
      const id = "non-existent-id";
      mockRepository.getMedicalEquipmentById = jest
        .fn()
        .mockResolvedValue(null);

      // Act
      const result = await service.getMedicalEquipmentById(id);

      // Assert
      expect(mockRepository.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });

    // Error case
    it("should throw error when repository throws an error", async () => {
      // Arrange
      const id = "error-id";
      const error = new Error("Database error");
      mockRepository.getMedicalEquipmentById = jest
        .fn()
        .mockRejectedValue(error);

      // Act & Assert
      await expect(service.getMedicalEquipmentById(id)).rejects.toThrow(error);
      expect(mockRepository.getMedicalEquipmentById).toHaveBeenCalledWith(id);
    });
  });

  describe("getFilteredMedicalEquipment", () => {
    // Positive test case
    it("should return filtered equipment", async () => {
      // Arrange
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active"],
      };
      const whereClause = { status: "Active" };
      const mockData = [{ id: "1", name: "Stetoskop", status: "Active" }];
      mockRepository.getFilteredMedicalEquipment = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.getFilteredMedicalEquipment(filters);

      // Assert
      expect(filterHandlers[0]).toHaveBeenCalledWith(
        filters,
        expect.any(Object),
      );
      expect(mockRepository.getFilteredMedicalEquipment).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    // Complex filters test case
    it("should handle complex filters", async () => {
      // Arrange
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active"],
        purchaseDateStart: new Date("2023-01-01"),
        purchaseDateEnd: new Date("2023-12-31"),
      };
      const mockData = [{ id: "1", name: "Stetoskop", status: "Active" }];
      mockRepository.getFilteredMedicalEquipment = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.getFilteredMedicalEquipment(filters);

      // Assert
      expect(filterHandlers[0]).toHaveBeenCalledWith(
        filters,
        expect.any(Object),
      );
      expect(mockRepository.getFilteredMedicalEquipment).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it("should throw error when repository throws an error", async () => {
      // Arrange
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active"],
      };
      const error = new Error("Filter error");
      mockRepository.getFilteredMedicalEquipment = jest
        .fn()
        .mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.getFilteredMedicalEquipment(filters),
      ).rejects.toThrow(error);
      expect(mockRepository.getFilteredMedicalEquipment).toHaveBeenCalled();
    });

    // Corner case - empty filters
    it("should handle empty filters object", async () => {
      // Arrange
      const filters: MedicalEquipmentFilterOptions = {};
      const mockData = [
        { id: "1", name: "Stetoskop" },
        { id: "2", name: "MRI Machine" },
      ];
      mockRepository.getFilteredMedicalEquipment = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.getFilteredMedicalEquipment(filters);

      // Assert
      expect(filterHandlers[0]).toHaveBeenCalledWith(
        filters,
        expect.any(Object),
      );
      expect(mockRepository.getFilteredMedicalEquipment).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("searchMedicalEquipment", () => {
    // Positive test case
    it("should return equipment matching the name search", async () => {
      // Arrange
      const name = "Stetoskop";
      const mockData = [{ id: "1", name: "Stetoskop" }];
      mockRepository.getMedicalEquipmentByName = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.searchMedicalEquipment(name);

      // Assert
      expect(mockRepository.getMedicalEquipmentByName).toHaveBeenCalledWith(
        name,
      );
      expect(result).toEqual(mockData);
    });

    // Trim test case
    it("should trim the search string", async () => {
      // Arrange
      const name = "  Stetoskop  ";
      const trimmedName = "Stetoskop";
      const mockData = [{ id: "1", name: "Stetoskop" }];
      mockRepository.getMedicalEquipmentByName = jest
        .fn()
        .mockResolvedValue(mockData);

      // Act
      const result = await service.searchMedicalEquipment(name);

      // Assert
      expect(mockRepository.getMedicalEquipmentByName).toHaveBeenCalledWith(
        trimmedName,
      );
      expect(result).toEqual(mockData);
    });

    // Negative test cases - invalid search parameters
    it("should throw error when name is empty string", async () => {
      // Arrange
      const name = "";

      // Act & Assert
      await expect(service.searchMedicalEquipment(name)).rejects.toThrow(
        "Name query is required",
      );
      expect(mockRepository.getMedicalEquipmentByName).not.toHaveBeenCalled();
    });

    it("should throw error when name is only whitespace", async () => {
      // Arrange
      const name = "   ";

      // Act & Assert
      await expect(service.searchMedicalEquipment(name)).rejects.toThrow(
        "Name query is required",
      );
      expect(mockRepository.getMedicalEquipmentByName).not.toHaveBeenCalled();
    });

    it("should throw error when name is null", async () => {
      // Arrange
      const name = null as unknown as string;

      // Act & Assert
      await expect(service.searchMedicalEquipment(name)).rejects.toThrow(
        "Name query is required",
      );
      expect(mockRepository.getMedicalEquipmentByName).not.toHaveBeenCalled();
    });

    it("should throw error when name is undefined", async () => {
      // Arrange
      const name = undefined as unknown as string;

      // Act & Assert
      await expect(service.searchMedicalEquipment(name)).rejects.toThrow(
        "Name query is required",
      );
      expect(mockRepository.getMedicalEquipmentByName).not.toHaveBeenCalled();
    });

    // Error case from repository
    it("should throw error when repository throws an error", async () => {
      // Arrange
      const name = "Stetoskop";
      const error = new Error("Search error");
      mockRepository.getMedicalEquipmentByName = jest
        .fn()
        .mockRejectedValue(error);

      // Act & Assert
      await expect(service.searchMedicalEquipment(name)).rejects.toThrow(error);
      expect(mockRepository.getMedicalEquipmentByName).toHaveBeenCalledWith(
        name,
      );
    });

    // Corner case - no results
    it("should return empty array when no equipment matches search", async () => {
      // Arrange
      const name = "NonexistentEquipment";
      mockRepository.getMedicalEquipmentByName = jest
        .fn()
        .mockResolvedValue([]);

      // Act
      const result = await service.searchMedicalEquipment(name);

      // Assert
      expect(mockRepository.getMedicalEquipmentByName).toHaveBeenCalledWith(
        name,
      );
      expect(result).toEqual([]);
    });
  });
});
