import { PrismaClient } from "@prisma/client";
import { CalibrationHistoryDTO } from "../dto/calibration-history.dto";
import { CalibrationHistoryFilterOptions } from "../interfaces/calibration-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";
import CalibrationHistoryWhereBuilder from "../utils/builders/calibration-history-where.builder";

class CalibrationHistoryRepository {
  private readonly prisma: PrismaClient;
  private readonly whereBuilder: CalibrationHistoryWhereBuilder;

  constructor() {
    this.prisma = prisma;
    this.whereBuilder = new CalibrationHistoryWhereBuilder();
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

  public async getCalibrationHistories(
    search?: string,
    filters?: CalibrationHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ calibrationHistories: any[]; total: number }> {
    const whereCondition = this.whereBuilder.buildComplete(search, filters);

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
