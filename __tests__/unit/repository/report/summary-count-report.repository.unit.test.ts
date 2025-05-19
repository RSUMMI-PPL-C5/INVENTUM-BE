import { PrismaClient } from "@prisma/client";
import ReportRepository from "../../../../src/repository/report.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock the entire PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    request: {
      count: jest.fn(),
    },
    partsHistory: {
      count: jest.fn(),
    },
  })),
}));

jest.mock("../../../../src/utils/date.utils");

describe("ReportRepository", () => {
  let reportRepository: ReportRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    // Create a new mock instance for each test
    const MockedPrismaClient = PrismaClient as jest.MockedClass<
      typeof PrismaClient
    >;
    mockPrisma = new MockedPrismaClient() as jest.Mocked<PrismaClient>;

    // Replace the prisma instance in the repository
    reportRepository = new ReportRepository();
    (reportRepository as any).prisma = mockPrisma;

    // Mock the date utility
    (getJakartaTime as jest.Mock).mockReturnValue(new Date("2024-03-20"));
  });

  describe("getCountReport", () => {
    it("should return correct counts and percentage changes for all metrics", async () => {
      // Mock data
      const mockCurrentMonthMaintenanceCount = 124;
      const mockCurrentMonthCalibrationCount = 87;
      const mockCurrentMonthPartsCount = 36;
      const mockPrevMonthMaintenanceCount = 100;
      const mockPrevMonthCalibrationCount = 80;
      const mockPrevMonthPartsCount = 32;

      // Mock Prisma responses for request counts
      // FIXED: Use createdOn instead of createdAt
      (mockPrisma.request.count as jest.Mock).mockImplementation((args) => {
        const month = args.where.createdOn.gte.getMonth();
        if (args.where.requestType === "MAINTENANCE") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        } else if (args.where.requestType === "CALIBRATION") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        }
        return Promise.resolve(0);
      });

      // Mock Prisma responses for parts history counts
      (mockPrisma.partsHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.replacementDate.gte.getMonth();
          return Promise.resolve(
            month === 2 ? mockCurrentMonthPartsCount : mockPrevMonthPartsCount,
          );
        },
      );

      // Execute
      const result = await reportRepository.getCountReport();

      // Calculate expected percentage changes
      const expectedMaintenancePercentageChange =
        ((mockCurrentMonthMaintenanceCount - mockPrevMonthMaintenanceCount) /
          mockPrevMonthMaintenanceCount) *
        100;
      const expectedCalibrationPercentageChange =
        ((mockCurrentMonthCalibrationCount - mockPrevMonthCalibrationCount) /
          mockPrevMonthCalibrationCount) *
        100;
      const expectedPartsPercentageChange =
        ((mockCurrentMonthPartsCount - mockPrevMonthPartsCount) /
          mockPrevMonthPartsCount) *
        100;

      // Assert
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange:
          Math.round(expectedMaintenancePercentageChange * 100) / 100,
        calibrationPercentageChange:
          Math.round(expectedCalibrationPercentageChange * 100) / 100,
        sparePartsPercentageChange:
          Math.round(expectedPartsPercentageChange * 100) / 100,
      });

      // Verify that the correct number of calls were made
      expect(mockPrisma.request.count).toHaveBeenCalledTimes(4); // 2 for MAINTENANCE, 2 for CALIBRATION
      expect(mockPrisma.partsHistory.count).toHaveBeenCalledTimes(2); // current and previous month
    });

    it("should handle errors gracefully", async () => {
      // Mock Prisma error
      (mockPrisma.request.count as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      // Execute and assert
      await expect(reportRepository.getCountReport()).rejects.toThrow(
        "Database error",
      );
    });

    it("should return zero counts and percentage changes when no data exists", async () => {
      // Mock Prisma responses with zero counts
      (mockPrisma.request.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.partsHistory.count as jest.Mock).mockResolvedValue(0);

      // Execute
      const result = await reportRepository.getCountReport();

      // Assert
      expect(result).toEqual({
        maintenanceCount: 0,
        calibrationCount: 0,
        sparePartsCount: 0,
        maintenancePercentageChange: 0,
        calibrationPercentageChange: 0,
        sparePartsPercentageChange: 0,
      });
    });

    it("should handle capped percentage increase when previous month had zero counts", async () => {
      // Mock data - UPDATED TEST NAME AND EXPECTATIONS
      const mockCurrentMonthMaintenanceCount = 10;
      const mockCurrentMonthCalibrationCount = 5;
      const mockCurrentMonthPartsCount = 8;
      const mockPrevMonthMaintenanceCount = 0;
      const mockPrevMonthCalibrationCount = 0;
      const mockPrevMonthPartsCount = 0;

      // Mock Prisma responses for request counts
      // FIXED: Use createdOn instead of createdAt
      (mockPrisma.request.count as jest.Mock).mockImplementation((args) => {
        const month = args.where.createdOn.gte.getMonth();
        if (args.where.requestType === "MAINTENANCE") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        } else if (args.where.requestType === "CALIBRATION") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        }
        return Promise.resolve(0);
      });

      // Mock Prisma responses for parts history counts
      (mockPrisma.partsHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.replacementDate.gte.getMonth();
          return Promise.resolve(
            month === 2 ? mockCurrentMonthPartsCount : mockPrevMonthPartsCount,
          );
        },
      );

      // Execute
      const result = await reportRepository.getCountReport();

      // Assert - UPDATED: Expect 999% instead of 100%
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: 999,
        calibrationPercentageChange: 999,
        sparePartsPercentageChange: 999,
      });
    });

    // NEW TEST: Test percentage capping for extreme increases
    it("should cap percentage at 999% for extreme increases", async () => {
      // Mock data - extreme increase scenario
      const mockCurrentMonthMaintenanceCount = 1000;
      const mockCurrentMonthCalibrationCount = 500;
      const mockCurrentMonthPartsCount = 2000;
      const mockPrevMonthMaintenanceCount = 1; // Would be 99,900% increase
      const mockPrevMonthCalibrationCount = 1; // Would be 49,900% increase
      const mockPrevMonthPartsCount = 1; // Would be 199,900% increase

      // Mock Prisma responses for request counts
      (mockPrisma.request.count as jest.Mock).mockImplementation((args) => {
        const month = args.where.createdOn.gte.getMonth();
        if (args.where.requestType === "MAINTENANCE") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        } else if (args.where.requestType === "CALIBRATION") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        }
        return Promise.resolve(0);
      });

      // Mock Prisma responses for parts history counts
      (mockPrisma.partsHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.replacementDate.gte.getMonth();
          return Promise.resolve(
            month === 2 ? mockCurrentMonthPartsCount : mockPrevMonthPartsCount,
          );
        },
      );

      // Execute
      const result = await reportRepository.getCountReport();

      // Assert - All should be capped at 999%
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: 999,
        calibrationPercentageChange: 999,
        sparePartsPercentageChange: 999,
      });
    });

    // NEW TEST: Test normal percentage calculations (within cap)
    it("should calculate normal percentages when within cap limits", async () => {
      // Mock data - normal changes
      const mockCurrentMonthMaintenanceCount = 120;
      const mockCurrentMonthCalibrationCount = 60;
      const mockCurrentMonthPartsCount = 45;
      const mockPrevMonthMaintenanceCount = 100; // 20% increase
      const mockPrevMonthCalibrationCount = 80; // 25% decrease
      const mockPrevMonthPartsCount = 30; // 50% increase

      // Mock Prisma responses for request counts
      (mockPrisma.request.count as jest.Mock).mockImplementation((args) => {
        const month = args.where.createdOn.gte.getMonth();
        if (args.where.requestType === "MAINTENANCE") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        } else if (args.where.requestType === "CALIBRATION") {
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        }
        return Promise.resolve(0);
      });

      // Mock Prisma responses for parts history counts
      (mockPrisma.partsHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.replacementDate.gte.getMonth();
          return Promise.resolve(
            month === 2 ? mockCurrentMonthPartsCount : mockPrevMonthPartsCount,
          );
        },
      );

      // Execute
      const result = await reportRepository.getCountReport();

      // Assert - Normal percentage calculations
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: 20, // (120-100)/100 * 100 = 20%
        calibrationPercentageChange: -25, // (60-80)/80 * 100 = -25%
        sparePartsPercentageChange: 50, // (45-30)/30 * 100 = 50%
      });
    });
  });
});
