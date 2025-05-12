import { NextFunction, Request, Response } from "express";
import { ReportController } from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";

// Mock service
jest.mock("../../../../src/services/report.service");

describe("ReportController - getRequestStatusReport", () => {
  let controller: ReportController;
  let mockService: jest.Mocked<ReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = new ReportService() as jest.Mocked<ReportService>;
    controller = new ReportController();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    (ReportService as jest.Mock).mockImplementation(() => mockService);
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return status report with 200 status code", async () => {
      // Arrange
      const mockReportData = {
        MAINTENANCE: [
          { status: "Completed", count: 50, percentage: 50 },
          { status: "In Progress", count: 30, percentage: 30 },
          { status: "Failed", count: 20, percentage: 20 },
        ],
        CALIBRATION: [
          { status: "Completed", count: 40, percentage: 40 },
          { status: "In Progress", count: 40, percentage: 40 },
          { status: "Failed", count: 20, percentage: 20 },
        ],
        total: {
          success: 90,
          warning: 70,
          failed: 40,
          total: 200,
        },
      };

      mockService.getRequestStatusReport = jest.fn().mockResolvedValue({
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
