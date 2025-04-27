import { Request, Response } from "express";
import RequestController from "../../../../src/controllers/request.controller";
import RequestService from "../../../../src/services/request.service";
import AppError from "../../../../src/utils/appError";

// Mock the service
jest.mock("../../../../src/services/request.service");

describe("RequestController", () => {
  let requestController: RequestController;
  let mockRequestService: jest.Mocked<RequestService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup response spies
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    // Setup mock response
    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };

    // Setup mock request
    mockRequest = {};

    // Initialize controller
    requestController = new RequestController();

    // Access and mock the service
    mockRequestService = (requestController as any)
      .requestService as jest.Mocked<RequestService>;
  });

  describe("getRequestById", () => {
    it("should get a request by ID successfully", async () => {
      // Setup mock data
      const requestId = "request-123";
      const mockData = {
        id: requestId,
        medicalEquipment: "Equipment Name",
        user: { fullname: "Test User" },
      };

      // Setup request
      mockRequest.params = { id: requestId };

      // Mock service response
      mockRequestService.getRequestById.mockResolvedValue(mockData as any);

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockRequestService.getRequestById).toHaveBeenCalledWith(requestId);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Request retrieved successfully",
        data: mockData,
      });
    });

    it("should return 400 if request ID is not provided", async () => {
      // Setup request without ID
      mockRequest.params = {};

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockRequestService.getRequestById).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required",
      });
    });

    it("should return 400 if request ID is an empty string", async () => {
      // Setup request with empty ID
      mockRequest.params = { id: "" };

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockRequestService.getRequestById).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required",
      });
    });

    // KEEP ONLY ONE WHITESPACE TEST THAT MATCHES CONTROLLER'S ACTUAL BEHAVIOR
    it("should handle whitespace IDs via the service", async () => {
      // Setup request with whitespace ID
      mockRequest.params = { id: "   " };

      // Mock service to throw an AppError for whitespace validation
      mockRequestService.getRequestById.mockRejectedValue(
        new AppError("Request ID is required and must be a valid string", 400),
      );

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions - now we expect the service to be called, but throw validation error
      expect(mockRequestService.getRequestById).toHaveBeenCalledWith("   ");
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required and must be a valid string",
      });
    });

    it("should handle AppError exceptions", async () => {
      // Setup request
      mockRequest.params = { id: "request-123" };

      // Mock service to throw AppError
      const appError = new AppError("Request not found", 404);
      mockRequestService.getRequestById.mockRejectedValue(appError);

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request not found",
      });
    });

    it("should handle generic errors", async () => {
      // Setup request
      mockRequest.params = { id: "request-123" };

      // Mock service to throw generic Error
      mockRequestService.getRequestById.mockRejectedValue(
        new Error("Service error"),
      );

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });

    it("should handle non-Error rejections", async () => {
      // Setup request
      mockRequest.params = { id: "request-123" };

      // Mock service to reject with a string (not an Error object)
      mockRequestService.getRequestById.mockRejectedValue(
        "Not an error object",
      );

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get request",
      });
    });
  });

  describe("getAllRequests", () => {
    it("should get all requests successfully", async () => {
      // Setup mock data
      const mockData = [
        { id: "request-1", medicalEquipment: "Equipment 1" },
        { id: "request-2", medicalEquipment: "Equipment 2" },
      ];

      // Mock service response
      mockRequestService.getAllRequests.mockResolvedValue(mockData as any);

      // Call method
      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockRequestService.getAllRequests).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Requests retrieved successfully",
        data: mockData,
      });
    });

    it("should handle AppError exceptions", async () => {
      // Mock service to throw AppError
      const appError = new AppError("Failed to get requests", 503);
      mockRequestService.getAllRequests.mockRejectedValue(appError);

      // Call method
      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get requests",
      });
    });

    it("should handle generic errors", async () => {
      // Mock service to throw generic Error
      mockRequestService.getAllRequests.mockRejectedValue(
        new Error("Service error"),
      );

      // Call method
      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });

    it("should handle non-Error rejections", async () => {
      // Mock service to reject with a string (not an Error object)
      mockRequestService.getAllRequests.mockRejectedValue(
        "Not an error object",
      );

      // Call method
      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get requests",
      });
    });
  });
});
