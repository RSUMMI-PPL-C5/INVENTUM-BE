import { PrismaClient } from "@prisma/client";
import { MaintenanceHistoryDTO } from "../dto/maintenance-history.dto";
import { MaintenanceHistoryFilterOptions } from "../interfaces/maintenance-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";

class MaintenanceHistoryRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
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

  private buildWhereClause(
    search?: string,
    filters?: MaintenanceHistoryFilterOptions,
  ): any {
    const where: any = {};

    if (search) {
      where.OR = [{ technician: { contains: search } }];
    }

    if (filters) {
      if (filters.medicalEquipmentId) {
        where.medicalEquipmentId = filters.medicalEquipmentId;
      }

      if (filters.result) {
        where.result = filters.result;
      }

      this.addMaintenanceDateFilter(where, filters);
      this.addCreatedOnDateFilter(where, filters);
    }

    return where;
  }

  private addMaintenanceDateFilter(
    where: any,
    filters: MaintenanceHistoryFilterOptions,
  ): void {
    if (filters.maintenanceDateStart || filters.maintenanceDateEnd) {
      where.maintenanceDate = {};

      if (filters.maintenanceDateStart) {
        where.maintenanceDate.gte = filters.maintenanceDateStart;
      }

      if (filters.maintenanceDateEnd) {
        where.maintenanceDate.lte = filters.maintenanceDateEnd;
      }
    }
  }

  // Add new method for createdOn filtering
  private addCreatedOnDateFilter(
    where: any,
    filters: MaintenanceHistoryFilterOptions,
  ): void {
    if (filters.createdOnStart || filters.createdOnEnd) {
      where.createdOn = {};

      if (filters.createdOnStart) {
        where.createdOn.gte = filters.createdOnStart;
      }

      if (filters.createdOnEnd) {
        where.createdOn.lte = filters.createdOnEnd;
      }
    }
  }

  public async getMaintenanceHistories(
    search?: string,
    filters?: MaintenanceHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ maintenanceHistories: any[]; total: number }> {
    const where = this.buildWhereClause(search, filters);

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
