import { Request, Response, NextFunction } from "express";
import ReportController from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";

// Mock the ReportService
jest.mock("../../../../src/services/report.service");

describe("ReportController - getMonthlyRequestCounts", () => {
  let controller: ReportController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockReportService: jest.Mocked<ReportService>;

  beforeEach(() => {
    // Setup request, response, and next function mocks
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Setup ReportService mock
    mockReportService = new ReportService() as jest.Mocked<ReportService>;

    // Create controller with mocked service
    controller = new ReportController();
    // Replace the service instance with our mock
    (controller as any).reportService = mockReportService;
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return monthly request counts when service call succeeds with multiple months", async () => {
      // Arrange
      const mockData = [
        { month: "2025-05", MAINTENANCE: 10, CALIBRATION: 5 },
        { month: "2025-04", MAINTENANCE: 8, CALIBRATION: 3 },
      ];

      mockReportService.getMonthlyRequestCounts = jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      });

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getMonthlyRequestCounts).toHaveBeenCalledTimes(
        1,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Monthly request counts retrieved successfully",
        data: mockData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle service returning a large dataset (12 months)", async () => {
      // Arrange
      const mockData = Array.from({ length: 12 }, (_, i) => ({
        month: `2025-${String(i + 1).padStart(2, "0")}`,
        MAINTENANCE: Math.floor(Math.random() * 20),
        CALIBRATION: Math.floor(Math.random() * 10),
      }));

      mockReportService.getMonthlyRequestCounts = jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      });

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Monthly request counts retrieved successfully",
        data: mockData,
      });
    });
  });

  // EDGE CASES
  describe("Edge cases", () => {
    it("should handle empty data array from service", async () => {
      // Arrange
      const mockData: any[] = [];

      mockReportService.getMonthlyRequestCounts = jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      });

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Monthly request counts retrieved successfully",
        data: mockData,
      });
    });

    it("should handle service returning data with zero counts", async () => {
      // Arrange
      const mockData = [
        { month: "2025-05", MAINTENANCE: 0, CALIBRATION: 0 },
        { month: "2025-04", MAINTENANCE: 0, CALIBRATION: 0 },
      ];

      mockReportService.getMonthlyRequestCounts = jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      });

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Monthly request counts retrieved successfully",
        data: mockData,
      });
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should call next with error when service call fails with generic error", async () => {
      // Arrange
      const mockError = new Error("Test error");
      mockReportService.getMonthlyRequestCounts = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getMonthlyRequestCounts).toHaveBeenCalledTimes(
        1,
      );
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it("should call next with error when service throws a specific error type", async () => {
      // Arrange
      class DatabaseError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "DatabaseError";
        }
      }

      const mockError = new DatabaseError("Database connection failed");
      mockReportService.getMonthlyRequestCounts = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
