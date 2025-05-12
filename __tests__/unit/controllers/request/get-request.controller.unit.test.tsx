import { Request, Response } from "express";
import RequestController from "../../../../src/controllers/request.controller";
import RequestService from "../../../../src/services/request.service";

// Mock the service
jest.mock("../../../../src/services/request.service");

describe("RequestController", () => {
  let requestController: RequestController;
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
    mockRequest = {
      query: {},
    };

    // Initialize controller
    requestController = new RequestController();
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
      (RequestService.prototype.getRequestById as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      // Call method
      await requestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(RequestService.prototype.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
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
      expect(RequestService.prototype.getRequestById).not.toHaveBeenCalled();
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
      expect(RequestService.prototype.getRequestById).not.toHaveBeenCalled();
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
      (RequestService.prototype.getRequestById as jest.Mock).mockRejectedValue(
        error,
      );

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
      const mockResult = {
        data: [
          { id: "request-1", medicalEquipment: "Equipment 1" },
          { id: "request-2", medicalEquipment: "Equipment 2" },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Mock service response
      (RequestService.prototype.getAllRequests as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Call method
      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(RequestService.prototype.getAllRequests).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      // Mock service to throw an error
      const error = new Error("Service error");

      (RequestService.prototype.getAllRequests as jest.Mock).mockRejectedValue(
        error,
      );

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
      const mockResult = {
        data: [
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
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Mock service response
      (
        RequestService.prototype.getAllRequestMaintenance as jest.Mock
      ).mockResolvedValue(mockResult);

      // Call method
      await requestController.getAllRequestMaintenance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(
        RequestService.prototype.getAllRequestMaintenance,
      ).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      // Mock service to throw an error
      const error = new Error("Service error");
      (
        RequestService.prototype.getAllRequestMaintenance as jest.Mock
      ).mockRejectedValue(error);

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

    it("should handle valid page and limit query parameters", async () => {
      // Setup mock request with specific pagination
      mockRequest.query = { page: "3", limit: "15" };

      const mockResult = {
        data: [{ id: "request-1" }],
        meta: { total: 1, page: 3, limit: 15, totalPages: 1 },
      };

      (RequestService.prototype.getAllRequests as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with correctly parsed pagination
      expect(RequestService.prototype.getAllRequests).toHaveBeenCalledWith(
        undefined,
        { page: "3", limit: "15" },
        { page: 3, limit: 15 },
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(mockResult);
    });

    it("should handle negative page and limit values", async () => {
      // Setup mock request with negative pagination values
      mockRequest.query = { page: "-2", limit: "-5" };

      const mockResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      (RequestService.prototype.getAllRequests as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with sanitized pagination values
      expect(RequestService.prototype.getAllRequests).toHaveBeenCalledWith(
        undefined,
        { page: "-2", limit: "-5" },
        { page: 1, limit: 10 }, // Sanitized to defaults
      );
    });

    it("should handle non-numeric page and limit values", async () => {
      // Setup mock request with non-numeric pagination values
      mockRequest.query = { page: "abc", limit: "def" };

      const mockResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      (RequestService.prototype.getAllRequests as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await requestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with default pagination
      expect(RequestService.prototype.getAllRequests).toHaveBeenCalledWith(
        undefined,
        { page: "abc", limit: "def" },
        { page: 1, limit: 10 }, // Defaults used for non-numeric values
      );
    });

    it("should handle valid page and limit query parameters", async () => {
      // Setup mock request with specific pagination
      mockRequest.query = { page: "2", limit: "20" };

      const mockResult = {
        data: [{ id: "request-1", requestType: "MAINTENANCE" }],
        meta: { total: 1, page: 2, limit: 20, totalPages: 1 },
      };

      (
        RequestService.prototype.getAllRequestMaintenance as jest.Mock
      ).mockResolvedValue(mockResult);

      await requestController.getAllRequestMaintenance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with correctly parsed pagination
      expect(
        RequestService.prototype.getAllRequestMaintenance,
      ).toHaveBeenCalledWith(
        undefined,
        { page: "2", limit: "20" },
        { page: 2, limit: 20 },
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(mockResult);
    });

    it("should handle zero page and limit values", async () => {
      // Setup mock request with zero pagination values
      mockRequest.query = { page: "0", limit: "0" };

      const mockResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      (
        RequestService.prototype.getAllRequestMaintenance as jest.Mock
      ).mockResolvedValue(mockResult);

      await requestController.getAllRequestMaintenance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with sanitized pagination values
      expect(
        RequestService.prototype.getAllRequestMaintenance,
      ).toHaveBeenCalledWith(
        undefined,
        { page: "0", limit: "0" },
        { page: 1, limit: 10 }, // Sanitized to defaults
      );
    });

    it("should handle decimal page and limit values", async () => {
      // Setup mock request with decimal pagination values
      mockRequest.query = { page: "2.5", limit: "15.7" };

      const mockResult = {
        data: [],
        meta: { total: 0, page: 2, limit: 15, totalPages: 0 },
      };

      (
        RequestService.prototype.getAllRequestMaintenance as jest.Mock
      ).mockResolvedValue(mockResult);

      await requestController.getAllRequestMaintenance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with truncated pagination values (parseInt behavior)
      expect(
        RequestService.prototype.getAllRequestMaintenance,
      ).toHaveBeenCalledWith(
        undefined,
        { page: "2.5", limit: "15.7" },
        { page: 2, limit: 15 }, // parseInt truncates decimal values
      );
    });
  });

  describe("getAllRequestCalibration", () => {
    it("should get all calibration requests successfully", async () => {
      // Setup mock data
      const mockResult = {
        data: [
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
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Mock service response
      (
        RequestService.prototype.getAllRequestCalibration as jest.Mock
      ).mockResolvedValue(mockResult);

      // Call method
      await requestController.getAllRequestCalibration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assertions
      expect(
        RequestService.prototype.getAllRequestCalibration,
      ).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should sanitize both page and limit when both are zero", async () => {
      // Setup mock request with both zero
      mockRequest.query = { page: "0", limit: "0" };

      const mockResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      (
        RequestService.prototype.getAllRequestCalibration as jest.Mock
      ).mockResolvedValue(mockResult);

      await requestController.getAllRequestCalibration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert service was called with both values sanitized
      expect(
        RequestService.prototype.getAllRequestCalibration,
      ).toHaveBeenCalledWith(
        undefined,
        { page: "0", limit: "0" },
        { page: 1, limit: 10 }, // Both sanitized to defaults
      );
    });

    it("should pass errors to next middleware", async () => {
      // Mock service to throw an error
      const error = new Error("Service error");
      (
        RequestService.prototype.getAllRequestCalibration as jest.Mock
      ).mockRejectedValue(error);

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

  it("should handle valid page and limit query parameters", async () => {
    // Setup mock request with specific pagination
    mockRequest.query = { page: "4", limit: "5" };

    const mockResult = {
      data: [{ id: "request-1", requestType: "CALIBRATION" }],
      meta: { total: 1, page: 4, limit: 5, totalPages: 1 },
    };

    (
      RequestService.prototype.getAllRequestCalibration as jest.Mock
    ).mockResolvedValue(mockResult);

    await requestController.getAllRequestCalibration(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert service was called with correctly parsed pagination
    expect(
      RequestService.prototype.getAllRequestCalibration,
    ).toHaveBeenCalledWith(
      undefined,
      { page: "4", limit: "5" },
      { page: 4, limit: 5 },
    );
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith(mockResult);
  });

  it("should use default pagination when page and limit are missing", async () => {
    // Setup mock request with no pagination parameters
    mockRequest.query = { status: "Pending" }; // Other filters, but no pagination

    const mockResult = {
      data: [
        { id: "request-1", requestType: "CALIBRATION", status: "Pending" },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    (
      RequestService.prototype.getAllRequestCalibration as jest.Mock
    ).mockResolvedValue(mockResult);

    await requestController.getAllRequestCalibration(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert service was called with default pagination
    expect(
      RequestService.prototype.getAllRequestCalibration,
    ).toHaveBeenCalledWith(
      undefined,
      { status: "Pending" },
      { page: 1, limit: 10 }, // Default pagination
    );
  });

  it("should handle empty string page and limit values", async () => {
    // Setup mock request with empty string pagination values
    mockRequest.query = { page: "", limit: "" };

    const mockResult = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    (
      RequestService.prototype.getAllRequestCalibration as jest.Mock
    ).mockResolvedValue(mockResult);

    await requestController.getAllRequestCalibration(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert service was called with default pagination (empty strings become NaN when parsed)
    expect(
      RequestService.prototype.getAllRequestCalibration,
    ).toHaveBeenCalledWith(
      undefined,
      { page: "", limit: "" },
      { page: 1, limit: 10 }, // Default pagination for empty strings
    );
  });
});
