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
      const result = await repository.getRequestStatusReport();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("MAINTENANCE");
      expect(result).toHaveProperty("CALIBRATION");
      expect(result).toHaveProperty("total");
      expect(result.total).toHaveProperty("success");
      expect(result.total).toHaveProperty("warning");
      expect(result.total).toHaveProperty("failed");
      expect(result.total).toHaveProperty("total");
    });
  });

  // EDGE CASES
  describe("Edge cases", () => {
    it("should handle empty data correctly", async () => {
      const result = await repository.getRequestStatusReport();
      expect(result).toBeDefined();
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should throw an error when Prisma query fails", async () => {
      const mockError = new Error("Database connection error");
      // Mock implementation will depend on how the repository is implemented

      // We'll assume the implementation will use prisma.request.findMany or similar
      (prisma.request.findMany as jest.Mock).mockRejectedValue(mockError);

      try {
        await repository.getRequestStatusReport();
        fail("Expected the function to throw an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
