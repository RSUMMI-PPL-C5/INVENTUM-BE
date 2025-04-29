import { PrismaClient } from "@prisma/client";
import { CalibrationHistoryDTO } from "../dto/calibration-history.dto";
import { CalibrationHistoryFilterOptions } from "../interfaces/calibration-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";

class CalibrationHistoryRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async createCalibrationHistory(
    calibrationData: any,
  ): Promise<CalibrationHistoryDTO> {
    const currentTime = getJakartaTime();

    const newCalibrationHistory = await this.prisma.calibrationHistory.create({
      data: {
        id: calibrationData.id,
        actionPerformed: calibrationData.actionPerformed,
        technician: calibrationData.technician,
        result: calibrationData.result,
        calibrationDate: calibrationData.calibrationDate,
        calibrationMethod: calibrationData.calibrationMethod,
        nextCalibrationDue: calibrationData.nextCalibrationDue ?? null,
        createdBy: calibrationData.createdBy,
        createdOn: currentTime,

        medicalEquipment: {
          connect: {
            id: calibrationData.medicalEquipmentId,
          },
        },
      },
    });

    return newCalibrationHistory;
  }

  private buildWhereClause(
    search?: string,
    filters?: CalibrationHistoryFilterOptions,
  ): any {
    const whereCondition: any = {};

    // Add search for technician and calibration method
    if (search) {
      whereCondition.OR = [
        { technician: { contains: search } },
        { calibrationMethod: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.medicalEquipmentId) {
        whereCondition.medicalEquipmentId = filters.medicalEquipmentId;
      }

      if (filters.result) {
        whereCondition.result = filters.result;
      }

      if (filters.calibrationMethod) {
        whereCondition.calibrationMethod = {
          contains: filters.calibrationMethod,
        };
      }

      this.addCalibrationDateFilter(whereCondition, filters);
      this.addNextCalibrationDueFilter(whereCondition, filters);
      this.addCreatedOnDateFilter(whereCondition, filters);
    }

    return whereCondition;
  }

  private addCalibrationDateFilter(
    whereCondition: any,
    filters: CalibrationHistoryFilterOptions,
  ): void {
    if (filters.calibrationDateStart || filters.calibrationDateEnd) {
      whereCondition.calibrationDate = {};

      if (filters.calibrationDateStart) {
        whereCondition.calibrationDate.gte = filters.calibrationDateStart;
      }

      if (filters.calibrationDateEnd) {
        whereCondition.calibrationDate.lte = filters.calibrationDateEnd;
      }
    }
  }

  private addNextCalibrationDueFilter(
    whereCondition: any,
    filters: CalibrationHistoryFilterOptions,
  ): void {
    if (filters.nextCalibrationDueBefore) {
      whereCondition.nextCalibrationDue = {
        lte: filters.nextCalibrationDueBefore,
        not: null,
      };
    }
  }

  private addCreatedOnDateFilter(
    whereCondition: any,
    filters: CalibrationHistoryFilterOptions,
  ): void {
    if (filters.createdOnStart || filters.createdOnEnd) {
      whereCondition.createdOn = {};

      if (filters.createdOnStart) {
        whereCondition.createdOn.gte = filters.createdOnStart;
      }

      if (filters.createdOnEnd) {
        whereCondition.createdOn.lte = filters.createdOnEnd;
      }
    }
  }

  public async getCalibrationHistories(
    search?: string,
    filters?: CalibrationHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ calibrationHistories: any[]; total: number }> {
    const whereCondition = this.buildWhereClause(search, filters);

    const skipRecords = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const takeRecords = pagination ? pagination.limit : undefined;

    const [calibrationHistories, total] = await Promise.all([
      this.prisma.calibrationHistory.findMany({
        where: whereCondition,
        skip: skipRecords,
        take: takeRecords,
        orderBy: {
          calibrationDate: "desc",
        },
      }),
      this.prisma.calibrationHistory.count({ where: whereCondition }),
    ]);

    return { calibrationHistories, total };
  }
}

export default CalibrationHistoryRepository;
