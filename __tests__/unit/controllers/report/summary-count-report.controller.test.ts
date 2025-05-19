import { Request, Response, NextFunction } from "express";
import ReportController from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";
import { CountReport } from "../../../../src/interfaces/report.interface";

// Mock the service
jest.mock("../../../../src/services/report.service");

describe("ReportController", () => {
  let reportController: ReportController;
  let mockReportService: jest.Mocked<ReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    mockNext = jest.fn();
    mockRequest = {};

    // Create properly mocked service
    mockReportService = {
      getCountReport: jest.fn(),
    } as any as jest.Mocked<ReportService>;

    // Create controller instance
    reportController = new ReportController();

    // Replace the service instance with our mock
    (reportController as any).reportService = mockReportService;
  });

  describe("getCountReport", () => {
    it("should return count report data successfully", async () => {
      // Mock data
      const mockCountReport: CountReport = {
        maintenanceCount: 124,
        calibrationCount: 87,
        sparePartsCount: 36,
        maintenancePercentageChange: 24.0,
        calibrationPercentageChange: 8.75,
        sparePartsPercentageChange: 12.5,
      };

      // Mock service response
      mockReportService.getCountReport.mockResolvedValue({
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
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Summary count report retrieved successfully",
        data: mockCountReport,
      });
    });

    it("should handle service errors by calling next with error", async () => {
      // Mock service error
      const mockError = new Error("Service error");
      mockReportService.getCountReport.mockRejectedValue(mockError);

      // Execute
      await reportController.getCountReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      // Note: When an error occurs, the controller should call next() and not set status/json
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it("should return zero counts when service returns empty data", async () => {
      // Mock empty data
      const emptyCountReport: CountReport = {
        maintenanceCount: 0,
        calibrationCount: 0,
        sparePartsCount: 0,
        maintenancePercentageChange: 0,
        calibrationPercentageChange: 0,
        sparePartsPercentageChange: 0,
      };

      mockReportService.getCountReport.mockResolvedValue({
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
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Summary count report retrieved successfully",
        data: emptyCountReport,
      });
    });

    // NEW TEST: Test capped percentages (999%)
    it("should return capped percentages when service returns capped data", async () => {
      // Mock data with capped percentages (like your actual API response)
      const cappedCountReport: CountReport = {
        maintenanceCount: 16,
        calibrationCount: 10,
        sparePartsCount: 30,
        maintenancePercentageChange: 999,
        calibrationPercentageChange: 999,
        sparePartsPercentageChange: 999,
      };

      mockReportService.getCountReport.mockResolvedValue({
        success: true,
        data: cappedCountReport,
      });

      // Execute
      await reportController.getCountReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Summary count report retrieved successfully",
        data: cappedCountReport,
      });
    });

    // NEW TEST: Test negative percentages
    it("should handle negative percentage changes", async () => {
      // Mock data with negative percentages
      const negativeCountReport: CountReport = {
        maintenanceCount: 50,
        calibrationCount: 30,
        sparePartsCount: 10,
        maintenancePercentageChange: -25,
        calibrationPercentageChange: -50,
        sparePartsPercentageChange: -75,
      };

      mockReportService.getCountReport.mockResolvedValue({
        success: true,
        data: negativeCountReport,
      });

      // Execute
      await reportController.getCountReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Summary count report retrieved successfully",
        data: negativeCountReport,
      });
    });
  });
});
