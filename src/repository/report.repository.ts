import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import {
  MonthlyDataRecord,
  MonthlyTypeCount,
  RequestStatusReport,
  RequestStatusCount,
} from "../interfaces/report.interface";

class ReportRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // Get all requests with their creation date and type
  public async getMonthlyRequestCounts(): Promise<MonthlyDataRecord[]> {
    const requests = await this.prisma.request.findMany({
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

    const monthlyData: Record<string, MonthlyTypeCount> = {};

    requests.forEach((request) => {
      if (!request.createdOn) return;

      const date = new Date(request.createdOn);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      monthlyData[yearMonth] ??= {
        MAINTENANCE: 0,
        CALIBRATION: 0,
      };

      if (
        request.requestType === "MAINTENANCE" ||
        request.requestType === "CALIBRATION"
      ) {
        monthlyData[yearMonth][request.requestType]++;
      }
    });

    return Object.entries(monthlyData).map(([month, counts]) => ({
      month,
      ...counts,
    }));
  }

  public async getRequestStatusReport(): Promise<RequestStatusReport> {
    try {
      // Get all requests with their status and type
      const requests =
        (await this.prisma.request.findMany({
          select: {
            status: true,
            requestType: true,
          },
        })) || [];

      // Status categories
      const successStatus = "Success";
      const partialStatus = "Partial";
      const failedStatus = "Failed";

      // Initialize counters for each request type and status
      const maintenanceStatusCounts: Record<string, number> = {
        [successStatus]: 0,
        [partialStatus]: 0,
        [failedStatus]: 0,
      };

      const calibrationStatusCounts: Record<string, number> = {
        [successStatus]: 0,
        [partialStatus]: 0,
        [failedStatus]: 0,
      };

      let maintenanceTotal = 0;
      let calibrationTotal = 0;

      // Process each request
      for (const request of requests) {
        // Normalize the status
        let normalizedStatus = request.status;

        // If it's not one of our three categories, default to "Partial"
        if (
          ![successStatus, partialStatus, failedStatus].includes(
            normalizedStatus,
          )
        ) {
          normalizedStatus = partialStatus;
        }

        if (request.requestType === "MAINTENANCE") {
          maintenanceStatusCounts[normalizedStatus] =
            (maintenanceStatusCounts[normalizedStatus] || 0) + 1;
          maintenanceTotal++;
        } else if (request.requestType === "CALIBRATION") {
          calibrationStatusCounts[normalizedStatus] =
            (calibrationStatusCounts[normalizedStatus] || 0) + 1;
          calibrationTotal++;
        }
      }

      // Format data for MAINTENANCE
      const maintenanceStatuses: RequestStatusCount[] = Object.entries(
        maintenanceStatusCounts,
      ).map(([status, count]) => ({
        status,
        count,
        percentage:
          maintenanceTotal > 0
            ? Math.round((count / maintenanceTotal) * 100 * 100) / 100
            : 0,
      }));

      // Format data for CALIBRATION
      const calibrationStatuses: RequestStatusCount[] = Object.entries(
        calibrationStatusCounts,
      ).map(([status, count]) => ({
        status,
        count,
        percentage:
          calibrationTotal > 0
            ? Math.round((count / calibrationTotal) * 100 * 100) / 100
            : 0,
      }));

      // Calculate total values
      const totalSuccess =
        maintenanceStatusCounts[successStatus] +
        calibrationStatusCounts[successStatus];
      const totalPartial =
        maintenanceStatusCounts[partialStatus] +
        calibrationStatusCounts[partialStatus];
      const totalFailed =
        maintenanceStatusCounts[failedStatus] +
        calibrationStatusCounts[failedStatus];
      const totalCount = maintenanceTotal + calibrationTotal;

      return {
        MAINTENANCE: maintenanceStatuses,
        CALIBRATION: calibrationStatuses,
        total: {
          success: totalSuccess,
          warning: totalPartial, // Mapping Partial to warning in the total
          failed: totalFailed,
          total: totalCount,
        },
      };
    } catch (error) {
      console.error("Error in getRequestStatusReport:", error);
      throw error;
    }
  }

  public async getAllData(startDate: Date, endDate: Date) {
    try {
      const [
        users,
        divisions,
        equipment,
        spareparts,
        partsHistory,
        requests,
        maintenanceHistory,
        calibrationHistory,
        notifications,
        comments,
      ] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.listDivisi.findMany(),

        this.prisma.medicalEquipment.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.spareparts.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.partsHistory.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.request.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.maintenanceHistory.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.calibrationHistory.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.notifikasi.findMany({
          where: {
            createdOn: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),

        this.prisma.comment.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      return {
        users,
        divisions,
        equipment,
        spareparts,
        partsHistory,
        requests,
        maintenanceHistory,
        calibrationHistory,
        notifications,
        comments,
      };
    } catch (error) {
      console.error("Error in getAllData:", error);
      throw error;
    }
  }
}

export default ReportRepository;
