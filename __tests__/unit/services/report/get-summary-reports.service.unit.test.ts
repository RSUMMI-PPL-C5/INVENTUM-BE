import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";

// Mock dependencies
jest.mock("../../../../src/repository/report.repository");

describe("ReportService - getSummaryReports", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
    (service as any).reportRepository = mockRepository;
  });

  it("should return summary reports with pagination meta", async () => {
    // Arrange
    const mockComments = [
      { id: "1", text: "Comment 1" },
      { id: "2", text: "Comment 2" },
    ];

    mockRepository.getSummaryReports = jest.fn().mockResolvedValue({
      comments: mockComments,
      total: 2,
    });

    // Act
    const result = await service.getSummaryReports();

    // Assert
    expect(mockRepository.getSummaryReports).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual(mockComments);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 2,
      totalPages: 1,
    });
  });

  it("should calculate correct pagination meta with pagination options", async () => {
    // Arrange
    mockRepository.getSummaryReports = jest.fn().mockResolvedValue({
      comments: Array(10)
        .fill(null)
        .map((_, i) => ({ id: `${i + 1}` })),
      total: 30,
    });

    const paginationOptions = { page: 1, limit: 10 };

    // Act
    const result = await service.getSummaryReports(
      undefined,
      paginationOptions,
    );

    // Assert
    expect(mockRepository.getSummaryReports).toHaveBeenCalledWith(
      undefined,
      paginationOptions,
    );
    expect(result.meta).toEqual({
      total: 30,
      page: 1,
      limit: 10,
      totalPages: 3,
    });
  });

  it("should pass filters to repository", async () => {
    // Arrange
    mockRepository.getSummaryReports = jest.fn().mockResolvedValue({
      comments: [],
      total: 0,
    });

    const filters = {
      search: "test",
      type: "MAINTENANCE" as const,
    };

    // Act
    await service.getSummaryReports(filters);

    // Assert
    expect(mockRepository.getSummaryReports).toHaveBeenCalledWith(
      filters,
      undefined,
    );
  });
});
