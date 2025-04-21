import { Request, Response } from "express";
import MedicalEquipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalEquipmentService from "../../../../src/services/medicalequipment.service";
import { validationResult } from "express-validator";
import AppError from "../../../../src/utils/appError";
import { MedicalEquipmentDTO } from "../../../../src/dto/medicalequipment.dto";

jest.mock("../../../../src/services/medicalequipment.service");
jest.mock("express-validator");

const createMockEquipment = (id: string, name: string, status: string = "Active"): MedicalEquipmentDTO => ({
  id,
  name,
  status,
  inventorisId: `INV-${id}`,
  brandName: "Test Brand",
  modelName: "Test Model",
  purchaseDate: null,
  purchasePrice: null,
  vendor: null,
  createdBy: "user-123",
  createdOn: new Date(),
  modifiedBy: null,
  modifiedOn: new Date(),
  deletedBy: null,
  deletedOn: null
});

describe("MedicalEquipmentController - GET Methods", () => {
  let controller: MedicalEquipmentController;
  let mockService: jest.Mocked<MedicalEquipmentService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = new MedicalEquipmentService() as jest.Mocked<MedicalEquipmentService>;
    
    controller = new MedicalEquipmentController();
    (controller as any).medicalEquipmentService = mockService;
    
    mockRequest = {
      query: {},
      params: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Default mock for validation result - passes validation
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    });
  });

  describe("getMedicalEquipment", () => {
    it("should return equipment list with default pagination", async () => {
      // Arrange
      const mockEquipments = [
        createMockEquipment("1", "Equipment 1", "Active"),
        createMockEquipment("2", "Equipment 2", "Maintenance")
      ];
      
      const mockResult = {
        data: mockEquipments,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      mockService.getMedicalEquipment.mockResolvedValue(mockResult);

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.getMedicalEquipment).toHaveBeenCalledWith(
        undefined, 
        expect.any(Object), 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should use custom pagination parameters", async () => {
      // Arrange
      mockRequest.query = { page: "2", limit: "20" };
      
      const mockEquipments = Array(20).fill(null).map((_, i) => 
        createMockEquipment(`${i+21}`, `Equipment ${i+21}`)
      );
      
      const mockResult = {
        data: mockEquipments,
        meta: {
          total: 50,
          page: 2,
          limit: 20,
          totalPages: 3
        }
      };
      
      mockService.getMedicalEquipment.mockResolvedValue(mockResult);

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.getMedicalEquipment).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 2, limit: 20 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle search parameter", async () => {
      // Arrange
      mockRequest.query = { search: "test" };
      
      const mockEquipments = [
        createMockEquipment("1", "Test Equipment", "Active")
      ];
      
      const mockResult = {
        data: mockEquipments,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
      
      mockService.getMedicalEquipment.mockResolvedValue(mockResult);

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.getMedicalEquipment).toHaveBeenCalledWith(
        "test",
        expect.any(Object),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle filter parameters", async () => {
      // Arrange
      mockRequest.query = { status: ["Active"] };
      
      const mockEquipments = [
        createMockEquipment("1", "Equipment 1", "Active"),
        createMockEquipment("3", "Equipment 3", "Active")
      ];
      
      const mockResult = {
        data: mockEquipments,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
      mockService.getMedicalEquipment.mockResolvedValue(mockResult);

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.getMedicalEquipment).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ status: ["Active"] }),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 if validation fails", async () => {
      // Arrange
      const validationErrors = [
        { param: "limit", msg: "Limit must be a positive number" }
      ];
      
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(validationErrors),
      });

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        errors: validationErrors
      });
      expect(mockService.getMedicalEquipment).not.toHaveBeenCalled();
    });

    it("should handle AppError correctly", async () => {
      // Arrange
      const appError = new AppError("Invalid filter parameter", 400);
      mockService.getMedicalEquipment.mockRejectedValue(appError);

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 400,
        message: "Invalid filter parameter"
      });
    });

    it("should handle general errors with 500 status", async () => {
      // Arrange
      mockService.getMedicalEquipment.mockRejectedValue(new Error("Database error"));

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "Database error"
      });
    });

    it("should handle non-Error exceptions", async () => {
      // Arrange
      mockService.getMedicalEquipment.mockRejectedValue("Unknown error");

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "An unknown error occurred"
      });
    });

    it("should handle negative pagination values", async () => {
      // Arrange
      mockRequest.query = { page: "-1", limit: "-10" };
      
      const mockEquipments = [
        createMockEquipment("1", "Equipment 1")
      ];
      
      const mockResult = {
        data: mockEquipments,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
      
      mockService.getMedicalEquipment.mockResolvedValue(mockResult);

      // Act
      await controller.getMedicalEquipment(mockRequest as Request, mockResponse as Response);

      // Assert
      // Should default to page 1, limit 10
      expect(mockService.getMedicalEquipment).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 1, limit: 10 }
      );
    });
  });

  describe("getMedicalEquipmentById", () => {
    it("should return equipment when found", async () => {
      // Arrange
      const mockEquipment = createMockEquipment("test-id", "Test Equipment", "Active");
      
      mockRequest.params = { id: "test-id" };
      mockService.getMedicalEquipmentById.mockResolvedValue(mockEquipment);

      // Act
      await controller.getMedicalEquipmentById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.getMedicalEquipmentById).toHaveBeenCalledWith("test-id");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockEquipment
      });
    });

    it("should return 404 when equipment not found", async () => {
      // Arrange
      mockRequest.params = { id: "non-existent-id" };
      mockService.getMedicalEquipmentById.mockResolvedValue(null);

      // Act
      await controller.getMedicalEquipmentById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Medical Equipment not found"
      });
    });

    it("should handle AppError correctly", async () => {
      // Arrange
      mockRequest.params = { id: "invalid-id" };
      const appError = new AppError("Equipment ID is required", 400);
      mockService.getMedicalEquipmentById.mockRejectedValue(appError);

      // Act
      await controller.getMedicalEquipmentById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Equipment ID is required"
      });
    });

    it("should handle general errors with 500 status", async () => {
      // Arrange
      mockRequest.params = { id: "error-id" };
      mockService.getMedicalEquipmentById.mockRejectedValue(new Error("Database error"));

      // Act
      await controller.getMedicalEquipmentById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Database error"
      });
    });
    
    it("should handle non-Error exceptions with generic message", async () => {
      // Arrange
      mockRequest.params = { id: "weird-error-id" };
      mockService.getMedicalEquipmentById.mockRejectedValue("Some non-error exception");

      // Act
      await controller.getMedicalEquipmentById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "An unknown error occurred"
      });
    });
  });
});