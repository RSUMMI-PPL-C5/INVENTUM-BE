import ReportRepository from "../../../../src/repository/report.repository";

// Mock the Prisma client
jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      request: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
        count: jest.fn(),
      },
    },
  };
});

// Import after mocking
import prisma from "../../../../src/configs/db.config";

describe("ReportRepository - getRequestStatusReport", () => {
  let repository: ReportRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ReportRepository();
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should return correct status report with percentages", async () => {
      // Arrange
      const mockRequests = [
        { status: "COMPLETED", requestType: "MAINTENANCE" },
        { status: "COMPLETED", requestType: "MAINTENANCE" },
        { status: "ON_PROGRESS", requestType: "MAINTENANCE" },
        { status: "PENDING", requestType: "MAINTENANCE" },
        { status: "COMPLETED", requestType: "CALIBRATION" },
        { status: "ON_PROGRESS", requestType: "CALIBRATION" },
        { status: "PENDING", requestType: "CALIBRATION" },
        // Add an unknown status to test normalization
        { status: "Unknown", requestType: "CALIBRATION" },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getRequestStatusReport();

      // Assert
      expect(result).toBeDefined();
      expect(result.MAINTENANCE).toHaveLength(3); // completed, on progress, pending
      expect(result.CALIBRATION).toHaveLength(3); // completed, on progress, pending

      // Check MAINTENANCE data
      const maintenanceCompleted = result.MAINTENANCE.find(
        (item) => item.status === "completed",
      );
      expect(maintenanceCompleted).toBeDefined();
      expect(maintenanceCompleted!.count).toBe(2);
      expect(maintenanceCompleted!.percentage).toBe(50); // 2 out of 4

      // Check normalization of unknown status (should be mapped to "on progress")
      const calibrationOnProgress = result.CALIBRATION.find(
        (item) => item.status === "on progress",
      );
      expect(calibrationOnProgress).toBeDefined();
      expect(calibrationOnProgress!.count).toBe(2); // 1 regular + 1 normalized from Unknown

      // Check totals - using new property names
      expect(result.total.completed).toBe(3); // 2 MAINTENANCE + 1 CALIBRATION
      expect(result.total.on_progress).toBe(3); // 1 MAINTENANCE + 2 CALIBRATION
      expect(result.total.pending).toBe(2); // 1 MAINTENANCE + 1 CALIBRATION
      expect(result.total.total).toBe(8);
    });
  });

  // EDGE CASES
  describe("Edge cases", () => {
    it("should handle empty data correctly", async () => {
      // Arrange
      (prisma.request.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.getRequestStatusReport();

      // Assert
      expect(result).toBeDefined();
      expect(result.MAINTENANCE).toHaveLength(3); // Still has the status categories
      expect(result.CALIBRATION).toHaveLength(3);

      // All counts should be zero - using new property names
      expect(result.total.completed).toBe(0);
      expect(result.total.on_progress).toBe(0);
      expect(result.total.pending).toBe(0);
      expect(result.total.total).toBe(0);
    });

    it("should handle null data by using empty array fallback", async () => {
      // Arrange
      (prisma.request.findMany as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.getRequestStatusReport();

      // Assert
      expect(result).toBeDefined();
      expect(result.MAINTENANCE).toHaveLength(3);
      expect(result.CALIBRATION).toHaveLength(3);
      expect(result.total.total).toBe(0);
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should throw an error when Prisma query fails", async () => {
      // Arrange
      const mockError = new Error("Database connection error");
      (prisma.request.findMany as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(repository.getRequestStatusReport()).rejects.toThrow(
        "Database connection error",
      );
    });
  });
});
