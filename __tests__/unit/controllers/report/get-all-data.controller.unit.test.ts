import { Request, Response, NextFunction } from "express";
import ReportController from "../../../../src/controllers/report.controller";
import ReportService from "../../../../src/services/report.service";

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

  it("should successfully export data and return Excel file", async () => {
    const mockBuffer = Buffer.from("mock excel data");
    mockRequest = {
      query: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    };
    mockReportService.exportAllData.mockResolvedValue(mockBuffer);

    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

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

  it("should call next with error when service throws", async () => {
    const error = new Error("Service error");
    mockRequest = {
      query: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    };
    mockReportService.exportAllData.mockRejectedValue(error);

    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });

  it("should handle same start and end date", async () => {
    const mockBuffer = Buffer.from("mock excel data");
    mockRequest = {
      query: {
        startDate: "2024-01-01",
        endDate: "2024-01-01",
      },
    };
    mockReportService.exportAllData.mockResolvedValue(mockBuffer);

    await controller.exportAllData(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockReportService.exportAllData).toHaveBeenCalledWith(
      new Date("2024-01-01"),
      new Date("2024-01-01"),
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
  });
});
