import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock dependencies
jest.mock("../../../../src/repository/report.repository");
jest.mock("../../../../src/utils/date.utils");

describe("ReportService - getMonthlyRequestCounts", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
    (service as any).reportRepository = mockRepository;

    // Mock getJakartaTime to return a fixed date for consistent testing
    (getJakartaTime as jest.Mock).mockReturnValue(new Date(2023, 6, 15)); // July 15, 2023
  });

  it("should fetch and process monthly data", async () => {
    // Arrange
    const mockMonthlyData = [
      { month: "2023-07", MAINTENANCE: 5, CALIBRATION: 3 },
      { month: "2023-06", MAINTENANCE: 2, CALIBRATION: 1 },
      { month: "2023-05", MAINTENANCE: 0, CALIBRATION: 2 },
      // Other months are missing and should be filled with zeros
    ];

    mockRepository.getMonthlyRequestCounts = jest
      .fn()
      .mockResolvedValue(mockMonthlyData);

    // Act
    const result = await service.getMonthlyRequestCounts();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(12); // Should have data for all 12 months

    // First month should be most recent (July 2023 based on mock)
    expect(result.data[0].month).toBe("2023-07");
    expect(result.data[0].MAINTENANCE).toBe(5);
    expect(result.data[0].CALIBRATION).toBe(3);

    // Check that a month with zeros is properly represented
    expect(result.data[2].month).toBe("2023-05");
    expect(result.data[2].MAINTENANCE).toBe(0);
    expect(result.data[2].CALIBRATION).toBe(2);

    // Check that a month not in the input is filled with zeros
    expect(result.data[11].MAINTENANCE).toBe(0);
    expect(result.data[11].CALIBRATION).toBe(0);
  });

  it("should reject with error when repository fails", async () => {
    // Arrange
    const error = new Error("Database error");
    mockRepository.getMonthlyRequestCounts = jest.fn().mockRejectedValue(error);

    // Act & Assert
    await expect(service.getMonthlyRequestCounts()).rejects.toThrow(
      "Database error",
    );
  });

  // Test edge cases for monthly data
  it("should handle edge cases in monthly data", async () => {
    // Arrange - empty array, should still return 12 months of zeros
    mockRepository.getMonthlyRequestCounts = jest.fn().mockResolvedValue([]);

    // Act
    const result = await service.getMonthlyRequestCounts();

    // Assert
    expect(result.data.length).toBe(12);

    // All months should have zeros
    expect(
      result.data.every(
        (item) => item.MAINTENANCE === 0 && item.CALIBRATION === 0,
      ),
    ).toBe(true);
  });
});
