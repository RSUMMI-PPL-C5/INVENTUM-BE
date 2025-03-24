import { PrismaClient, Prisma } from "@prisma/client";
import { SparepartDTO } from "../dto/sparepart.dto";
import prisma from "../configs/db.config";

class SparepartRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async getSpareparts(): Promise<SparepartDTO[]> {
    return await this.prisma.spareparts.findMany({
      where: {
        deletedOn: null, // Only get non-deleted spareparts
      },
    });
  }

  public async getSparepartById(id: string): Promise<SparepartDTO | null> {
    return await this.prisma.spareparts.findUnique({
      where: {
        id,
        deletedOn: null, // Only get non-deleted spareparts
      },
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
}

export default SparepartRepository;
