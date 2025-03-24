import { Request, Response } from "express";
import DivisionController from "../../../../src/controllers/division.controller";
import DivisionService from "../../../../src/services/division.service";

// Mock the DivisionService
jest.mock("../../../../src/services/division.service");

describe("DivisionController", () => {
  let divisionController: DivisionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDivisionService: jest.Mocked<DivisionService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock response object with spies
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock request object
    mockRequest = {};

    // Setup service mock
    mockDivisionService = new DivisionService() as jest.Mocked<DivisionService>;
    (DivisionService as jest.Mock).mockImplementation(
      () => mockDivisionService,
    );

    // Create controller instance
    divisionController = new DivisionController();
  });

  describe("getDivisionsTree", () => {
    it("should return divisions hierarchy with 200 status code", async () => {
      // Arrange
      const mockHierarchy = [
        { id: 1, divisi: "Engineering", parentId: null, children: [] },
      ];
      mockDivisionService.getDivisionsHierarchy = jest
        .fn()
        .mockResolvedValue(mockHierarchy);

      // Act
      await divisionController.getDivisionsTree(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDivisionService.getDivisionsHierarchy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockHierarchy);
    });

    it("should handle errors and return 500 status code", async () => {
      // Arrange
      const errorMessage = "Service error";
      mockDivisionService.getDivisionsHierarchy = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act
      await divisionController.getDivisionsTree(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDivisionService.getDivisionsHierarchy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getAllDivisions", () => {
    it("should return all divisions with 200 status code", async () => {
      // Arrange
      const mockDivisions = [{ id: 1, divisi: "Engineering", parentId: null }];
      mockDivisionService.getAllDivisions = jest
        .fn()
        .mockResolvedValue(mockDivisions);

      // Act
      await divisionController.getAllDivisions(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDivisionService.getAllDivisions).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDivisions);
    });

    it("should handle errors and return 500 status code", async () => {
      // Arrange
      const errorMessage = "Service error";
      mockDivisionService.getAllDivisions = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act
      await divisionController.getAllDivisions(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDivisionService.getAllDivisions).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("getDivisionsWithUserCount", () => {
    it("should return divisions with user count and 200 status code", async () => {
      // Arrange
      const mockDivisionsWithCount = [
        { id: 1, divisi: "Engineering", parentId: null, userCount: 5 },
      ];
      mockDivisionService.getDivisionsWithUserCount = jest
        .fn()
        .mockResolvedValue(mockDivisionsWithCount);

      // Act
      await divisionController.getDivisionsWithUserCount(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDivisionService.getDivisionsWithUserCount).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDivisionsWithCount);
    });

    it("should handle errors and return 500 status code", async () => {
      // Arrange
      const errorMessage = "Service error";
      mockDivisionService.getDivisionsWithUserCount = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // Act
      await divisionController.getDivisionsWithUserCount(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(mockDivisionService.getDivisionsWithUserCount).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
