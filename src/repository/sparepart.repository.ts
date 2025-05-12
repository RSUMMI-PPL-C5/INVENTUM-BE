import { PrismaClient, Spareparts } from "@prisma/client";
import { SparepartDTO, SparepartsDTO } from "../dto/sparepart.dto";
import prisma from "../configs/db.config";
import { getJakartaTime } from "../utils/date.utils";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { SparepartFilterOptions } from "../interfaces/spareparts.filter.interface";
import SparepartWhereBuilder from "../utils/builders/sparepart-where.builder";

class SparepartRepository {
  private readonly prisma: PrismaClient;
  private readonly whereBuilder: SparepartWhereBuilder;

  constructor() {
    this.prisma = prisma;
    this.whereBuilder = new SparepartWhereBuilder();
  }

  public async createSparepart(sparepartData: any): Promise<SparepartsDTO> {
    const jakartaTime = getJakartaTime();
    const newSparepart = await this.prisma.spareparts.create({
      data: {
        ...sparepartData,
        createdOn: jakartaTime,
        modifiedOn: jakartaTime,
      },
    });

    return {
      ...newSparepart,
    };
  }

  public async getSpareparts(
    search?: string,
    filters?: SparepartFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ spareparts: SparepartDTO[]; total: number }> {
    const where = this.whereBuilder.buildComplete(search, filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [spareparts, total] = await Promise.all([
      this.prisma.spareparts.findMany({
        where,
        skip,
        take,
        orderBy: {
          modifiedOn: "desc",
        },
      }),
      this.prisma.spareparts.count({ where }),
    ]);

    return { spareparts, total };
  }

  public async getSparepartById(id: string): Promise<SparepartDTO | null> {
    return await this.prisma.spareparts.findFirst({
      where: {
        id,
        deletedOn: null,
      },
    });
  }

  public async getSparepartByName(nameQuery: string): Promise<Spareparts[]> {
    return await this.prisma.spareparts.findMany({
      where: {
        partsName: {
          contains: nameQuery,
        },
        deletedOn: null,
      },
    });
  }

  public async updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null> {
    const sparepart = await this.prisma.spareparts.findFirst({
      where: {
        id,
        deletedOn: null,
      },
    });

    if (!sparepart) return null;

    return await this.prisma.spareparts.update({
      where: { id },
      data: {
        ...data,
        modifiedOn: getJakartaTime(),
      },
    });
  }

  public async deleteSparepart(
    id: string,
    deletedBy?: string,
  ): Promise<SparepartsDTO | null> {
    const sparepart = await this.prisma.spareparts.findFirst({
      where: {
        id,
        deletedOn: null,
      },
    });

    if (!sparepart) return null;

    return await this.prisma.spareparts.update({
      where: { id },
      data: {
        deletedOn: getJakartaTime(),
        deletedBy: deletedBy,
      },
    });
  }
}

export default SparepartRepository;
