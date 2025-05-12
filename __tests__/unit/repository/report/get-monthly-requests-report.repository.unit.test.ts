import ReportRepository from "../../../../src/repository/report.repository";

// Mock the Prisma client
jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      request: {
        findMany: jest.fn(),
      },
    },
  };
});

// Import after mocking
import prisma from "../../../../src/configs/db.config";

describe("ReportRepository - getMonthlyRequestCounts", () => {
  let repository: ReportRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ReportRepository();
  });

  // POSITIVE CASES
  describe("Positive cases", () => {
    it("should group requests by month and type correctly", async () => {
      // Arrange
      const mockRequests = [
        { createdOn: new Date("2025-05-15"), requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-05-20"), requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-05-10"), requestType: "CALIBRATION" },
        { createdOn: new Date("2025-04-05"), requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-04-20"), requestType: "CALIBRATION" },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getMonthlyRequestCounts();

      // Assert
      expect(prisma.request.findMany).toHaveBeenCalledWith({
        select: {
          createdOn: true,
          requestType: true,
        },
        where: {
          createdOn: {
            not: null,
          },
        },
      });

      expect(result).toHaveLength(2);

      // Check May data
      const mayData = result.find((item) => item.month === "2025-05");
      expect(mayData).toBeDefined();
      expect(mayData!.MAINTENANCE).toBe(2);
      expect(mayData!.CALIBRATION).toBe(1);

      // Check April data
      const aprilData = result.find((item) => item.month === "2025-04");
      expect(aprilData).toBeDefined();
      expect(aprilData!.MAINTENANCE).toBe(1);
      expect(aprilData!.CALIBRATION).toBe(1);
    });

    it("should handle requests all from the same month", async () => {
      // Arrange
      const mockRequests = [
        { createdOn: new Date("2025-05-15"), requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-05-20"), requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-05-10"), requestType: "CALIBRATION" },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getMonthlyRequestCounts();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe("2025-05");
      expect(result[0].MAINTENANCE).toBe(2);
      expect(result[0].CALIBRATION).toBe(1);
    });
  });

  // EDGE CASES
  describe("Edge cases", () => {
    it("should return empty array when there are no requests", async () => {
      // Arrange
      (prisma.request.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.getMonthlyRequestCounts();

      // Assert
      expect(result).toEqual([]);
    });

    it("should ignore requests with null createdOn", async () => {
      // Arrange
      const mockRequests = [
        { createdOn: new Date("2025-05-15"), requestType: "MAINTENANCE" },
        { createdOn: null, requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-05-10"), requestType: "CALIBRATION" },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getMonthlyRequestCounts();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe("2025-05");
      expect(result[0].MAINTENANCE).toBe(1);
      expect(result[0].CALIBRATION).toBe(1);
    });

    it("should ignore requests with invalid requestType", async () => {
      // Arrange
      const mockRequests = [
        { createdOn: new Date("2025-05-15"), requestType: "MAINTENANCE" },
        { createdOn: new Date("2025-05-20"), requestType: "INVALID_TYPE" }, // Invalid type
        { createdOn: new Date("2025-05-10"), requestType: "CALIBRATION" },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getMonthlyRequestCounts();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe("2025-05");
      expect(result[0].MAINTENANCE).toBe(1);
      expect(result[0].CALIBRATION).toBe(1);
      // The INVALID_TYPE should not appear in the results
      expect(Object.keys(result[0]).includes("INVALID_TYPE")).toBe(false);
    });
  });

  // NEGATIVE CASES
  describe("Negative cases", () => {
    it("should throw an error when Prisma query fails", async () => {
      // Arrange
      const mockError = new Error("Database connection error");
      (prisma.request.findMany as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(repository.getMonthlyRequestCounts()).rejects.toThrow(
        "Database connection error",
      );
    });
  });
});
