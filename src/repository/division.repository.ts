import { PrismaClient } from "@prisma/client";
import { DivisionDTO } from "../dto/division.dto";

import prisma from "../configs/db.config";

class DivisionRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    return await this.prisma.listDivisi.create({ data });
  }

  public async getDivisionById(id: number): Promise<DivisionDTO | null> {
    return await this.prisma.listDivisi.findUnique({ where: { id } });
  }
}

export default DivisionRepository