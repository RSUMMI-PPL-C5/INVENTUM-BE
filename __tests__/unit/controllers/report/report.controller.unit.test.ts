import { Request, Response, NextFunction } from "express";
import ReportController from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";

// Mock the ReportService
jest.mock("../../../../src/services/report.service");

describe("ReportController", () => {
  let controller: ReportController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockReportService: jest.Mocked<ReportService>;

  beforeEach(() => {
    // Setup request, response, and next function mocks
    mockReq = {
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();

    // Setup ReportService mock
    mockReportService = new ReportService() as jest.Mocked<ReportService>;

    // Create controller with mocked service
    controller = new ReportController();
    // Replace the service instance with our mock
    (controller as any).reportService = mockReportService;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("getMonthlyRequestCounts", () => {
    it("should get monthly request counts", async () => {
      // Arrange
      const mockData = [
        { month: 1, year: 2023, maintenance: 5, calibration: 3 },
        { month: 2, year: 2023, maintenance: 7, calibration: 4 },
      ];
      mockReportService.getMonthlyRequestCounts = jest.fn().mockResolvedValue({
        data: mockData,
      });

      // Act
      await controller.getMonthlyRequestCounts(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getMonthlyRequestCounts).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Monthly request counts retrieved successfully",
        data: mockData,
      });
    });

    it("should handle errors", async () => {
      // Arrange
      const mockError = new Error("Failed to get monthly counts");
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

  describe("getPlanReports", () => {
    it("should return plan reports with success message", async () => {
      // Arrange
      mockReq.query = {
        search: "test",
        status: "scheduled",
        type: "MAINTENANCE",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        page: "2",
        limit: "20",
      };

      const mockData = [
        { id: "1", requestType: "MAINTENANCE", status: "PENDING" },
      ];
      const mockMeta = { total: 1, page: 2, limit: 20, totalPages: 1 };

      mockReportService.getPlanReports = jest.fn().mockResolvedValue({
        data: mockData,
        meta: mockMeta,
      });

      // Act
      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getPlanReports).toHaveBeenCalledWith(
        {
          search: "test",
          status: "scheduled",
          type: "MAINTENANCE",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
        },
        { page: 2, limit: 20 },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Plan reports retrieved successfully",
        data: mockData,
        meta: mockMeta,
      });
    });

    it("should handle invalid status parameter", async () => {
      // Arrange
      mockReq.query = {
        status: "INVALID_STATUS", // Invalid status
      };

      mockReportService.getPlanReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getPlanReports).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
        }),
        expect.anything(),
      );
    });

    it("should handle invalid type parameter", async () => {
      // Arrange
      mockReq.query = {
        type: "INVALID_TYPE", // Invalid type
      };

      mockReportService.getPlanReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getPlanReports).toHaveBeenCalledWith(
        expect.objectContaining({
          type: undefined,
        }),
        expect.anything(),
      );
    });

    it("should handle negative pagination values", async () => {
      // Arrange
      mockReq.query = {
        page: "-1",
        limit: "-5",
      };

      mockReportService.getPlanReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getPlanReports).toHaveBeenCalledWith(
        expect.anything(),
        { page: 1, limit: 10 },
      );
    });

    it("should handle errors", async () => {
      // Arrange
      const mockError = new Error("Failed to get plan reports");
      mockReportService.getPlanReports = jest.fn().mockRejectedValue(mockError);

      // Act
      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getResultReports", () => {
    it("should return result reports with success message", async () => {
      // Arrange
      mockReq.query = {
        search: "test",
        result: "success",
        type: "MAINTENANCE",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        page: "2",
        limit: "20",
      };

      const mockData = [{ id: "1", type: "MAINTENANCE", result: "SUCCESS" }];
      const mockMeta = { total: 1, page: 2, limit: 20, totalPages: 1 };

      mockReportService.getResultReports = jest.fn().mockResolvedValue({
        data: mockData,
        meta: mockMeta,
      });

      // Act
      await controller.getResultReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getResultReports).toHaveBeenCalledWith(
        {
          search: "test",
          result: "success",
          type: "MAINTENANCE",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
        },
        { page: 2, limit: 20 },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Result reports retrieved successfully",
        data: mockData,
        meta: mockMeta,
      });
    });

    it("should handle invalid result parameter", async () => {
      // Arrange
      mockReq.query = {
        result: "INVALID_RESULT", // Invalid result
      };

      mockReportService.getResultReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getResultReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getResultReports).toHaveBeenCalledWith(
        expect.objectContaining({
          result: undefined,
        }),
        expect.anything(),
      );
    });

    it("should handle invalid type parameter", async () => {
      // Arrange
      mockReq.query = {
        type: "INVALID_TYPE", // Invalid type
      };

      mockReportService.getResultReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getResultReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getResultReports).toHaveBeenCalledWith(
        expect.objectContaining({
          type: undefined,
        }),
        expect.anything(),
      );
    });

    it("should handle negative pagination values", async () => {
      // Arrange
      mockReq.query = {
        page: "-1",
        limit: "-5",
      };

      mockReportService.getResultReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getResultReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getResultReports).toHaveBeenCalledWith(
        expect.anything(),
        { page: 1, limit: 10 },
      );
    });

    it("should handle errors", async () => {
      // Arrange
      const mockError = new Error("Failed to get result reports");
      mockReportService.getResultReports = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await controller.getResultReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getSummaryReports", () => {
    it("should return summary reports with success message", async () => {
      // Arrange
      mockReq.query = {
        search: "test",
        type: "MAINTENANCE",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        page: "2",
        limit: "20",
      };

      const mockData = [
        { id: "1", type: "MAINTENANCE", comment: "Good condition" },
      ];
      const mockMeta = { total: 1, page: 2, limit: 20, totalPages: 1 };

      mockReportService.getSummaryReports = jest.fn().mockResolvedValue({
        data: mockData,
        meta: mockMeta,
      });

      // Act
      await controller.getSummaryReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getSummaryReports).toHaveBeenCalledWith(
        {
          search: "test",
          type: "MAINTENANCE",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
        },
        { page: 2, limit: 20 },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Summary reports retrieved successfully",
        data: mockData,
        meta: mockMeta,
      });
    });

    it("should handle invalid type parameter", async () => {
      // Arrange
      mockReq.query = {
        type: "INVALID_TYPE", // Invalid type
      };

      mockReportService.getSummaryReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getSummaryReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getSummaryReports).toHaveBeenCalledWith(
        expect.objectContaining({
          type: undefined,
        }),
        expect.anything(),
      );
    });

    it("should handle negative pagination values", async () => {
      // Arrange
      mockReq.query = {
        page: "-1",
        limit: "-5",
      };

      mockReportService.getSummaryReports = jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });

      // Act
      await controller.getSummaryReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockReportService.getSummaryReports).toHaveBeenCalledWith(
        expect.anything(),
        { page: 1, limit: 10 },
      );
    });

    it("should handle errors", async () => {
      // Arrange
      const mockError = new Error("Failed to get summary reports");
      mockReportService.getSummaryReports = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await controller.getSummaryReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  // Add tests to cover lines 74-75, 260-277 in report.controller.ts
  describe("specific edge cases", () => {
    it("should handle all validation cases for parameter validation", async () => {
      // Test all parameter validation blocks

      // Valid values
      mockReq.query = {
        status: "scheduled", // Valid status
        type: "MAINTENANCE", // Valid type
        result: "success", // Valid result
      };

      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );
      await controller.getResultReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Reset mocks
      jest.clearAllMocks();

      // Invalid values that should be undefined in the filter
      mockReq.query = {
        status: "not-valid",
        type: "not-valid",
        result: "not-valid",
      };

      await controller.getPlanReports(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );
      expect(mockReportService.getPlanReports).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
          type: undefined,
        }),
        expect.anything(),
      );
    });
  });
});
