import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";
import { validationResult } from "express-validator";
import AppError from "../../../../src/utils/appError";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";

jest.mock("../../../../src/services/sparepart.service");
jest.mock("express-validator");

// Factory function to create SparepartDTO objects
const createSparepart = (
  id: string,
  partsName: string,
  price: number
): SparepartDTO => ({
  id,
  partsName,
  purchaseDate: null,
  price,
  toolLocation: null,
  toolDate: null,
  createdBy: "user123",
  createdOn: new Date(),
  modifiedBy: null,
  modifiedOn: new Date(),
  deletedBy: null,
  deletedOn: null,
});

describe("SparepartController - GET Methods", () => {
  let sparepartController: SparepartController;
  let mockSparepartService: jest.Mocked<SparepartService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSparepartService = new SparepartService() as jest.Mocked<SparepartService>;
    sparepartController = new SparepartController();
    (sparepartController as any).sparepartService = mockSparepartService;

    mockRequest = {
      query: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    });
  });

  describe("getSpareparts", () => {
    it("should return spareparts with default pagination", async () => {
      const mockResult = {
        data: [
          createSparepart("1", "Part 1", 100),
          createSparepart("2", "Part 2", 200),
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockSparepartService.getSpareparts.mockResolvedValue(mockResult);

      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSparepartService.getSpareparts).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle search and filters", async () => {
      mockRequest.query = { search: "test", toolLocation: "Warehouse A" };

      const mockResult = {
        data: [createSparepart("1", "Test Part", 150)],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockSparepartService.getSpareparts.mockResolvedValue(mockResult);

      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSparepartService.getSpareparts).toHaveBeenCalledWith(
        "test",
        expect.objectContaining({ toolLocation: "Warehouse A" }),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should use default pagination values if page and limit are not provided", async () => {
      const mockResult = {
        data: [createSparepart("1", "Part 1", 100)],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
  
      mockSparepartService.getSpareparts.mockResolvedValue(mockResult);
  
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
  
      expect(mockSparepartService.getSpareparts).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  
    it("should parse page and limit from query parameters", async () => {
      mockRequest.query = { page: "2", limit: "5" };
  
      const mockResult = {
        data: [createSparepart("1", "Part 1", 100)],
        meta: {
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      };
  
      mockSparepartService.getSpareparts.mockResolvedValue(mockResult);
  
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
  
      expect(mockSparepartService.getSpareparts).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 2, limit: 5 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  
    it("should use default values if page or limit are invalid", async () => {
      mockRequest.query = { page: "-1", limit: "0" };
  
      const mockResult = {
        data: [createSparepart("1", "Part 1", 100)],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
  
      mockSparepartService.getSpareparts.mockResolvedValue(mockResult);
  
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
  
      expect(mockSparepartService.getSpareparts).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  
    it("should handle non-numeric page and limit values", async () => {
      mockRequest.query = { page: "abc", limit: "xyz" };
  
      const mockResult = {
        data: [createSparepart("1", "Part 1", 100)],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
  
      mockSparepartService.getSpareparts.mockResolvedValue(mockResult);
  
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
  
      expect(mockSparepartService.getSpareparts).toHaveBeenCalledWith(
        undefined,
        expect.any(Object),
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle AppError correctly", async () => {
      const appError = new AppError("Invalid filter parameter", 400);
      mockSparepartService.getSpareparts.mockRejectedValue(appError);

      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 400,
        message: "Invalid filter parameter",
      });
    });

    it("should handle general errors with 500 status", async () => {
      mockSparepartService.getSpareparts.mockRejectedValue(
        new Error("Database error")
      );

      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "Database error",
      });
    });
  });

  describe("getSparepartById", () => {
    it("should return a sparepart by ID with status 200", async () => {
      const mockSparepart = createSparepart("1", "Test Part", 100);

      mockRequest.params = { id: "1" };
      mockSparepartService.getSparepartById.mockResolvedValue(mockSparepart);

      await sparepartController.getSparepartById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSparepartService.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockSparepart,
      });
    });

    it("should return 404 if sparepart not found", async () => {
      mockRequest.params = { id: "1" };
      mockSparepartService.getSparepartById.mockResolvedValue(null);

      await sparepartController.getSparepartById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSparepartService.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Sparepart not found",
      });
    });

    it("should handle AppError correctly", async () => {
      const appError = new AppError("Invalid ID", 400);
      mockSparepartService.getSparepartById.mockRejectedValue(appError);

      await sparepartController.getSparepartById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid ID",
      });
    });

    it("should return 500 with the error message if an Error instance is thrown", async () => {
      const errorMessage = "Unexpected server error";
      const error = new Error(errorMessage);
    
      mockSparepartService.getSpareparts.mockRejectedValue(error);
    
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
    
      expect(mockSparepartService.getSpareparts).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: errorMessage,
      });
    });

    it("should return 500 with 'An unknown error occurred' if an unknown error is thrown", async () => {
      mockRequest.params = { id: "1" };
    
      mockSparepartService.getSparepartById.mockRejectedValue("Unknown error");
    
      await sparepartController.getSparepartById(
        mockRequest as Request,
        mockResponse as Response
      );
    
      expect(mockSparepartService.getSparepartById).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "An unknown error occurred",
      });
    });

    it("should return 500 with error.message if error is an instance of Error", async () => {
      const errorMessage = "Some server error";
      mockSparepartService.getSpareparts.mockRejectedValue(new Error(errorMessage));
    
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
    
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: errorMessage,
      });
    });
    
    it("should return 500 with 'An unknown error occurred' if error is not an instance of Error", async () => {
      mockSparepartService.getSpareparts.mockRejectedValue("Totally unknown error");
    
      await sparepartController.getSpareparts(
        mockRequest as Request,
        mockResponse as Response
      );
    
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: "An unknown error occurred",
      });
    });

    it("should handle general errors with 500 status", async () => {
      mockSparepartService.getSparepartById.mockRejectedValue(
        new Error("Database error")
      );

      await sparepartController.getSparepartById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Database error",
      });
    });
  });
});