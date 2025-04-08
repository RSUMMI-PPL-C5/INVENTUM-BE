import { PrismaClient } from "@prisma/client";
import { SparepartsDTO } from "../dto/sparepart.dto";

import prisma from "../configs/db.config";

class SparepartRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async createSparepart(data: any): Promise<SparepartsDTO> {
    const newSparepart = await this.prisma.spareparts.create({
      data,
    });

    return newSparepart;
  }

  public async getSparepartById(id: string): Promise<SparepartsDTO | null> {
    return await this.prisma.spareparts.findUnique({
      where: { id },
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
    return await this.prisma.spareparts.delete({
      where: { id },
    });
  }
}

export default SparepartRepository;
