import { Request, Response, NextFunction } from "express";
import PartsHistoryController from "../../../../src/controllers/parts-history.controller";
import PartsHistoryService from "../../../../src/services/parts-history.service";

// Mock the PartsHistoryService
jest.mock("../../../../src/services/parts-history.service");

describe("PartsHistoryController - getPartsHistoriesByEquipmentId", () => {
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
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  // Positive test case - default pagination
  it("should get parts history with default pagination", async () => {
    // Mock service response
    const mockPartsHistories = {
      data: [
        {
          id: "hist-123",
          medicalEquipmentId: "equip-123",
          sparepartId: "part-123",
          actionPerformed: "Replaced motor",
          technician: "John Doe",
          result: "Success",
          replacementDate: new Date("2023-05-15"),
          createdBy: "user-123",
          createdOn: new Date(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    (
      PartsHistoryService.prototype.getPartsHistories as jest.Mock
    ).mockResolvedValueOnce(mockPartsHistories);

    // Execute the controller method
    await partsHistoryController.getPartsHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions - should match actual controller behavior which passes all query params in filters
    expect(
      PartsHistoryService.prototype.getPartsHistories,
    ).toHaveBeenCalledWith(
      undefined, // search
      { medicalEquipmentId: "equip-123" }, // Only equipmentId in filters since query is empty
      { page: 1, limit: 10 }, // Default pagination
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockPartsHistories);
  });

  // Positive test case - custom pagination and filters
  it("should get parts history with custom pagination and filters", async () => {
    // Setup request with query params
    mockRequest.query = {
      page: "2",
      limit: "5",
      search: "motor",
      sparepartId: "part-456",
      result: "Success",
      replacementDateStart: "2023-01-01",
      replacementDateEnd: "2023-12-31",
    };

    // Mock service response
    const mockPartsHistories = {
      data: [
        {
          id: "hist-456",
          medicalEquipmentId: "equip-123",
          sparepartId: "part-456",
          actionPerformed: "Replaced motor",
          technician: "Jane Doe",
          result: "Success",
          replacementDate: new Date("2023-06-20"),
          createdBy: "user-123",
          createdOn: new Date(),
        },
      ],
      meta: {
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      },
    };

    (
      PartsHistoryService.prototype.getPartsHistories as jest.Mock
    ).mockResolvedValueOnce(mockPartsHistories);

    // Execute the controller method
    await partsHistoryController.getPartsHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions - match what the controller would actually pass
    expect(
      PartsHistoryService.prototype.getPartsHistories,
    ).toHaveBeenCalledWith(
      "motor", // search param
      {
        medicalEquipmentId: "equip-123",
        page: "2",
        limit: "5",
        search: "motor",
        sparepartId: "part-456",
        result: "Success",
        replacementDateStart: "2023-01-01",
        replacementDateEnd: "2023-12-31",
      },
      { page: 2, limit: 5 }, // parsed pagination
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockPartsHistories);
  });

  // Negative test case
  it("should handle errors and pass to next middleware", async () => {
    // Mock service throwing an error
    const mockError = new Error("Failed to retrieve parts history");
    (
      PartsHistoryService.prototype.getPartsHistories as jest.Mock
    ).mockRejectedValueOnce(mockError);

    // Execute the controller method
    await partsHistoryController.getPartsHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Edge case - invalid pagination parameters
  it("should handle invalid pagination parameters", async () => {
    // Setup request with invalid pagination
    mockRequest.query = {
      page: "-1",
      limit: "0",
    };

    const mockPartsHistories = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };

    (
      PartsHistoryService.prototype.getPartsHistories as jest.Mock
    ).mockResolvedValueOnce(mockPartsHistories);

    // Execute the controller method
    await partsHistoryController.getPartsHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions - controller includes all query params in filters
    expect(
      PartsHistoryService.prototype.getPartsHistories,
    ).toHaveBeenCalledWith(
      undefined,
      {
        medicalEquipmentId: "equip-123",
        page: "-1",
        limit: "0",
      },
      { page: 1, limit: 10 }, // Should default to valid values
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  // Edge case - non-numeric pagination values
  it("should handle non-numeric pagination values", async () => {
    // Setup request with non-numeric pagination
    mockRequest.query = {
      page: "abc",
      limit: "def",
    };

    const mockPartsHistories = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };

    (
      PartsHistoryService.prototype.getPartsHistories as jest.Mock
    ).mockResolvedValueOnce(mockPartsHistories);

    // Execute the controller method
    await partsHistoryController.getPartsHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(
      PartsHistoryService.prototype.getPartsHistories,
    ).toHaveBeenCalledWith(
      undefined,
      {
        medicalEquipmentId: "equip-123",
        page: "abc",
        limit: "def",
      },
      { page: 1, limit: 10 }, // Should default to valid values
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockPartsHistories);
  });

  // Edge case - with empty search string
  it("should handle empty search string", async () => {
    // Setup request with empty search
    mockRequest.query = {
      search: "",
    };

    const mockPartsHistories = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };

    (
      PartsHistoryService.prototype.getPartsHistories as jest.Mock
    ).mockResolvedValueOnce(mockPartsHistories);

    // Execute the controller method
    await partsHistoryController.getPartsHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assertions
    expect(
      PartsHistoryService.prototype.getPartsHistories,
    ).toHaveBeenCalledWith(
      "",
      {
        medicalEquipmentId: "equip-123",
        search: "",
      },
      { page: 1, limit: 10 },
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
