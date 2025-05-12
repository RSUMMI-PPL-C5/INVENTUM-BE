import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import {
  MonthlyDataRecord,
  MonthlyTypeCount,
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
}

export default ReportRepository;
