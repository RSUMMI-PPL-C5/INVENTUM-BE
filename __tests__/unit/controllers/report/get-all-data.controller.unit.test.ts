import { Request, Response, NextFunction } from "express";
import ReportController from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";

// Mock the service
jest.mock("../../../../src/services/report.service");

describe("ReportController - exportAllData", () => {
  let controller: ReportController;
  let mockReportService: jest.Mocked<ReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportService = new ReportService() as jest.Mocked<ReportService>;
    (ReportService as jest.Mock).mockImplementation(() => mockReportService);

    controller = new ReportController();
    mockNext = jest.fn();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
  });

  // Positive case - successful export
  it("should successfully export data and return Excel file", async () => {
    // Arrange
    const mockBuffer = Buffer.from("mock excel data");
    mockRequest = {
      query: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    };
    mockReportService.exportAllData.mockResolvedValue(mockBuffer);

    // Act
    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockReportService.exportAllData).toHaveBeenCalledWith(
      new Date("2024-01-01"),
      new Date("2024-12-31"),
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      "attachment; filename=inventum-report.xlsx",
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
  });

  // Negative case - missing dates
  it("should return 400 when dates are missing", async () => {
    // Arrange
    mockRequest = {
      query: {},
    };

    // Act
    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Start date and end date are required",
    });
    expect(mockReportService.exportAllData).not.toHaveBeenCalled();
  });

  // Negative case - service error
  it("should call next with error when service throws", async () => {
    // Arrange
    const error = new Error("Service error");
    mockRequest = {
      query: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    };
    mockReportService.exportAllData.mockRejectedValue(error);

    // Act
    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });

  // Edge case - same start and end date
  it("should handle same start and end date", async () => {
    // Arrange
    const mockBuffer = Buffer.from("mock excel data");
    mockRequest = {
      query: {
        startDate: "2024-01-01",
        endDate: "2024-01-01",
      },
    };
    mockReportService.exportAllData.mockResolvedValue(mockBuffer);

    // Act
    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Assert
    expect(mockReportService.exportAllData).toHaveBeenCalledWith(
      new Date("2024-01-01"),
      new Date("2024-01-01"),
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
  });
});
