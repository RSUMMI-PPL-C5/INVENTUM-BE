import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import { MonthlyDataRecord } from "../../../../src/interfaces/report.interface";

// Mock dependencies
jest.mock("../../../../src/repository/report.repository");
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(() => new Date("2025-05-15")),
}));

describe("ReportService - getMonthlyRequestCounts", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
    (service as any).reportRepository = mockRepository;
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return data for last 12 months with actual counts merged in", async () => {
      // Arrange
      const mockRawData: MonthlyDataRecord[] = [
        { month: "2025-05", MAINTENANCE: 10, CALIBRATION: 5 },
        { month: "2025-03", MAINTENANCE: 8, CALIBRATION: 3 },
      ];

      mockRepository.getMonthlyRequestCounts = jest
        .fn()
        .mockResolvedValue(mockRawData);

      // Act
      const result = await service.getMonthlyRequestCounts();

      // Assert
      expect(mockRepository.getMonthlyRequestCounts).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(12); // 12 months of data

      // Check that our mock data was integrated correctly
      const mayData = result.data.find((d) => d.month === "2025-05");
      expect(mayData).toBeDefined();
      expect(mayData!.MAINTENANCE).toBe(10);
      expect(mayData!.CALIBRATION).toBe(5);

      const marchData = result.data.find((d) => d.month === "2025-03");
      expect(marchData).toBeDefined();
      expect(marchData!.MAINTENANCE).toBe(8);
      expect(marchData!.CALIBRATION).toBe(3);

      // Check that a month not in our mock data has zero counts
      const aprilData = result.data.find((d) => d.month === "2025-04");
      expect(aprilData).toBeDefined();
      expect(aprilData!.MAINTENANCE).toBe(0);
      expect(aprilData!.CALIBRATION).toBe(0);
    });

    it("should return results sorted by month in descending order", async () => {
      // Arrange
      mockRepository.getMonthlyRequestCounts = jest.fn().mockResolvedValue([]);

      // Act
      const result = await service.getMonthlyRequestCounts();

      // Assert
      // Check the first three months to verify descending order
      expect(result.data[0].month).toBe("2025-05");
      expect(result.data[1].month).toBe("2025-04");
      expect(result.data[2].month).toBe("2025-03");

      // Additional check to ensure the entire array is sorted
      const isSorted = result.data.every(
        (item, i, arr) =>
          i === 0 || item.month.localeCompare(arr[i - 1].month) <= 0,
      );
      expect(isSorted).toBe(true);
    });
  });

  // EDGE CASES
  describe("Edge cases", () => {
    it("should handle empty data from repository", async () => {
      // Arrange
      mockRepository.getMonthlyRequestCounts = jest.fn().mockResolvedValue([]);

      // Act
      const result = await service.getMonthlyRequestCounts();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(12); // Still returns 12 months

      // All months should have zero counts
      result.data.forEach((month) => {
        expect(month.MAINTENANCE).toBe(0);
        expect(month.CALIBRATION).toBe(0);
      });
    });

    it("should handle null values in data from repository", async () => {
      // Arrange
      const mockRawData = [
        { month: "2025-05", MAINTENANCE: null, CALIBRATION: 5 },
        { month: "2025-03", MAINTENANCE: 8, CALIBRATION: null },
      ] as unknown as MonthlyDataRecord[];

      mockRepository.getMonthlyRequestCounts = jest
        .fn()
        .mockResolvedValue(mockRawData);

      // Act
      const result = await service.getMonthlyRequestCounts();

      // Assert
      const mayData = result.data.find((d) => d.month === "2025-05");
      expect(mayData!.MAINTENANCE).toBe(0); // Null should be converted to 0
      expect(mayData!.CALIBRATION).toBe(5);

      const marchData = result.data.find((d) => d.month === "2025-03");
      expect(marchData!.MAINTENANCE).toBe(8);
      expect(marchData!.CALIBRATION).toBe(0); // Null should be converted to 0
    });

    it("should ignore data for months outside the last 12 months", async () => {
      // Arrange
      const mockRawData: MonthlyDataRecord[] = [
        { month: "2025-05", MAINTENANCE: 10, CALIBRATION: 5 },
        { month: "2024-01", MAINTENANCE: 15, CALIBRATION: 7 }, // Outside last 12 months
      ];

      mockRepository.getMonthlyRequestCounts = jest
        .fn()
        .mockResolvedValue(mockRawData);

      // Act
      const result = await service.getMonthlyRequestCounts();

      // Assert
      // May data should be included
      const mayData = result.data.find((d) => d.month === "2025-05");
      expect(mayData!.MAINTENANCE).toBe(10);
      expect(mayData!.CALIBRATION).toBe(5);

      // Only months within the last 12 should be present
      const months = result.data.map((d) => d.month);
      expect(months).not.toContain("2024-01");

      // Verify we still have exactly 12 months of data
      expect(result.data).toHaveLength(12);
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should propagate errors from repository", async () => {
      // Arrange
      const mockError = new Error("Database error");
      mockRepository.getMonthlyRequestCounts = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.getMonthlyRequestCounts()).rejects.toThrow(
        "Database error",
      );
      expect(mockRepository.getMonthlyRequestCounts).toHaveBeenCalledTimes(1);
    });

    it("should handle invalid data format from repository", async () => {
      // Arrange
      // @ts-ignore - Deliberately passing invalid data for testing
      mockRepository.getMonthlyRequestCounts = jest.fn().mockResolvedValue([
        { month: "2025-05", INVALID: 10 }, // Missing required properties
      ]);

      // Act
      const result = await service.getMonthlyRequestCounts();

      // Assert
      // Should still return 12 months with proper structure
      expect(result.data).toHaveLength(12);

      // May data should have zeros for maintenance and calibration
      const mayData = result.data.find((d) => d.month === "2025-05");
      expect(mayData!.MAINTENANCE).toBe(0);
      expect(mayData!.CALIBRATION).toBe(0);
    });
  });
});
