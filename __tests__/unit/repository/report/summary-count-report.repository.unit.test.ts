import { PrismaClient } from "@prisma/client";
import ReportRepository from "../../../../src/repository/report.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock the entire PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    maintenanceHistory: {
      count: jest.fn(),
    },
    calibrationHistory: {
      count: jest.fn(),
    },
    partsHistory: {
      count: jest.fn(),
    },
  })),
}));

// Mock the date utility
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

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

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

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
      expect(mockPrisma.maintenanceHistory.count).toHaveBeenCalledTimes(2); // current and previous month
      expect(mockPrisma.calibrationHistory.count).toHaveBeenCalledTimes(2); // current and previous month
      expect(mockPrisma.partsHistory.count).toHaveBeenCalledTimes(2); // current and previous month

      // Verify that result filter is applied correctly
      expect(mockPrisma.maintenanceHistory.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            result: "SUCCESS",
          }),
        }),
      );
      expect(mockPrisma.calibrationHistory.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            result: "SUCCESS",
          }),
        }),
      );
      expect(mockPrisma.partsHistory.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            result: "SUCCESS",
          }),
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      // Mock Prisma error
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      // Execute and assert
      await expect(reportRepository.getCountReport()).rejects.toThrow(
        "Database error",
      );
    });

    it("should return zero counts and percentage changes when no data exists", async () => {
      // Mock Prisma responses with zero counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.calibrationHistory.count as jest.Mock).mockResolvedValue(0);
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
      // Mock data
      const mockCurrentMonthMaintenanceCount = 10;
      const mockCurrentMonthCalibrationCount = 5;
      const mockCurrentMonthPartsCount = 8;
      const mockPrevMonthMaintenanceCount = 0;
      const mockPrevMonthCalibrationCount = 0;
      const mockPrevMonthPartsCount = 0;

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

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

      // Assert
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: 999,
        calibrationPercentageChange: 999,
        sparePartsPercentageChange: 999,
      });
    });

    it("should cap percentage at 999% for extreme increases", async () => {
      // Mock data - extreme increase scenario
      const mockCurrentMonthMaintenanceCount = 1000;
      const mockCurrentMonthCalibrationCount = 500;
      const mockCurrentMonthPartsCount = 2000;
      const mockPrevMonthMaintenanceCount = 1; // Would be 99,900% increase
      const mockPrevMonthCalibrationCount = 1; // Would be 49,900% increase
      const mockPrevMonthPartsCount = 1; // Would be 199,900% increase

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

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

      // Assert
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: 999,
        calibrationPercentageChange: 999,
        sparePartsPercentageChange: 999,
      });
    });

    it("should cap percentage decrease at -100%", async () => {
      // Mock data - extreme decrease scenario
      const mockCurrentMonthMaintenanceCount = 0;
      const mockCurrentMonthCalibrationCount = 0;
      const mockCurrentMonthPartsCount = 0;
      const mockPrevMonthMaintenanceCount = 1000; // Would be -100% decrease
      const mockPrevMonthCalibrationCount = 1000; // Would be -100% decrease
      const mockPrevMonthPartsCount = 1000; // Would be -100% decrease

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

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

      // Assert
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: -100,
        calibrationPercentageChange: -100,
        sparePartsPercentageChange: -100,
      });
    });

    it("should cap percentage decrease at -100% for partial decreases", async () => {
      // Mock data - partial decrease scenario
      const mockCurrentMonthMaintenanceCount = 50;
      const mockCurrentMonthCalibrationCount = 25;
      const mockCurrentMonthPartsCount = 75;
      const mockPrevMonthMaintenanceCount = 100; // Would be -50% decrease
      const mockPrevMonthCalibrationCount = 100; // Would be -75% decrease
      const mockPrevMonthPartsCount = 100; // Would be -25% decrease

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

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

      // Assert
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: -50,
        calibrationPercentageChange: -75,
        sparePartsPercentageChange: -25,
      });
    });

    it("should cap percentage at -999% when decrease is more than 999%", async () => {
      // Mock data - decrease more than 999%
      const mockCurrentMonthMaintenanceCount = 1;
      const mockCurrentMonthCalibrationCount = 1;
      const mockCurrentMonthPartsCount = 1;
      const mockPrevMonthMaintenanceCount = 1000000;
      const mockPrevMonthCalibrationCount = 1000000;
      const mockPrevMonthPartsCount = 1000000;

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

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

      // Assert
      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: -100,
        calibrationPercentageChange: -100,
        sparePartsPercentageChange: -100,
      });
    });

    it("should respect custom maxPercentage value", async () => {
      // Mock data - extreme increase scenario
      const mockCurrentMonthMaintenanceCount = 1000;
      const mockCurrentMonthCalibrationCount = 1000;
      const mockCurrentMonthPartsCount = 1000;
      const mockPrevMonthMaintenanceCount = 1; // Would be 99,900% increase
      const mockPrevMonthCalibrationCount = 1; // Would be 99,900% increase
      const mockPrevMonthPartsCount = 1; // Would be 99,900% increase

      // Mock Prisma responses for maintenance history counts
      (mockPrisma.maintenanceHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthMaintenanceCount
              : mockPrevMonthMaintenanceCount,
          );
        },
      );

      // Mock Prisma responses for calibration history counts
      (mockPrisma.calibrationHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.createdOn.gte.getMonth();
          return Promise.resolve(
            month === 2
              ? mockCurrentMonthCalibrationCount
              : mockPrevMonthCalibrationCount,
          );
        },
      );

      // Mock Prisma responses for parts history counts
      (mockPrisma.partsHistory.count as jest.Mock).mockImplementation(
        (args) => {
          const month = args.where.replacementDate.gte.getMonth();
          return Promise.resolve(
            month === 2 ? mockCurrentMonthPartsCount : mockPrevMonthPartsCount,
          );
        },
      );

      // Execute with custom maxPercentage
      const result = await reportRepository.getCountReport(500);

      expect(result).toEqual({
        maintenanceCount: mockCurrentMonthMaintenanceCount,
        calibrationCount: mockCurrentMonthCalibrationCount,
        sparePartsCount: mockCurrentMonthPartsCount,
        maintenancePercentageChange: 999,
        calibrationPercentageChange: 999,
        sparePartsPercentageChange: 999,
      });
    });
  });
});
