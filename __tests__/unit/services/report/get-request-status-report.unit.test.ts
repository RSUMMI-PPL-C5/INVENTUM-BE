import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import { RequestStatusReport } from "../../../../src/interfaces/report.interface";

// Mock repository
jest.mock("../../../../src/repository/report.repository");

describe("ReportService - getRequestStatusReport", () => {
  let service: ReportService;
  let mockRepository: jest.MockedObject<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock repository instance with the mocked method
    mockRepository = {
      getRequestStatusReport: jest.fn(),
      getMonthlyRequestCounts: jest.fn(),
    } as any;

    // Mock the constructor to return our mock repository
    (
      ReportRepository as jest.MockedClass<typeof ReportRepository>
    ).mockImplementation(() => mockRepository);

    // Create service with our mocked repository
    service = new ReportService();
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return formatted request status report", async () => {
      // Arrange
      const mockReportData: RequestStatusReport = {
        MAINTENANCE: [
          { status: "completed", count: 50, percentage: 50 },
          { status: "on progress", count: 30, percentage: 30 },
          { status: "pending", count: 20, percentage: 20 },
        ],
        CALIBRATION: [
          { status: "completed", count: 40, percentage: 40 },
          { status: "on progress", count: 40, percentage: 40 },
          { status: "pending", count: 20, percentage: 20 },
        ],
        total: {
          completed: 90,
          on_progress: 70,
          pending: 40,
          total: 200,
        },
      };

      // Set up the mock return value
      mockRepository.getRequestStatusReport.mockResolvedValue(mockReportData);

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
          completed: 0,
          on_progress: 0,
          pending: 0,
          total: 0,
        },
      };

      mockRepository.getRequestStatusReport.mockResolvedValue(emptyReport);

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
      mockRepository.getRequestStatusReport.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.getRequestStatusReport()).rejects.toThrow(
        "Repository error",
      );
    });
  });
});
