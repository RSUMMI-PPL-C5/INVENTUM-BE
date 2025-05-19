import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import { CountReport } from "../../../../src/interfaces/report.interface";

// Mock the repository
jest.mock("../../../../src/repository/report.repository");

describe("ReportService", () => {
  let reportService: ReportService;
  let mockReportRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    // Create properly mocked repository
    mockReportRepository = {
      getCountReport: jest.fn(),
    } as any as jest.Mocked<ReportRepository>;

    // Create service instance
    reportService = new ReportService();

    // Replace the repository instance with our mock
    (reportService as any).reportRepository = mockReportRepository;
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

      // Mock repository response
      mockReportRepository.getCountReport.mockResolvedValue(mockCountReport);

      // Execute
      const result = await reportService.getCountReport();

      // Assert
      expect(mockReportRepository.getCountReport).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockCountReport,
      });
    });

    it("should handle repository errors gracefully", async () => {
      // Mock repository error
      mockReportRepository.getCountReport.mockRejectedValue(
        new Error("Database error"),
      );

      // Execute and assert
      await expect(reportService.getCountReport()).rejects.toThrow(
        "Database error",
      );
    });

    it("should return zero counts when repository returns empty data", async () => {
      // Mock empty data
      const emptyCountReport: CountReport = {
        maintenanceCount: 0,
        calibrationCount: 0,
        sparePartsCount: 0,
        maintenancePercentageChange: 0,
        calibrationPercentageChange: 0,
        sparePartsPercentageChange: 0,
      };

      mockReportRepository.getCountReport.mockResolvedValue(emptyCountReport);

      // Execute
      const result = await reportService.getCountReport();

      // Assert
      expect(result).toEqual({
        success: true,
        data: emptyCountReport,
      });
    });
  });
});
