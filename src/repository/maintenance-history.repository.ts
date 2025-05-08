import { PrismaClient } from "@prisma/client";
import { MaintenanceHistoryDTO } from "../dto/maintenance-history.dto";
import { MaintenanceHistoryFilterOptions } from "../interfaces/maintenance-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";
import MaintenanceHistoryWhereBuilder from "../utils/builders/maintenance-history-where.builder";

class MaintenanceHistoryRepository {
  private readonly prisma: PrismaClient;
  private readonly whereBuilder: MaintenanceHistoryWhereBuilder;

  constructor() {
    this.prisma = prisma;
    this.whereBuilder = new MaintenanceHistoryWhereBuilder();
  }

  public async createMaintenanceHistory(
    maintenanceData: any,
  ): Promise<MaintenanceHistoryDTO> {
    const jakartaTime = getJakartaTime();

    const newMaintenanceHistory = await this.prisma.maintenanceHistory.create({
      data: {
        id: maintenanceData.id,
        actionPerformed: maintenanceData.actionPerformed,
        technician: maintenanceData.technician,
        result: maintenanceData.result,
        maintenanceDate: maintenanceData.maintenanceDate,
        createdBy: maintenanceData.createdBy,
        createdOn: jakartaTime,

        medicalEquipment: {
          connect: {
            id: maintenanceData.medicalEquipmentId,
          },
        },
      },
    });

    return newMaintenanceHistory;
  }

  public async getMaintenanceHistories(
    search?: string,
    filters?: MaintenanceHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ maintenanceHistories: any[]; total: number }> {
    const where = this.whereBuilder.buildComplete(search, filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [maintenanceHistories, total] = await Promise.all([
      this.prisma.maintenanceHistory.findMany({
        where,
        skip,
        take,
        orderBy: {
          maintenanceDate: "desc",
        },
      }),
      this.prisma.maintenanceHistory.count({ where }),
    ]);

    return { maintenanceHistories, total };
  }
}

export default MaintenanceHistoryRepository;
