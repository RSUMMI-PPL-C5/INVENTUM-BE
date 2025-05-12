import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import { RequestStatusReport } from "../../../../src/interfaces/report.interface";

// Mock repository
jest.mock("../../../../src/repository/report.repository");

describe("ReportService - getRequestStatusReport", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return formatted request status report", async () => {
      // Arrange
      const mockReportData: RequestStatusReport = {
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

      mockRepository.getRequestStatusReport = jest
        .fn()
        .mockResolvedValue(mockReportData);
      (ReportRepository as jest.Mock).mockImplementation(() => mockRepository);

      // Act
      const result = await service.getRequestStatusReport();

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockReportData,
      });
      expect(mockRepository.getRequestStatusReport).toHaveBeenCalled();
    });
  });

  // EDGE CASES
  describe("Edge cases", () => {
    it("should handle empty report data correctly", async () => {
      // Arrange
      const emptyReport: RequestStatusReport = {
        MAINTENANCE: [],
        CALIBRATION: [],
        total: {
          success: 0,
          warning: 0,
          failed: 0,
          total: 0,
        },
      };

      mockRepository.getRequestStatusReport = jest
        .fn()
        .mockResolvedValue(emptyReport);
      (ReportRepository as jest.Mock).mockImplementation(() => mockRepository);

      // Act
      const result = await service.getRequestStatusReport();

      // Assert
      expect(result).toEqual({
        success: true,
        data: emptyReport,
      });
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should throw error when repository fails", async () => {
      // Arrange
      const mockError = new Error("Repository error");
      mockRepository.getRequestStatusReport = jest
        .fn()
        .mockRejectedValue(mockError);
      (ReportRepository as jest.Mock).mockImplementation(() => mockRepository);

      // Act & Assert
      await expect(service.getRequestStatusReport()).rejects.toThrow(
        "Repository error",
      );
    });
  });
});
