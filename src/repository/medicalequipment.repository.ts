import { PrismaClient, Prisma, MedicalEquipment } from "@prisma/client";
import { MedicalEquipmentDTO } from "../dto/medicalequipment.dto";

import prisma from "../configs/db.config";

class MedicalEquipmentRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async getMedicalEquipment(): Promise<MedicalEquipmentDTO[]> {
    return await this.prisma.medicalEquipment.findMany();
  }

  public async getFilteredMedicalEquipment(
    whereClause: Prisma.MedicalEquipmentWhereInput
  ): Promise<MedicalEquipmentDTO[]> {
    return await prisma.medicalEquipment.findMany({ where: whereClause });
  }

  public async getMedicalEquipmentById(id: string): Promise<MedicalEquipmentDTO | null> {
    return await this.prisma.medicalEquipment.findUnique({
      where: { id },
    });
  }

  public async getMedicalEquipmentByName(nameQuery: string): Promise<MedicalEquipment[]> {
    return await this.prisma.medicalEquipment.findMany({
      where: {
				name: {
					contains: nameQuery,
				},
			},
    });
  }
}

export default MedicalEquipmentRepository;