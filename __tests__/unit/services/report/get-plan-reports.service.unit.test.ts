import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";

// Mock dependencies
jest.mock("../../../../src/repository/report.repository");

describe("ReportService - getPlanReports", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
    (service as any).reportRepository = mockRepository;
  });

  it("should return plan reports with pagination meta", async () => {
    // Arrange
    const mockPlans = [
      { id: "1", requestType: "MAINTENANCE" },
      { id: "2", requestType: "CALIBRATION" },
    ];

    mockRepository.getPlanReports = jest.fn().mockResolvedValue({
      plans: mockPlans,
      total: 2,
    });

    // Act
    const result = await service.getPlanReports();

    // Assert
    expect(mockRepository.getPlanReports).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual(mockPlans);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 2,
      totalPages: 1,
    });
  });

  it("should calculate correct pagination meta with pagination options", async () => {
    // Arrange
    const mockPlans = Array(20)
      .fill(null)
      .map((_, i) => ({ id: `${i + 1}` }));
    mockRepository.getPlanReports = jest.fn().mockResolvedValue({
      plans: mockPlans.slice(0, 10), // First page of results
      total: 20, // Total 20 results overall
    });

    const paginationOptions = { page: 1, limit: 10 };

    // Act
    const result = await service.getPlanReports(undefined, paginationOptions);

    // Assert
    expect(mockRepository.getPlanReports).toHaveBeenCalledWith(
      undefined,
      paginationOptions,
    );
    expect(result.meta).toEqual({
      total: 20,
      page: 1,
      limit: 10,
      totalPages: 2, // 20 items with limit 10 = 2 pages
    });
  });

  it("should pass filters to repository", async () => {
    // Arrange
    mockRepository.getPlanReports = jest.fn().mockResolvedValue({
      plans: [],
      total: 0,
    });

    const filters = {
      search: "test",
      status: "scheduled" as const,
      type: "MAINTENANCE" as const,
    };

    // Act
    await service.getPlanReports(filters);

    // Assert
    expect(mockRepository.getPlanReports).toHaveBeenCalledWith(
      filters,
      undefined,
    );
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const mockError = new Error("Repository error");
    mockRepository.getPlanReports = jest.fn().mockRejectedValue(mockError);

    // Act & Assert
    await expect(service.getPlanReports()).rejects.toThrow("Repository error");
  });
});
