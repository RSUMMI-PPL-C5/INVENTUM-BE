import { Request, Response, NextFunction } from "express";
import ReportController from "../../../src/controllers/report.controller";
import ReportService from "../../../src/services/report.service";
import { CountReport } from "../../../src/interfaces/report.interface";

jest.mock("../../../src/services/report.service");

describe("ReportController", () => {
  let reportController: ReportController;
  let mockReportService: jest.Mocked<ReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReportService = new ReportService() as jest.Mocked<ReportService>;
    reportController = new ReportController();
    mockNext = jest.fn();

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup mock request
    mockRequest = {};
  });

  describe("getCountReport", () => {
    it("should return count report data successfully", async () => {
      // Mock data
      const mockCountReport: CountReport = {
        maintenanceCount: 124,
        calibrationCount: 87,
        sparePartsCount: 36,
      };

      // Mock service response
      mockReportService.getCountReport = jest.fn().mockResolvedValue({
        success: true,
        data: mockCountReport,
      });

      // Execute
      await reportController.getCountReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getCountReport).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Summary count report retrieved successfully",
        data: mockCountReport,
      });
    });

    it("should handle service errors by calling next with error", async () => {
      // Mock service error
      const mockError = new Error("Service error");
      mockReportService.getCountReport = jest.fn().mockRejectedValue(mockError);

      // Execute
      await reportController.getCountReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return zero counts when service returns empty data", async () => {
      // Mock empty data
      const emptyCountReport: CountReport = {
        maintenanceCount: 0,
        calibrationCount: 0,
        sparePartsCount: 0,
      };

      mockReportService.getCountReport = jest.fn().mockResolvedValue({
        success: true,
        data: emptyCountReport,
      });

      // Execute
      await reportController.getCountReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Summary count report retrieved successfully",
        data: emptyCountReport,
      });
    });
  });
});
