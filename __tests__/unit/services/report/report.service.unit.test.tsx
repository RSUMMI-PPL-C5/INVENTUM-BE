import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";

// Mock the repository
jest.mock("../../../../src/repository/report.repository", () => {
  return jest.fn().mockImplementation(() => ({
    getMonthlyRequestCounts: jest.fn(),
    getPlanReports: jest.fn(),
    getResultReports: jest.fn(),
    getSummaryReports: jest.fn(),
  }));
});

// Mock date utils if used in the service
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(() => new Date("2023-06-15")),
}));

describe("ReportService", () => {
  let reportService: ReportService;
  let reportRepository: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    reportService = new ReportService();
    reportRepository = new (ReportRepository as any)();
    (reportService as any).reportRepository = reportRepository;
  });

  describe("getMonthlyRequestCounts", () => {
    it("should return monthly request counts with data filled for 12 months", async () => {
      const mockRawData = [
        { month: "2023-01", MAINTENANCE: 5, CALIBRATION: 3 },
        { month: "2023-03", MAINTENANCE: 10, CALIBRATION: 7 },
      ];

      reportRepository.getMonthlyRequestCounts.mockResolvedValue(mockRawData);

      const result = await reportService.getMonthlyRequestCounts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(12);
      expect(result.data.find((d) => d.month === "2023-01")?.MAINTENANCE).toBe(
        5,
      );
      expect(result.data.find((d) => d.month === "2023-01")?.CALIBRATION).toBe(
        3,
      );
      expect(result.data.find((d) => d.month === "2023-03")?.MAINTENANCE).toBe(
        10,
      );
      expect(result.data.find((d) => d.month === "2023-02")?.MAINTENANCE).toBe(
        0,
      );
    });

    it("should handle empty data", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue([]);

      const result = await reportService.getMonthlyRequestCounts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(12);
      result.data.forEach((item) => {
        expect(item.MAINTENANCE).toBe(0);
        expect(item.CALIBRATION).toBe(0);
      });
    });

    it("should throw error for null data", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue(null as any);

      await expect(reportService.getMonthlyRequestCounts()).rejects.toThrow(
        "Data input tidak valid: harap berikan array data bulanan",
      );
    });

    it("should throw error for invalid data format", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue(
        "not an array" as any,
      );

      await expect(reportService.getMonthlyRequestCounts()).rejects.toThrow(
        "Data input tidak valid: harap berikan array data bulanan",
      );
    });

    it("should throw error for undefined data", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue(
        undefined as any,
      );

      await expect(reportService.getMonthlyRequestCounts()).rejects.toThrow(
        "Data input tidak valid: harap berikan array data bulanan",
      );
    });
  });

  describe("getPlanReports", () => {
    it("should return plan reports with pagination", async () => {
      const mockPlans = [{ id: "1" }, { id: "2" }];
      const mockTotal = 10;
      const mockPagination = { page: 2, limit: 2 };

      reportRepository.getPlanReports.mockResolvedValue({
        plans: mockPlans,
        total: mockTotal,
      });

      const result = await reportService.getPlanReports({}, mockPagination);

      expect(result.data).toBe(mockPlans);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(5); // 10/2 = 5
    });

    it("should return plan reports without pagination", async () => {
      const mockPlans = [{ id: "1" }, { id: "2" }];
      const mockTotal = 2;

      reportRepository.getPlanReports.mockResolvedValue({
        plans: mockPlans,
        total: mockTotal,
      });

      const result = await reportService.getPlanReports();

      expect(result.data).toBe(mockPlans);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("getResultReports", () => {
    it("should return result reports with pagination", async () => {
      const mockResults = [{ id: "1" }, { id: "2" }];
      const mockTotal = 10;
      const mockPagination = { page: 2, limit: 2 };

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: mockTotal,
      });

      const result = await reportService.getResultReports({}, mockPagination);

      expect(result.data).toBe(mockResults);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(5);
    });

    it("should return result reports without pagination", async () => {
      const mockResults = [{ id: "1" }, { id: "2" }];
      const mockTotal = 2;

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: mockTotal,
      });

      const result = await reportService.getResultReports();

      expect(result.data).toBe(mockResults);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("getSummaryReports", () => {
    it("should return summary reports with pagination", async () => {
      const mockComments = [{ id: "1" }, { id: "2" }];
      const mockTotal = 10;
      const mockPagination = { page: 2, limit: 2 };

      reportRepository.getSummaryReports.mockResolvedValue({
        comments: mockComments,
        total: mockTotal,
      });

      const result = await reportService.getSummaryReports({}, mockPagination);

      expect(result.data).toBe(mockComments);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(5);
    });

    it("should return summary reports without pagination", async () => {
      const mockComments = [{ id: "1" }, { id: "2" }];
      const mockTotal = 2;

      reportRepository.getSummaryReports.mockResolvedValue({
        comments: mockComments,
        total: mockTotal,
      });

      const result = await reportService.getSummaryReports();

      expect(result.data).toBe(mockComments);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("Private methods", () => {
    describe("ensureLast12Months", () => {
      it("should ensure data for last 12 months is present", () => {
        const mockRawData = [
          { month: "2023-01", MAINTENANCE: 5, CALIBRATION: 3 },
          { month: "2023-03", MAINTENANCE: 10, CALIBRATION: 7 },
        ];

        const result = (reportService as any).ensureLast12Months(mockRawData);

        expect(result).toHaveLength(12);
        expect(result.find((d: any) => d.month === "2023-01").MAINTENANCE).toBe(
          5,
        );
        expect(result.find((d: any) => d.month === "2023-01").CALIBRATION).toBe(
          3,
        );
        expect(result.find((d: any) => d.month === "2023-03").MAINTENANCE).toBe(
          10,
        );
        expect(result.find((d: any) => d.month === "2023-02").MAINTENANCE).toBe(
          0,
        );
      });

      it("should ignore months outside the last 12 months range", () => {
        // Get the current date used in the function (2023-06-15 from mocked getJakartaTime)
        const currentDate = new Date("2023-06-15");

        // Create a date that's more than 12 months in the past
        const oldDate = new Date(currentDate);
        oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago
        const oldYearMonth = `${oldDate.getFullYear()}-${String(oldDate.getMonth() + 1).padStart(2, "0")}`;

        const mockRawData = [
          { month: "2023-01", MAINTENANCE: 5, CALIBRATION: 3 },
          { month: oldYearMonth, MAINTENANCE: 99, CALIBRATION: 99 }, // This should be ignored
        ];

        const result = (reportService as any).ensureLast12Months(mockRawData);

        expect(result).toHaveLength(12);
        expect(result.find((d: any) => d.month === "2023-01").MAINTENANCE).toBe(
          5,
        );
        expect(
          result.find((d: any) => d.month === oldYearMonth),
        ).toBeUndefined();
        // Verify the old month data is not included in any result item
        expect(result.some((d: any) => d.MAINTENANCE === 99)).toBe(false);
      });

      // Add a more specific test with a hardcoded month outside the range
      it("should specifically handle months that don't exist in monthsData", () => {
        // Use a fixed month string that is definitely not in the last 12 months from 2023-06-15
        const mockRawData = [
          { month: "2023-01", MAINTENANCE: 5, CALIBRATION: 3 },
          { month: "2020-01", MAINTENANCE: 99, CALIBRATION: 99 }, // Much older date, definitely outside range
          { month: "non-existent", MAINTENANCE: 50, CALIBRATION: 50 }, // Invalid month format
        ];

        const result = (reportService as any).ensureLast12Months(mockRawData);

        expect(result).toHaveLength(12);
        expect(result.find((d: any) => d.month === "2023-01").MAINTENANCE).toBe(
          5,
        );
        // Verify none of the months have the values from the out-of-range items
        expect(
          result.some((d: any) => d.MAINTENANCE === 99 || d.MAINTENANCE === 50),
        ).toBe(false);
        expect(
          result.some((d: any) => d.CALIBRATION === 99 || d.CALIBRATION === 50),
        ).toBe(false);
      });

      it("should throw error for non-array input", () => {
        expect(() =>
          (reportService as any).ensureLast12Months("not an array"),
        ).toThrow("Data input tidak valid: harap berikan array data bulanan");
      });

      it("should throw error for null input", () => {
        expect(() => (reportService as any).ensureLast12Months(null)).toThrow(
          "Data input tidak valid: harap berikan array data bulanan",
        );
      });

      it("should throw error for undefined input", () => {
        expect(() =>
          (reportService as any).ensureLast12Months(undefined),
        ).toThrow("Data input tidak valid: harap berikan array data bulanan");
      });

      it("should handle null or undefined values in raw data", () => {
        const mockRawData = [
          { month: "2023-01", MAINTENANCE: null, CALIBRATION: 3 },
          { month: "2023-02", MAINTENANCE: 5, CALIBRATION: undefined },
          { month: "2023-03", MAINTENANCE: undefined, CALIBRATION: null },
        ];

        const result = (reportService as any).ensureLast12Months(mockRawData);

        expect(result).toHaveLength(12);
        expect(result.find((d: any) => d.month === "2023-01").MAINTENANCE).toBe(
          0,
        );
        expect(result.find((d: any) => d.month === "2023-01").CALIBRATION).toBe(
          3,
        );
        expect(result.find((d: any) => d.month === "2023-02").MAINTENANCE).toBe(
          5,
        );
        expect(result.find((d: any) => d.month === "2023-02").CALIBRATION).toBe(
          0,
        );
        expect(result.find((d: any) => d.month === "2023-03").MAINTENANCE).toBe(
          0,
        );
        expect(result.find((d: any) => d.month === "2023-03").CALIBRATION).toBe(
          0,
        );
      });
    });
  });
});
