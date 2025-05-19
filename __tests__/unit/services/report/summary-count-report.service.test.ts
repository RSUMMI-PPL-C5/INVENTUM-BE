import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import { CountReport } from "../../../../src/interfaces/report.interface";

jest.mock("../../../src/repository/report.repository");

describe("ReportService", () => {
  let reportService: ReportService;
  let mockReportRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    mockReportRepository =
      new ReportRepository() as jest.Mocked<ReportRepository>;
    reportService = new ReportService();
  });

  describe("getCountReport", () => {
    it("should return count report data successfully", async () => {
      // Mock data
      const mockCountReport: CountReport = {
        maintenanceCount: 124,
        calibrationCount: 87,
        sparePartsCount: 36,
      };

      // Mock repository response
      mockReportRepository.getCountReport = jest
        .fn()
        .mockResolvedValue(mockCountReport);

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
      mockReportRepository.getCountReport = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

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
      };

      mockReportRepository.getCountReport = jest
        .fn()
        .mockResolvedValue(emptyCountReport);

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
