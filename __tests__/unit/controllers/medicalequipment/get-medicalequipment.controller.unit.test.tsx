import { Request, Response } from "express";
import MedicalequipmentController from "../../../../src/controllers/medicalequipment.controller";
import MedicalequipmentService from "../../../../src/services/medicalequipment.service";
import { validationResult } from "express-validator";
import { hasFilters } from "../../../../src/filters/medicalequipment.filter";

// Mock dependencies
jest.mock("../../../../src/services/medicalequipment.service");
jest.mock("express-validator");
jest.mock("../../../../src/filters/medicalequipment.filter");

describe("MedicalequipmentController", () => {
  let controller: MedicalequipmentController;
  let mockService: jest.Mocked<MedicalequipmentService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockService =
      new MedicalequipmentService() as jest.Mocked<MedicalequipmentService>;
    controller = new MedicalequipmentController();
    // @ts-ignore - Replace the service with our mock
    controller["medicalequipmentService"] = mockService;

    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      query: {},
      params: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    // Default mock for validationResult
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
    });

    // Default mock for hasFilters
    (hasFilters as jest.Mock).mockReturnValue(false);
  });

  describe("getMedicalEquipment", () => {
    // Positive test cases
    it("should return search results when search parameter is provided", async () => {
      // Arrange
      const searchResults = [{ id: "1", name: "Stetoskop" }];
      mockRequest.query = { search: "Stetoskop" };
      mockService.searchMedicalEquipment = jest
        .fn()
        .mockResolvedValue(searchResults);

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.searchMedicalEquipment).toHaveBeenCalledWith(
        "Stetoskop",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(searchResults);
    });

    it("should return filtered results when filters are provided", async () => {
      // Arrange
      const filteredResults = [{ id: "1", name: "MRI", status: "Active" }];
      mockRequest.query = { status: "Active" };
      (hasFilters as jest.Mock).mockReturnValue(true);
      mockService.getFilteredMedicalEquipment = jest
        .fn()
        .mockResolvedValue(filteredResults);

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(hasFilters).toHaveBeenCalledWith(mockRequest.query);
      expect(mockService.getFilteredMedicalEquipment).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(filteredResults);
    });

    it("should return all medical equipment when no search or filters are provided", async () => {
      // Arrange
      const allResults = [
        { id: "1", name: "MRI" },
        { id: "2", name: "Stetoskop" },
      ];
      mockService.getMedicalEquipment = jest.fn().mockResolvedValue(allResults);

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.getMedicalEquipment).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(allResults);
    });

    // Negative test cases
    it("should return 400 when validation fails", async () => {
      // Arrange
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
      });

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid input data",
      });
    });

    it("should return 500 when service throws an error", async () => {
      // Arrange
      const errorMessage = "Database connection error";
      mockService.getMedicalEquipment = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    // Corner cases
    it("should handle empty search string", async () => {
      // Arrange
      mockRequest.query = { search: "" };
      const searchResults: { id: string; name: string }[] = [];
      mockService.searchMedicalEquipment = jest
        .fn()
        .mockResolvedValue(searchResults);

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.searchMedicalEquipment).toHaveBeenCalledWith("");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(searchResults);
    });

    it("should ignore search parameter if not a string", async () => {
      // Arrange
      mockRequest.query = { search: ["multiple", "values"] };
      const allResults = [{ id: "1", name: "MRI" }];
      mockService.getMedicalEquipment = jest.fn().mockResolvedValue(allResults);

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.searchMedicalEquipment).not.toHaveBeenCalled();
      expect(mockService.getMedicalEquipment).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should handle search service throwing an error", async () => {
      // Arrange
      mockRequest.query = { search: "ErrorTrigger" };
      const errorMessage = "Search service error";
      mockService.searchMedicalEquipment = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act
      await controller.getMedicalEquipment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getMedicalEquipmentById", () => {
    // Positive test case
    it("should return medical equipment when found by ID", async () => {
      // Arrange
      const id = "valid-id";
      const equipment = { id, name: "Stetoskop" };
      mockRequest.params = { id };
      mockService.getMedicalEquipmentById = jest
        .fn()
        .mockResolvedValue(equipment);

      // Act
      await controller.getMedicalEquipmentById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(equipment);
    });

    // Negative test case
    it("should return 404 when equipment not found by ID", async () => {
      // Arrange
      const id = "non-existent-id";
      mockRequest.params = { id };
      mockService.getMedicalEquipmentById = jest.fn().mockResolvedValue(null);

      // Act
      await controller.getMedicalEquipmentById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Medical Equipment not found",
      });
    });

    // Corner case
    it("should return 500 when service throws an error", async () => {
      // Arrange
      const id = "error-id";
      const errorMessage = "Database query error";
      mockRequest.params = { id };
      mockService.getMedicalEquipmentById = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act
      await controller.getMedicalEquipmentById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockService.getMedicalEquipmentById).toHaveBeenCalledWith(id);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
