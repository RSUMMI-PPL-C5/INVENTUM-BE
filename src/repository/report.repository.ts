import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import {
  MonthlyDataRecord,
  MonthlyTypeCount,
  PlanReportFilterOptions,
  ResultReportFilterOptions,
  SummaryReportFilterOptions,
  RequestStatusReport,
  RequestStatusCount,
} from "../interfaces/report.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";

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
  
  // Get maintenance and calibration plans
  public async getPlanReports(
    filters?: PlanReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const where = this.buildPlanReportWhereClause(filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [plans, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdOn: "desc", // Use createdOn instead of scheduledDate
        },
        include: {
          user: true, // Include full user to get name
        },
      }),
      this.prisma.request.count({ where }),
    ]);

    return { plans, total };
  }

  private buildPlanReportWhereClause(filters?: PlanReportFilterOptions): any {
    const where: any = {};

    if (!filters) {
      return where;
    }

    // Search by equipment name
    if (filters.search) {
      where.OR = [
        {
          medicalEquipment: {
            contains: filters.search,
          },
        },
      ];
    }

    // Filter by request type
    if (filters.type && filters.type !== "all") {
      where.requestType = filters.type;
    }

    // Filter by status
    if (filters.status && filters.status !== "all") {
      if (filters.status === "scheduled") {
        where.status = "SCHEDULED";
      } else if (filters.status === "pending") {
        where.status = "PENDING";
      }
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      where.createdOn = {};
      if (filters.startDate) {
        where.createdOn.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdOn.lte = new Date(filters.endDate);
      }
    }

    return where;
  }

  // Get maintenance, calibration, and parts replacement results
  public async getResultReports(
    filters?: ResultReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { maintenanceResults, calibrationResults, partsResults, total } =
      await this.fetchResultsData(filters, pagination);

    const formattedMaintenanceResults =
      this.normalizeMaintenanceResults(maintenanceResults);
    const formattedCalibrationResults =
      this.normalizeCalibrationResults(calibrationResults);
    const formattedPartsResults = this.normalizePartsResults(partsResults);

    // Combine results
    const allResults = [
      ...formattedMaintenanceResults,
      ...formattedCalibrationResults,
      ...formattedPartsResults,
    ];

    // Sort and paginate combined results
    const sortedResults = this.sortResultsByDate(allResults);
    const results = pagination
      ? sortedResults.slice(0, pagination.limit)
      : sortedResults;

    return { results, total };
  }

  private sortResultsByDate(results: any[]): any[] {
    // Extract sort operation to a separate statement
    return [...results].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  private async fetchResultsData(
    filters?: ResultReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    let maintenanceResults: any[] = [];
    let calibrationResults: any[] = [];
    let partsResults: any[] = [];
    let total = 0;

    // Build query conditions
    const { maintenanceWhereClause, calibrationWhereClause, partsWhereClause } =
      this.buildResultsWhereClause(filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    // Fetch data based on type
    if (
      !filters?.type ||
      filters.type === "all" ||
      filters.type === "MAINTENANCE"
    ) {
      const [maintenance, maintenanceCount] = await Promise.all([
        this.prisma.maintenanceHistory.findMany({
          where: maintenanceWhereClause,
          ...(pagination ? { skip, take } : {}),
          orderBy: { maintenanceDate: "desc" },
          include: { medicalEquipment: true },
        }),
        this.prisma.maintenanceHistory.count({ where: maintenanceWhereClause }),
      ]);

      maintenanceResults = maintenance;
      total += maintenanceCount;
    }

    if (
      !filters?.type ||
      filters.type === "all" ||
      filters.type === "CALIBRATION"
    ) {
      const [calibration, calibrationCount] = await Promise.all([
        this.prisma.calibrationHistory.findMany({
          where: calibrationWhereClause,
          ...(pagination ? { skip, take } : {}),
          orderBy: { calibrationDate: "desc" },
          include: { medicalEquipment: true },
        }),
        this.prisma.calibrationHistory.count({ where: calibrationWhereClause }),
      ]);

      calibrationResults = calibration;
      total += calibrationCount;
    }

    if (!filters?.type || filters.type === "all" || filters.type === "PARTS") {
      const [parts, partsCount] = await Promise.all([
        this.prisma.partsHistory.findMany({
          where: partsWhereClause,
          ...(pagination ? { skip, take } : {}),
          orderBy: { replacementDate: "desc" },
          include: {
            equipment: true,
            sparepart: true,
          },
        }),
        this.prisma.partsHistory.count({ where: partsWhereClause }),
      ]);

      partsResults = parts;
      total += partsCount;
    }

    return { maintenanceResults, calibrationResults, partsResults, total };
  }

  private buildResultsWhereClause(filters?: ResultReportFilterOptions) {
    const maintenanceWhereClause: any = {};
    const calibrationWhereClause: any = {};
    const partsWhereClause: any = {};

    if (!filters) {
      return {
        maintenanceWhereClause,
        calibrationWhereClause,
        partsWhereClause,
      };
    }

    // Apply search filter
    if (filters.search) {
      maintenanceWhereClause.medicalEquipment = {
        name: { contains: filters.search },
      };
      calibrationWhereClause.medicalEquipment = {
        name: { contains: filters.search },
      };
      partsWhereClause.equipment = {
        name: { contains: filters.search },
      };
    }

    // Apply result status filter
    if (filters.result && filters.result !== "all") {
      const resultStatus = this.mapResultStatus(filters.result);
      maintenanceWhereClause.result = resultStatus;
      calibrationWhereClause.result = resultStatus;
      partsWhereClause.result = resultStatus;
    }

    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      this.applyDateRangeFilter(
        filters,
        maintenanceWhereClause,
        calibrationWhereClause,
        partsWhereClause,
      );
    }

    return { maintenanceWhereClause, calibrationWhereClause, partsWhereClause };
  }

  private mapResultStatus(result: string): string {
    switch (result) {
      case "success":
        return "SUCCESS";
      case "success-with-notes":
        return "SUCCESS_WITH_NOTES";
      case "failed-with-notes":
        return "FAILED_WITH_NOTES";
      default:
        return "";
    }
  }

  private applyDateRangeFilter(
    filters: ResultReportFilterOptions,
    maintenanceWhereClause: any,
    calibrationWhereClause: any,
    partsWhereClause: any,
  ) {
    maintenanceWhereClause.maintenanceDate = {};
    calibrationWhereClause.calibrationDate = {};
    partsWhereClause.replacementDate = {};

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      maintenanceWhereClause.maintenanceDate.gte = startDate;
      calibrationWhereClause.calibrationDate.gte = startDate;
      partsWhereClause.replacementDate.gte = startDate;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      maintenanceWhereClause.maintenanceDate.lte = endDate;
      calibrationWhereClause.calibrationDate.lte = endDate;
      partsWhereClause.replacementDate.lte = endDate;
    }
  }

  private normalizeMaintenanceResults(maintenanceResults: any[]): any[] {
    return maintenanceResults.map((item) => ({
      id: item.id,
      date: item.maintenanceDate,
      result: item.result,
      medicalEquipmentId: item.medicalEquipmentId,
      actionPerformed: item.actionPerformed,
      technician: item.technician,
      createdBy: item.createdBy,
      createdOn: item.createdOn,
      medicalEquipment: item.medicalEquipment,
      maintenanceDate: item.maintenanceDate,
      type: "MAINTENANCE",
    }));
  }

  private normalizeCalibrationResults(calibrationResults: any[]): any[] {
    return calibrationResults.map((item) => ({
      id: item.id,
      date: item.calibrationDate,
      result: item.result,
      medicalEquipmentId: item.medicalEquipmentId,
      actionPerformed: item.actionPerformed,
      technician: item.technician,
      createdBy: item.createdBy,
      createdOn: item.createdOn,
      medicalEquipment: item.medicalEquipment,
      calibrationDate: item.calibrationDate,
      calibrationMethod: item.calibrationMethod,
      nextCalibrationDue: item.nextCalibrationDue,
      type: "CALIBRATION",
    }));
  }

  private normalizePartsResults(partsResults: any[]): any[] {
    return partsResults.map((item) => ({
      id: item.id,
      date: item.replacementDate,
      result: item.result,
      medicalEquipmentId: item.medicalEquipmentId,
      actionPerformed: item.actionPerformed,
      technician: item.technician,
      createdBy: item.createdBy,
      createdOn: item.createdOn,
      medicalEquipment: item.equipment,
      sparepart: item.sparepart,
      replacementDate: item.replacementDate,
      sparepartId: item.sparepartId,
      type: "PARTS",
    }));
  }

  // Get comments/responses summary
  public async getSummaryReports(
    filters?: SummaryReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const where = this.buildSummaryReportWhereClause(filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          request: true,
          user: true,
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return { comments, total };
  }

  private buildSummaryReportWhereClause(
    filters?: SummaryReportFilterOptions,
  ): any {
    const where: any = {};

    if (!filters) {
      return where;
    }

    // Search by equipment name
    if (filters.search) {
      where.request = {
        medicalEquipment: {
          contains: filters.search,
        },
      };
    }

    // Filter by request type
    if (filters.type && filters.type !== "all") {
      // Create request filter if it doesn't exist yet
      where.request = where.request ?? {};
      // Add requestType filter
      where.request.requestType = filters.type;
    }

    // Filter by date range - comment uses createdAt per schema
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return where;
  }
}

export default ReportRepository;
