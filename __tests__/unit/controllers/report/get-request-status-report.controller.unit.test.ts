import { NextFunction, Request, Response } from "express";
import { ReportController } from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";

// Mock the ReportService properly
jest.mock("../../../../src/services/report.service", () => {
  return jest.fn().mockImplementation(() => ({
    getRequestStatusReport: jest.fn(),
  }));
});

describe("ReportController - getRequestStatusReport", () => {
  let controller: ReportController;
  let mockService: jest.Mocked<ReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh mocks for each test
    mockService = new ReportService() as jest.Mocked<ReportService>;
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Ensure the service constructor returns our mock
    (ReportService as jest.Mock).mockImplementation(() => mockService);

    // Create controller with our mocked service
    controller = new ReportController();
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return status report with 200 status code", async () => {
      // Arrange
      const mockReportData = {
        MAINTENANCE: [
          { status: "completed", count: 50, percentage: 50 },
          { status: "on progress", count: 30, percentage: 30 },
          { status: "pending", count: 20, percentage: 20 },
        ],
        CALIBRATION: [
          { status: "completed", count: 40, percentage: 40 },
          { status: "on progress", count: 40, percentage: 40 },
          { status: "pending", count: 20, percentage: 20 },
        ],
        total: {
          completed: 90,
          on_progress: 70,
          pending: 40,
          total: 200,
        },
      };

      // Set up mock to return our data
      mockService.getRequestStatusReport.mockResolvedValue({
        success: true,
        data: mockReportData,
      });

      // Act
      await controller.getRequestStatusReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockService.getRequestStatusReport).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Request status report retrieved successfully",
        data: mockReportData,
      });
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should call next with error when service fails", async () => {
      // Arrange
      const mockError = new Error("Service error");
      mockService.getRequestStatusReport = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await controller.getRequestStatusReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockService.getRequestStatusReport).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
