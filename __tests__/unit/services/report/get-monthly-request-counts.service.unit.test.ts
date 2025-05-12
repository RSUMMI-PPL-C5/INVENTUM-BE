import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";

// Mock dependencies
jest.mock("../../../../src/repository/report.repository");

describe("ReportService - getMonthlyRequestCounts", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
    (service as any).reportRepository = mockRepository;
  });

  it("should fetch and process monthly request counts", async () => {
    // Arrange
    const mockMonthlyData = [
      { month: "2023-07", MAINTENANCE: 5, CALIBRATION: 3 },
      { month: "2023-06", MAINTENANCE: 2, CALIBRATION: 1 },
    ];

    mockRepository.getMonthlyRequestCounts = jest
      .fn()
      .mockResolvedValue(mockMonthlyData);

    // Spy on the ensureLast12Months method with correct typing
    jest
      .spyOn(service as any, "ensureLast12Months")
      .mockImplementation((...args: unknown[]) => {
        const data = args[0] as any[];
        // Return a 12-month dataset based on the input
        return Array(12)
          .fill(null)
          .map((_, i) => ({
            month: `2023-${String(12 - i).padStart(2, "0")}`,
            MAINTENANCE: i % 3,
            CALIBRATION: (i + 1) % 4,
          }));
      });

    // Act
    const result = await service.getMonthlyRequestCounts();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(12); // Should have 12 months
    expect(mockRepository.getMonthlyRequestCounts).toHaveBeenCalled();
    expect((service as any).ensureLast12Months).toHaveBeenCalledWith(
      mockMonthlyData,
    );
  });

  it("should handle repository errors", async () => {
    // Arrange
    const mockError = new Error("Database error");
    mockRepository.getMonthlyRequestCounts = jest
      .fn()
      .mockRejectedValue(mockError);

    // Act & Assert
    await expect(service.getMonthlyRequestCounts()).rejects.toThrow(
      "Database error",
    );
  });
});
