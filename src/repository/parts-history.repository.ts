import { PrismaClient } from "@prisma/client";
import { PartsHistoryDTO } from "../dto/parts-history.dto";
import { PartsHistoryFilterOptions } from "../interfaces/parts-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";

class PartsHistoryRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async createPartsHistory(partsData: any): Promise<PartsHistoryDTO> {
    const jakartaTime = getJakartaTime();

    const newPartsHistory = await this.prisma.partsHistory.create({
      data: {
        id: partsData.id,
        actionPerformed: partsData.actionPerformed,
        technician: partsData.technician,
        result: partsData.result,
        replacementDate: partsData.replacementDate,
        createdBy: partsData.createdBy,
        createdOn: jakartaTime,
        equipment: {
          connect: {
            id: partsData.medicalEquipmentId,
          },
        },
        sparepart: {
          connect: {
            id: partsData.sparepartId,
          },
        },
      },
    });

    return newPartsHistory;
  }

  private buildWhereClause(
    search?: string,
    filters?: PartsHistoryFilterOptions,
  ): any {
    const where: any = {};

    if (search) {
      where.OR = [
        { technician: { contains: search } },
        { sparepart: { partsName: { contains: search } } },
      ];
    }

    if (filters) {
      if (filters.medicalEquipmentId) {
        where.medicalEquipmentId = filters.medicalEquipmentId;
      }

      if (filters.sparepartId) {
        where.sparepartId = filters.sparepartId;
      }

      if (filters.result) {
        where.result = filters.result;
      }

      this.addReplacementDateFilter(where, filters);
      this.addCreatedOnDateFilter(where, filters);
    }

    return where;
  }

  private addReplacementDateFilter(
    where: any,
    filters: PartsHistoryFilterOptions,
  ): void {
    if (filters.replacementDateStart || filters.replacementDateEnd) {
      where.replacementDate = {};

      if (filters.replacementDateStart) {
        where.replacementDate.gte = filters.replacementDateStart;
      }

      if (filters.replacementDateEnd) {
        where.replacementDate.lte = filters.replacementDateEnd;
      }
    }
  }

  private addCreatedOnDateFilter(
    where: any,
    filters: PartsHistoryFilterOptions,
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

  public async getPartsHistories(
    search?: string,
    filters?: PartsHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ partsHistories: any[]; total: number }> {
    const where = this.buildWhereClause(search, filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [rawPartsHistories, total] = await Promise.all([
      this.prisma.partsHistory.findMany({
        where,
        skip,
        take,
        orderBy: {
          replacementDate: "desc",
        },
        include: {
          sparepart: {
            select: {
              partsName: true,
            },
          },
        },
      }),
      this.prisma.partsHistory.count({ where }),
    ]);

    const partsHistories = rawPartsHistories.map((history) => {
      const { sparepart, ...historyData } = history;

      return {
        ...historyData,
        partsName: sparepart.partsName,
      };
    });

    return { partsHistories, total };
  }
}

export default PartsHistoryRepository;
