import { PrismaClient, Spareparts } from "@prisma/client";
import { SparepartDTO, SparepartsDTO } from "../dto/sparepart.dto";
import prisma from "../configs/db.config";
import { getJakartaTime } from "../utils/date.utils";
import { PaginationOptions } from "../filters/interface/pagination.interface";
import { SparepartFilterOptions } from "../filters/interface/spareparts.filter.interface";

class SparepartRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
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
    }
  }

  private buildWhereClause(
    search?: string,
    filters?: SparepartFilterOptions
  ): any {
    const where: any = {
      deletedOn: null,
    };

    if (search) {
      where.OR = [
        { partsName: { contains: search } },
        { toolLocation: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.partsName) {
        where.partsName = { contains: filters.partsName };
      }
      
      if (filters.toolLocation) {
        where.toolLocation = { contains: filters.toolLocation };
      }

      this.addPriceFilter(where, filters);
      this.addPurchaseDateFilter(where, filters);
      this.addCreatedOnFilter(where, filters);
      this.addModifiedOnFilter(where, filters);
    }

    return where;
  }

  private addPriceFilter(
    where: any,
    filters: SparepartFilterOptions
  ): void {
    if (filters.priceMin || filters.priceMax) {
      where.price = {};
      
      if (filters.priceMin) {
        where.price.gte = filters.priceMin;
      }
      
      if (filters.priceMax) {
        where.price.lte = filters.priceMax;
      }
    }
  }

  private addPurchaseDateFilter(
    where: any, 
    filters: SparepartFilterOptions
  ): void {
    if (filters.purchaseDateStart || filters.purchaseDateEnd) {
      where.purchaseDate = {};
      if (filters.purchaseDateStart) {
        where.purchaseDate.gte = new Date(filters.purchaseDateStart);
      }
      if (filters.purchaseDateEnd) {
        where.purchaseDate.lte = new Date(filters.purchaseDateEnd);
      }
    }
  }

  private addCreatedOnFilter(
    where: any,
    filters: SparepartFilterOptions
  ): void {
    if (filters.createdOnStart || filters.createdOnEnd) {
      where.createdOn = {};
      if (filters.createdOnStart) {
        where.createdOn.gte = new Date(filters.createdOnStart);
      }
      if (filters.createdOnEnd) {
        where.createdOn.lte = new Date(filters.createdOnEnd);
      }
    }
  }

  private addModifiedOnFilter(
    where: any,
    filters: SparepartFilterOptions
  ): void {
    if (filters.modifiedOnStart || filters.modifiedOnEnd) {
      where.modifiedOn = {};
      if (filters.modifiedOnStart) {
        where.modifiedOn.gte = new Date(filters.modifiedOnStart);
      }
      if (filters.modifiedOnEnd) {
        where.modifiedOn.lte = new Date(filters.modifiedOnEnd);
      }
    }
  }

  public async getSpareparts(
    search?: string,
    filters?: SparepartFilterOptions,
    pagination?: PaginationOptions
  ): Promise<{ spareparts: SparepartDTO[], total: number }> {
    const where = this.buildWhereClause(search, filters);

    const skip = pagination ? (pagination.page - 1) * pagination.limit : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [spareparts, total] = await Promise.all([
      this.prisma.spareparts.findMany({
        where,
        skip,
        take,
        orderBy: {
          id: "desc",
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
        deletedOn: null 
      },
    });
  }

  public async getSparepartByName(
    nameQuery: string,
  ): Promise<Spareparts[]> {
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
        deletedOn: null 
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

  public async deleteSparepart(id: string, deletedBy?: string): Promise<SparepartsDTO | null> {
    const sparepart = await this.prisma.spareparts.findFirst({
      where: { 
        id,
        deletedOn: null 
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