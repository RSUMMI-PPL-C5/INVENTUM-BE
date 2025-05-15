import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import {
  MonthlyDataRecord,
  MonthlyTypeCount,
  PaginationMeta,
  PlanReportFilterOptions,
  ResultReportFilterOptions,
  SummaryReportFilterOptions,
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
        createdOn: true, // Changed from createdAt to createdOn per schema
        requestType: true,
      },
      where: {
        createdOn: {
          // Changed from createdAt to createdOn per schema
          not: null,
        },
      },
    });

    const monthlyData: Record<string, MonthlyTypeCount> = {};

    requests.forEach((request) => {
      if (!request.createdOn) return; // Changed from createdAt to createdOn

      const date = new Date(request.createdOn); // Changed from createdAt to createdOn
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

  // Get maintenance and calibration plans
  public async getPlanReports(
    filters?: PlanReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const where: any = {};

    // Apply filters
    if (filters) {
      // Search by equipment name - medicalEquipment is a string (ID) in Request model
      if (filters.search) {
        // Remove the mode: 'insensitive' option that's causing errors
        where.OR = [
          {
            medicalEquipment: {
              contains: filters.search,
              // Removed mode: 'insensitive'
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
        where.createdOn = {}; // Use createdOn instead of scheduledDate
        if (filters.startDate) {
          where.createdOn.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdOn.lte = new Date(filters.endDate);
        }
      }
    }

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

  // Get maintenance, calibration, and parts replacement results
  public async getResultReports(
    filters?: ResultReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    // Define interfaces that match the exact Prisma schema structure
    interface MaintenanceResultFromDB {
      id: string;
      medicalEquipmentId: string;
      actionPerformed: string;
      technician: string;
      result: string;
      maintenanceDate: Date;
      createdBy: string;
      createdOn: Date;
      medicalEquipment?: any;
    }

    interface CalibrationResultFromDB {
      id: string;
      medicalEquipmentId: string;
      actionPerformed: string;
      technician: string;
      result: string;
      calibrationDate: Date;
      calibrationMethod: string;
      nextCalibrationDue: Date | null; // Changed from Date | undefined to Date | null
      createdBy: string;
      createdOn: Date;
      medicalEquipment?: any;
    }

    interface PartsResultFromDB {
      id: string;
      medicalEquipmentId: string;
      sparepartId: string; // Note lowercase 'part' in schema
      actionPerformed: string;
      technician: string;
      result: string;
      replacementDate: Date;
      createdBy: string;
      createdOn: Date;
      equipment?: any;
      sparepart?: any; // Note lowercase 'part' in schema
    }

    // Final normalized interfaces for our internal use
    interface NormalizedResult {
      id: string;
      date: Date;
      result: string;
      medicalEquipmentId: string;
      actionPerformed?: string;
      technician?: string;
      createdBy: string;
      createdOn: Date;
      type: "MAINTENANCE" | "CALIBRATION" | "PARTS";
      // References to related entities
      medicalEquipment?: any;
      sparepart?: any; // Note lowercase 'part'
      // Type-specific fields
      maintenanceDate?: Date;
      calibrationDate?: Date;
      calibrationMethod?: string;
      nextCalibrationDue?: Date | null; // Changed to allow null
      replacementDate?: Date;
      sparepartId?: string; // Note lowercase 'part'
    }

    let maintenanceResults: MaintenanceResultFromDB[] = [];
    let calibrationResults: CalibrationResultFromDB[] = [];
    let partsResults: PartsResultFromDB[] = [];
    let total = 0;

    // Build query conditions
    const maintenanceWhereClause: any = {};
    const calibrationWhereClause: any = {};
    const partsWhereClause: any = {};

    // Apply common filters
    if (filters) {
      // Search by equipment name - remove mode: 'insensitive'
      if (filters.search) {
        maintenanceWhereClause.medicalEquipment = {
          name: {
            contains: filters.search,
            // Removed mode: 'insensitive'
          },
        };
        calibrationWhereClause.medicalEquipment = {
          name: {
            contains: filters.search,
            // Removed mode: 'insensitive'
          },
        };
        partsWhereClause.equipment = {
          // Note it's "equipment" not "medicalEquipment" in PartsHistory
          name: {
            contains: filters.search,
            // Removed mode: 'insensitive'
          },
        };
      }

      // Filter by result status
      if (filters.result && filters.result !== "all") {
        if (filters.result === "success") {
          maintenanceWhereClause.result = "SUCCESS";
          calibrationWhereClause.result = "SUCCESS";
          partsWhereClause.result = "SUCCESS";
        } else if (filters.result === "success-with-notes") {
          maintenanceWhereClause.result = "SUCCESS_WITH_NOTES";
          calibrationWhereClause.result = "SUCCESS_WITH_NOTES";
          partsWhereClause.result = "SUCCESS_WITH_NOTES";
        } else if (filters.result === "failed-with-notes") {
          maintenanceWhereClause.result = "FAILED_WITH_NOTES";
          calibrationWhereClause.result = "FAILED_WITH_NOTES";
          partsWhereClause.result = "FAILED_WITH_NOTES";
        }
      }

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        maintenanceWhereClause.maintenanceDate = {};
        calibrationWhereClause.calibrationDate = {};
        partsWhereClause.replacementDate = {};

        if (filters.startDate) {
          maintenanceWhereClause.maintenanceDate.gte = new Date(
            filters.startDate,
          );
          calibrationWhereClause.calibrationDate.gte = new Date(
            filters.startDate,
          );
          partsWhereClause.replacementDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          maintenanceWhereClause.maintenanceDate.lte = new Date(
            filters.endDate,
          );
          calibrationWhereClause.calibrationDate.lte = new Date(
            filters.endDate,
          );
          partsWhereClause.replacementDate.lte = new Date(filters.endDate);
        }
      }
    }

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
          include: {
            medicalEquipment: true,
          },
        }),
        this.prisma.maintenanceHistory.count({
          where: maintenanceWhereClause,
        }), // Fixed count query
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
          include: {
            medicalEquipment: true,
          },
        }),
        this.prisma.calibrationHistory.count({
          where: calibrationWhereClause,
        }), // Fixed count query
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
            equipment: true, // Note it's "equipment" not "medicalEquipment"
            sparepart: true, // Note lowercase 'part'
          },
        }),
        this.prisma.partsHistory.count({
          where: partsWhereClause,
        }), // Fixed count query
      ]);

      partsResults = parts;
      total += partsCount;
    }

    // Normalize the results to a common format
    const formattedMaintenanceResults: NormalizedResult[] =
      maintenanceResults.map((item) => ({
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

    const formattedCalibrationResults: NormalizedResult[] =
      calibrationResults.map((item) => ({
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

    const formattedPartsResults: NormalizedResult[] = partsResults.map(
      (item) => ({
        id: item.id,
        date: item.replacementDate,
        result: item.result,
        medicalEquipmentId: item.medicalEquipmentId,
        actionPerformed: item.actionPerformed,
        technician: item.technician,
        createdBy: item.createdBy,
        createdOn: item.createdOn,
        medicalEquipment: item.equipment, // Note it's "equipment" in parts history
        sparepart: item.sparepart, // Note lowercase 'part'
        replacementDate: item.replacementDate,
        sparepartId: item.sparepartId, // Note lowercase 'part'
        type: "PARTS",
      }),
    );

    // Combine and sort results
    const allResults = [
      ...formattedMaintenanceResults,
      ...formattedCalibrationResults,
      ...formattedPartsResults,
    ];

    // Sort combined results by date (most recent first)
    const sortedResults = allResults.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Apply pagination to combined results if needed
    const results = pagination
      ? sortedResults.slice(0, pagination.limit)
      : sortedResults;

    return { results, total };
  }

  // Get comments/responses summary
  public async getSummaryReports(
    filters?: SummaryReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const where: any = {};

    // Apply filters
    if (filters) {
      // Search by equipment name - modify this to use a supported query syntax
      if (filters.search) {
        where.request = {
          medicalEquipment: {
            // Use contains without mode option since it's not supported in nested queries
            contains: filters.search,
          },
        };
      }

      // Filter by request type
      if (filters.type && filters.type !== "all") {
        // Create request filter if it doesn't exist yet
        where.request = where.request || {};

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
    }

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
}

export default ReportRepository;
