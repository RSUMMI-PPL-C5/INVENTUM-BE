import { PrismaClient } from "@prisma/client";
import ReportRepository from "../../../src/repository/report.repository";
import { getJakartaTime } from "../../../src/utils/date.utils";

jest.mock("@prisma/client");
jest.mock("../../../src/utils/date.utils");

describe("ReportRepository", () => {
  let reportRepository: ReportRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    reportRepository = new ReportRepository();
    (getJakartaTime as jest.Mock).mockReturnValue(new Date("2024-03-20"));
  });

  describe("getCountReport", () => {
    it("should return correct counts for maintenance, calibration and spare parts for current month", async () => {
      // Mock data
      const mockMaintenanceCount = 124;
      const mockCalibrationCount = 87;
      const mockSparePartsCount = 36;

      // Mock Prisma responses
      mockPrisma.request.count = jest.fn().mockImplementation((args) => {
        if (args.where.requestType === "MAINTENANCE") {
          return Promise.resolve(mockMaintenanceCount);
        } else if (args.where.requestType === "CALIBRATION") {
          return Promise.resolve(mockCalibrationCount);
        } else if (args.where.requestType === "PARTS") {
          return Promise.resolve(mockSparePartsCount);
        }
        return Promise.resolve(0);
      });

      // Get current date
      const now = new Date("2024-03-20");
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Expected query
      const expectedWhere = {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      };

      // Execute
      const result = await reportRepository.getCountReport();

      // Assert
      expect(mockPrisma.request.count).toHaveBeenCalledWith({
        where: {
          ...expectedWhere,
          requestType: "MAINTENANCE",
        },
      });
      expect(mockPrisma.request.count).toHaveBeenCalledWith({
        where: {
          ...expectedWhere,
          requestType: "CALIBRATION",
        },
      });
      expect(mockPrisma.request.count).toHaveBeenCalledWith({
        where: {
          ...expectedWhere,
          requestType: "PARTS",
        },
      });

      expect(result).toEqual({
        maintenanceCount: mockMaintenanceCount,
        calibrationCount: mockCalibrationCount,
        sparePartsCount: mockSparePartsCount,
      });
    });

    it("should handle errors gracefully", async () => {
      // Mock Prisma error
      mockPrisma.request.count = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      // Execute and assert
      await expect(reportRepository.getCountReport()).rejects.toThrow(
        "Database error",
      );
    });

    it("should return zero counts when no data exists", async () => {
      // Mock Prisma responses with zero counts
      mockPrisma.request.count = jest.fn().mockResolvedValue(0);

      // Execute
      const result = await reportRepository.getCountReport();

      // Assert
      expect(result).toEqual({
        maintenanceCount: 0,
        calibrationCount: 0,
        sparePartsCount: 0,
      });
    });
  });
});
