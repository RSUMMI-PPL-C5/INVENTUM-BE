import { PrismaClient, Prisma } from "@prisma/client";
import { SparepartDTO, SparepartsDTO } from "../dto/sparepart.dto";
import prisma from "../configs/db.config";

class SparepartRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async getSpareparts(): Promise<SparepartDTO[]> {
    return await this.prisma.spareparts.findMany({
      where: {
        deletedOn: null,
      },
    });
  }

  public async getSparepartById(id: string): Promise<SparepartsDTO | null> {
    return await this.prisma.spareparts.findUnique({
      where: { id },
    });
  }

  public async getFilteredSpareparts(
    whereClause: Prisma.SparepartsWhereInput,
  ): Promise<SparepartDTO[]> {
    return await this.prisma.spareparts.findMany({
      where: {
        ...whereClause,
        deletedOn: null,
      },
    });
  }

  public async createSparepart(data: any): Promise<SparepartsDTO> {
    return await this.prisma.spareparts.create({
      data,
    });
  }

  public async updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null> {
    return await this.prisma.spareparts.update({
      where: { id },
      data,
    });
  }

  public async deleteSparepart(id: string): Promise<SparepartsDTO | null> {
    // Soft delete by updating `deletedOn` field instead of removing the record
    return await this.prisma.spareparts.update({
      where: { id },
      data: { deletedOn: new Date() },
    });
  }
}

export default SparepartRepository;
