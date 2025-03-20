import { PrismaClient } from "@prisma/client";
import { DivisiDTO } from "../dto/divisi.dto";

import prisma from "../configs/db.config";

class DivisiRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addDivisi(data: Partial<DivisiDTO>): Promise<DivisiDTO> {
    return await this.prisma.listDivisi.create({ data });
  }

  public async getDivisiById(id: number): Promise<DivisiDTO | null> {
    return await this.prisma.listDivisi.findUnique({ where: { id } });
  }
}

export default DivisiRepository