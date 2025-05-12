import { Request, Response, NextFunction } from "express";
import RequestController from "../../../../src/controllers/request.controller";
import RequestService from "../../../../src/services/request.service";
import AppError from "../../../../src/utils/appError";

// Mock the RequestService
jest.mock("../../../../src/services/request.service");

describe("RequestController - updateRequestStatus", () => {
  let controller: RequestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RequestController();

    mockRequest = {
      params: {
        id: "request-123",
      },
      body: {
        status: "Completed",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  // Positive case - successful status update
  it("should successfully update request status", async () => {
    const mockUpdatedRequest = {
      id: "request-123",
      status: "Completed",
      medicalEquipment: "MRI Machine",
      requestType: "MAINTENANCE",
    };

    // Mock service response
    (
      RequestService.prototype.updateRequestStatus as jest.Mock
    ).mockResolvedValueOnce({
      data: mockUpdatedRequest,
    });

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(RequestService.prototype.updateRequestStatus).toHaveBeenCalledWith(
      "request-123",
      "Completed",
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Request status updated successfully",
      data: mockUpdatedRequest,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // Negative case - missing status in request body
  it("should return 400 when status is missing in request body", async () => {
    // Setup request without status
    mockRequest.body = {};

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(RequestService.prototype.updateRequestStatus).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Status is required in request body",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // Negative case - missing request ID
  it("should pass error to next middleware when request ID is missing", async () => {
    // Setup request without ID
    mockRequest.params = {};

    // Mock service throwing an error for missing ID
    const mockError = new AppError(
      "Request ID is required and must be a valid string",
      400,
    );
    (
      RequestService.prototype.updateRequestStatus as jest.Mock
    ).mockRejectedValueOnce(mockError);

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Negative case - service throws error
  it("should pass error to next middleware when service fails", async () => {
    // Mock service throwing an error
    const mockError = new Error("Database connection failed");
    (
      RequestService.prototype.updateRequestStatus as jest.Mock
    ).mockRejectedValueOnce(mockError);

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Edge case - request not found
  it("should pass error to next middleware when request is not found", async () => {
    // Mock service throwing not found error
    const mockError = new AppError(
      "Request with ID request-123 not found",
      404,
    );
    (
      RequestService.prototype.updateRequestStatus as jest.Mock
    ).mockRejectedValueOnce(mockError);

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Edge case - empty status string
  it("should handle empty status string", async () => {
    // Setup request with empty status
    mockRequest.body.status = "";

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Status is required in request body",
    });
    expect(RequestService.prototype.updateRequestStatus).not.toHaveBeenCalled();
  });

  // Edge case - null status
  it("should handle null status", async () => {
    // Setup request with null status
    mockRequest.body.status = null;

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Status is required in request body",
    });
    expect(RequestService.prototype.updateRequestStatus).not.toHaveBeenCalled();
  });

  // Edge case - whitespace only status
  it("should handle whitespace only status", async () => {
    // Setup request with whitespace status
    mockRequest.body.status = "   ";

    // The controller doesn't trim the status, so it will be passed to the service
    // Mock service throwing a validation error (as it should handle this case)
    const mockError = new AppError(
      "Status is required and must be a valid string",
      400,
    );
    (
      RequestService.prototype.updateRequestStatus as jest.Mock
    ).mockRejectedValueOnce(mockError);

    await controller.updateRequestStatus(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions - service will be called and error should be passed to next
    expect(RequestService.prototype.updateRequestStatus).toHaveBeenCalledWith(
      "request-123",
      "   ",
    );
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
});
