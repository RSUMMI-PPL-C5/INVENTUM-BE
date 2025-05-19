import MedicalEquipmentService from "../../../../src/services/medical-equipment.service";
import AppError from "../../../../src/utils/appError";
import { MedicalEquipmentFilterOptions } from "../../../../src/interfaces/medical-equipment.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import { MedicalEquipmentDTO } from "../../../../src/dto/medical-equipment.dto";

describe("MedicalEquipmentService - Get Methods", () => {
  let service: MedicalEquipmentService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      getMedicalEquipment: jest.fn(),
      getMedicalEquipmentById: jest.fn(),
    };

    service = new MedicalEquipmentService();
    (service as any).medicalEquipmentRepository = mockRepository;
  });

  describe("getMedicalEquipment", () => {
    it("should return equipment list with metadata - no parameters", async () => {
      // Arrange
      const mockEquipments = [
        { id: "1", name: "Equipment 1", status: "Active" },
        { id: "2", name: "Equipment 2", status: "Maintenance" },
      ];

      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: mockEquipments,
        total: 2,
      });

      // Act
      const result = await service.getMedicalEquipment();

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        data: mockEquipments,
        meta: {
          total: 2,
          page: 1,
          limit: 2,
          totalPages: 1,
        },
      });
    });

    it("should apply search parameter", async () => {
      // Arrange
      const search = "test";
      const mockEquipments = [
        { id: "1", name: "Test Equipment", status: "Active" },
      ];

      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: mockEquipments,
        total: 1,
      });

      // Act
      const result = await service.getMedicalEquipment(search);

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalledWith(
        search,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        data: mockEquipments,
        meta: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        },
      });
    });

    it("should apply filters", async () => {
      // Arrange
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active"],
      };

      const mockEquipments = [
        { id: "1", name: "Equipment 1", status: "Active" },
        { id: "3", name: "Equipment 3", status: "Active" },
      ];

      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: mockEquipments,
        total: 2,
      });

      // Act
      const result = await service.getMedicalEquipment(undefined, filters);

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalledWith(
        undefined,
        filters,
        undefined,
      );
      expect(result.data).toEqual(mockEquipments);
      expect(result.meta.total).toBe(2);
    });

    it("should apply pagination and calculate total pages correctly", async () => {
      // Arrange
      const pagination: PaginationOptions = {
        page: 2,
        limit: 10,
      };

      const mockEquipments = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `${i + 11}`,
          name: `Equipment ${i + 11}`,
        }));

      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: mockEquipments,
        total: 25,
      });

      // Act
      const result = await service.getMedicalEquipment(
        undefined,
        undefined,
        pagination,
      );

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalledWith(
        undefined,
        undefined,
        pagination,
      );
      expect(result).toEqual({
        data: mockEquipments,
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3, // Ceil(25/10) = 3
        },
      });
    });

    it("should combine search, filters and pagination", async () => {
      // Arrange
      const search = "test";
      const filters: MedicalEquipmentFilterOptions = {
        status: ["Active"],
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 5,
      };

      const mockEquipments = [
        { id: "1", name: "Test Equipment 1", status: "Active" },
      ];

      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: mockEquipments,
        total: 1,
      });

      // Act
      const result = await service.getMedicalEquipment(
        search,
        filters,
        pagination,
      );

      // Assert
      expect(mockRepository.getMedicalEquipment).toHaveBeenCalledWith(
        search,
        filters,
        pagination,
      );
      expect(result).toEqual({
        data: mockEquipments,
        meta: {
          total: 1,
          page: 1,
          limit: 5,
          totalPages: 1,
        },
      });
    });

    it("should handle empty results", async () => {
      // Arrange
      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: [],
        total: 0,
      });

      // Act
      const result = await service.getMedicalEquipment();

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 0,
          totalPages: 1,
        },
      });
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockRepository.getMedicalEquipment.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getMedicalEquipment()).rejects.toThrow(
        "Database error",
      );
    });

    it("should handle last page with fewer items than limit", async () => {
      // Arrange
      const pagination: PaginationOptions = {
        page: 3,
        limit: 10,
      };

      const mockEquipments = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `${i + 21}`,
          name: `Equipment ${i + 21}`,
        }));

      mockRepository.getMedicalEquipment.mockResolvedValue({
        equipments: mockEquipments,
        total: 25,
      });

      // Act
      const result = await service.getMedicalEquipment(
        undefined,
        undefined,
        pagination,
      );

      // Assert
      expect(result).toEqual({
        data: mockEquipments,
        meta: {
          total: 25,
          page: 3,
          limit: 10,
          totalPages: 3,
        },
      });
    });
  });

  describe("getMedicalEquipmentById", () => {
    it("should return equipment when found by ID", async () => {
      // Arrange
      const id = "valid-id";
      const mockEquipment: MedicalEquipmentDTO = {
        id,
        name: "Test Equipment",
        inventorisId: "INV001",
        brandName: "Brand A",
        modelName: "Model X",
        purchaseDate: new Date("2022-01-01"),
        purchasePrice: 1000,
        status: "Active",
        vendor: "Vendor A",
        lastLocation: "Room 101",
        createdBy: "user-123",
        createdOn: new Date(),
        modifiedOn: new Date(),
        modifiedBy: "user-456",
        deletedOn: null,
        deletedBy: null,
      };

      mockRepository.getMedicalEquipmentById.mockResolvedValue(mockEquipment);

      // Act
      const result = await service.getMedicalEquipmentById(id);

      // Assert
      expect(mockRepository.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockEquipment);
    });

    it("should return null when equipment not found", async () => {
      // Arrange
      const id = "non-existent-id";
      mockRepository.getMedicalEquipmentById.mockResolvedValue(null);

      // Act
      const result = await service.getMedicalEquipmentById(id);

      // Assert
      expect(mockRepository.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });

    it("should throw error when id is empty", async () => {
      // Act & Assert
      await expect(service.getMedicalEquipmentById("")).rejects.toThrow(
        new AppError(
          "Equipment ID is required and must be a valid string",
          400,
        ),
      );
      expect(mockRepository.getMedicalEquipmentById).not.toHaveBeenCalled();
    });

    it("should throw error when id is whitespace", async () => {
      // Act & Assert
      await expect(service.getMedicalEquipmentById("   ")).rejects.toThrow(
        new AppError(
          "Equipment ID is required and must be a valid string",
          400,
        ),
      );
      expect(mockRepository.getMedicalEquipmentById).not.toHaveBeenCalled();
    });

    it("should throw error when repository throws an error", async () => {
      // Arrange
      const id = "error-id";
      const error = new Error("Database error");
      mockRepository.getMedicalEquipmentById.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getMedicalEquipmentById(id)).rejects.toThrow(
        "Database error",
      );
      expect(mockRepository.getMedicalEquipmentById).toHaveBeenCalledWith(id);
    });
  });
});
