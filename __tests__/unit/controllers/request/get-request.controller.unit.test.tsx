import { Request, Response } from "express";
import RequestController from "../../../../src/controllers/request.controller";
import RequestService from "../../../../src/services/request.service";

// Mock the service
jest.mock("../../../../src/services/request.service");

describe("RequestController", () => {
  let requestController: RequestController;
  let mockRequestService: jest.Mocked<RequestService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup response spies
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    // Setup mock response and next function
    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };
    mockNext = jest.fn();

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
        mockNext,
      );

      // Assertions
      expect(mockRequestService.getRequestById).toHaveBeenCalledWith(requestId);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Request retrieved successfully",
        data: mockData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if request ID is not provided", async () => {
      // Setup request without ID
      mockRequest.params = {};

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockRequestService.getRequestById).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if request ID is an empty string", async () => {
      // Setup request with empty ID
      mockRequest.params = { id: "" };

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockRequestService.getRequestById).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      // Setup request
      mockRequest.params = { id: "request-123" };

      // Mock service to throw an error
      const error = new Error("Service error");
      mockRequestService.getRequestById.mockRejectedValue(error);

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions - now we check that next was called with the error
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
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
        mockNext,
      );

      // Assertions
      expect(mockRequestService.getAllRequests).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Requests retrieved successfully",
        data: mockData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      // Mock service to throw an error
      const error = new Error("Service error");
      mockRequestService.getAllRequests.mockRejectedValue(error);

      // Call method
      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });

  describe("getAllRequestMaintenance", () => {
    it("should get all maintenance requests successfully", async () => {
      // Setup mock data
      const mockData = [
        {
          id: "request-1",
          medicalEquipment: "Equipment 1",
          requestType: "MAINTENANCE",
        },
        {
          id: "request-2",
          medicalEquipment: "Equipment 2",
          requestType: "MAINTENANCE",
        },
      ];

      // Mock service response
      mockRequestService.getAllRequestMaintenance.mockResolvedValue(
        mockData as any,
      );

      // Call method
      await requestController.getAllRequestMaintenance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockRequestService.getAllRequestMaintenance).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Maintenance requests retrieved successfully",
        data: mockData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      // Mock service to throw an error
      const error = new Error("Service error");
      mockRequestService.getAllRequestMaintenance.mockRejectedValue(error);

      // Call method
      await requestController.getAllRequestMaintenance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });

  describe("getAllRequestCalibration", () => {
    it("should get all calibration requests successfully", async () => {
      // Setup mock data
      const mockData = [
        {
          id: "request-1",
          medicalEquipment: "Equipment 1",
          requestType: "CALIBRATION",
        },
        {
          id: "request-2",
          medicalEquipment: "Equipment 2",
          requestType: "CALIBRATION",
        },
      ];

      // Mock service response
      mockRequestService.getAllRequestCalibration.mockResolvedValue(
        mockData as any,
      );

      // Call method
      await requestController.getAllRequestCalibration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockRequestService.getAllRequestCalibration).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Calibration requests retrieved successfully",
        data: mockData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      // Mock service to throw an error
      const error = new Error("Service error");
      mockRequestService.getAllRequestCalibration.mockRejectedValue(error);

      // Call method
      await requestController.getAllRequestCalibration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });
});
