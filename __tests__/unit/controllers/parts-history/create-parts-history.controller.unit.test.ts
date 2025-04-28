import { Request, Response, NextFunction } from "express";
import PartsHistoryController from "../../../../src/controllers/parts-history.controller";
import PartsHistoryService from "../../../../src/services/parts-history.service";

// Mock the PartsHistoryService
jest.mock("../../../../src/services/parts-history.service");

describe("PartsHistoryController - createPartsHistory", () => {
  let partsHistoryController: PartsHistoryController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create controller instance
    partsHistoryController = new PartsHistoryController();

    // Setup mock request, response, next
    mockRequest = {
      params: {
        equipmentId: "equip-123",
      },
      body: {
        sparepartId: "part-123",
        actionPerformed: "Replaced motor",
        technician: "John Doe",
        quantity: 2,
        replacementDate: "2023-05-15",
        result: "SUCCESS",
      },
      user: {
        userId: "user-123",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  // Positive test case
  it("should create parts history successfully", async () => {
    // Mock service response
    const mockCreatedPartsHistory = {
      id: "hist-123",
      medicalEquipmentId: "equip-123",
      sparepartId: "part-123",
      actionPerformed: "Replaced motor",
      technician: "John Doe",
      result: "SUCCESS",
      replacementDate: new Date("2023-05-15"),
      createdBy: "user-123",
      createdOn: new Date(),
    };

    (
      PartsHistoryService.prototype.createPartsHistory as jest.Mock
    ).mockResolvedValueOnce(mockCreatedPartsHistory);

    // Execute the controller method
    await partsHistoryController.createPartsHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(
      PartsHistoryService.prototype.createPartsHistory,
    ).toHaveBeenCalledWith({
      medicalEquipmentId: "equip-123",
      sparepartId: "part-123",
      actionPerformed: "Replaced motor",
      technician: "John Doe",
      quantity: 2,
      replacementDate: "2023-05-15",
      result: "SUCCESS",
      createdBy: "user-123",
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: mockCreatedPartsHistory,
    });
  });

  // Negative test case
  it("should handle errors and pass to next middleware", async () => {
    // Mock service throwing an error
    const mockError = new Error("Failed to create parts history");
    (
      PartsHistoryService.prototype.createPartsHistory as jest.Mock
    ).mockRejectedValueOnce(mockError);

    // Execute the controller method
    await partsHistoryController.createPartsHistory(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Edge case - missing user ID
  it("should handle missing user ID", async () => {
    // Setup request with missing user
    const requestWithoutUser = {
      ...mockRequest,
      user: undefined,
    };

    // Execute the controller method
    await partsHistoryController.createPartsHistory(
      requestWithoutUser as Request,
      mockResponse as Response,
      mockNext,
    );

    // An error should have occurred and been passed to next
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
