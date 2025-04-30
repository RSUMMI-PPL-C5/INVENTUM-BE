import { Request, Response, NextFunction } from "express";
import CalibrationHistoryController from "../../../../src/controllers/calibration-history.controller";
import CalibrationHistoryService from "../../../../src/services/calibration-history.service";
import { CalibrationHistoryFilterOptions } from "../../../../src/interfaces/calibration-history.filter.interface";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";

// Mock the service
jest.mock("../../../../src/services/calibration-history.service");

describe("CalibrationHistoryController - getCalibrationHistoriesByEquipmentId", () => {
  let controller: CalibrationHistoryController;
  let mockService: jest.Mocked<CalibrationHistoryService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const defaultEquipmentId = "equip123";

  // Mock response data
  const mockCalibrationHistories = [
    {
      id: "cal1",
      medicalEquipmentId: defaultEquipmentId,
      actionPerformed: "Annual calibration",
      technician: "John Doe",
      result: "Success",
      calibrationDate: new Date("2025-04-15T09:00:00Z"),
      calibrationMethod: "Standard reference",
      nextCalibrationDue: new Date("2026-04-15T09:00:00Z"),
      createdBy: "user123",
      createdOn: new Date(),
    },
    {
      id: "cal2",
      medicalEquipmentId: defaultEquipmentId,
      actionPerformed: "Emergency calibration",
      technician: "Jane Smith",
      result: "Partial",
      calibrationDate: new Date("2025-03-20T14:30:00Z"),
      calibrationMethod: "Manual calibration",
      nextCalibrationDue: null,
      createdBy: "user456",
      createdOn: new Date(),
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup service mock
    mockService =
      new CalibrationHistoryService() as jest.Mocked<CalibrationHistoryService>;
    (
      CalibrationHistoryService as jest.MockedClass<
        typeof CalibrationHistoryService
      >
    ).mockImplementation(() => mockService);

    mockService.getCalibrationHistories = jest.fn().mockResolvedValue({
      data: mockCalibrationHistories,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    // Setup request, response, next function mocks
    mockRequest = {
      params: {
        equipmentId: defaultEquipmentId,
      },
      query: {},
      user: {
        userId: "user123",
        role: "Admin",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    // Create controller instance
    controller = new CalibrationHistoryController();
  });

  // Positive case - basic request with no filters
  it("should retrieve calibration histories with default options", async () => {
    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    const expectedFilters: CalibrationHistoryFilterOptions = {
      medicalEquipmentId: defaultEquipmentId,
      result: undefined,
      calibrationDateStart: undefined,
      calibrationDateEnd: undefined,
      calibrationMethod: undefined,
      nextCalibrationDueBefore: undefined,
      createdOnStart: undefined,
      createdOnEnd: undefined,
    };

    const expectedPagination: PaginationOptions = {
      page: 1,
      limit: 10,
    };

    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      undefined,
      expectedFilters,
      expectedPagination,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockCalibrationHistories,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // Positive case - with search and all filters
  it("should apply search and all filter parameters correctly", async () => {
    // Arrange
    const startDate = "2025-01-01T00:00:00Z";
    const endDate = "2025-04-30T23:59:59Z";
    const createdStartDate = "2025-01-01T00:00:00Z";
    const createdEndDate = "2025-04-30T23:59:59Z";
    const nextDueDate = "2025-12-31T23:59:59Z";

    mockRequest.query = {
      search: "calibration",
      result: "Success",
      calibrationDateStart: startDate,
      calibrationDateEnd: endDate,
      calibrationMethod: "standard",
      nextCalibrationDueBefore: nextDueDate,
      createdOnStart: createdStartDate,
      createdOnEnd: createdEndDate,
      page: "2",
      limit: "5",
    };

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      "calibration",
      expect.objectContaining({
        medicalEquipmentId: defaultEquipmentId,
        result: "Success",
        calibrationMethod: "standard",
      }),
      { page: 2, limit: 5 },
    );
  });

  // Positive case - with custom pagination
  it("should apply custom pagination parameters", async () => {
    // Arrange
    mockRequest.query = {
      page: "3",
      limit: "20",
    };

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      undefined,
      expect.anything(),
      { page: 3, limit: 20 },
    );
  });

  // Negative case - service throws an error
  it("should pass errors to the next middleware", async () => {
    // Arrange
    const mockError = new Error("Database connection failed");
    mockService.getCalibrationHistories.mockRejectedValue(mockError);

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  // Edge case - invalid pagination parameters
  it("should handle invalid pagination parameters", async () => {
    // Arrange
    mockRequest.query = {
      page: "-1", // Invalid
      limit: "0", // Invalid
    };

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      undefined,
      expect.anything(),
      { page: 1, limit: 10 }, // Should fall back to defaults
    );
  });

  // Edge case - non-numeric pagination parameters
  it("should handle non-numeric pagination parameters", async () => {
    // Arrange
    mockRequest.query = {
      page: "abc", // Not a number
      limit: "def", // Not a number
    };

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      undefined,
      expect.anything(),
      { page: 1, limit: 10 }, // Should fall back to defaults
    );
  });

  // Edge case - missing equipment ID
  it("should handle missing equipment ID in params", async () => {
    // Arrange
    mockRequest.params = {};

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        medicalEquipmentId: undefined,
      }),
      expect.anything(),
    );
  });

  // Edge case - handling filter combinations
  it("should handle each individual filter correctly", async () => {
    // Test each filter separately
    const filters = {
      result: "Partial",
      calibrationDateStart: "2025-01-01T00:00:00Z",
      calibrationDateEnd: "2025-12-31T23:59:59Z",
      calibrationMethod: "manual",
      nextCalibrationDueBefore: "2026-01-01T00:00:00Z",
      createdOnStart: "2025-01-01T00:00:00Z",
      createdOnEnd: "2025-12-31T23:59:59Z",
    };

    // Test each filter individually
    for (const [key, value] of Object.entries(filters)) {
      // Reset query and set just one filter
      mockRequest.query = { [key]: value };

      // Act
      await controller.getCalibrationHistoriesByEquipmentId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert the filter was applied correctly
      expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          [key]: expect.anything(),
        }),
        expect.anything(),
      );

      // Clear mocks for next iteration
      jest.clearAllMocks();
    }
  });

  // Edge case - empty string search
  it("should handle empty search string", async () => {
    // Arrange
    mockRequest.query = {
      search: "",
    };

    // Act
    await controller.getCalibrationHistoriesByEquipmentId(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockService.getCalibrationHistories).toHaveBeenCalledWith(
      "",
      expect.anything(),
      expect.anything(),
    );
  });
});
