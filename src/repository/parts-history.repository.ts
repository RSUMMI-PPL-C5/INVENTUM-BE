import { PrismaClient } from "@prisma/client";
import { PartsHistoryDTO } from "../dto/parts-history.dto";
import { PartsHistoryFilterOptions } from "../interfaces/parts-history.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";
import PartsHistoryWhereBuilder from "../utils/builders/parts-history-where.builder";

class PartsHistoryRepository {
  private readonly prisma: PrismaClient;
  private readonly whereBuilder: PartsHistoryWhereBuilder;

  constructor() {
    this.prisma = prisma;
    this.whereBuilder = new PartsHistoryWhereBuilder();
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

  public async getPartsHistories(
    search?: string,
    filters?: PartsHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ partsHistories: any[]; total: number }> {
    const where = this.whereBuilder.buildComplete(search, filters);

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
