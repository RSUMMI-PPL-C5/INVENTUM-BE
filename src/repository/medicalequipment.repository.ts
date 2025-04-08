import { PrismaClient, Prisma, MedicalEquipment } from "@prisma/client";
import {
  AddMedicalEquipmentResponseDTO,
  MedicalEquipmentDTO,
} from "../dto/medicalequipment.dto";
import prisma from "../configs/db.config";

class MedicalEquipmentRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addMedicalEquipment(
    equipmentData: any,
  ): Promise<AddMedicalEquipmentResponseDTO> {
    const newEquipment = await this.prisma.medicalEquipment.create({
      data: equipmentData,
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });

    return {
      ...newEquipment,
      brandName: newEquipment.brandName ?? undefined,
      modelName: newEquipment.modelName ?? undefined,
    };
  }

  public async findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    const equipment = await this.prisma.medicalEquipment.findUnique({
      where: { inventorisId },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });

    if (!equipment) return null;

    return {
      ...equipment,
      brandName: equipment.brandName ?? undefined,
      modelName: equipment.modelName ?? undefined,
    };
  }

  public async findById(
    id: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    const equipment = await this.prisma.medicalEquipment.findUnique({
      where: { id },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });

    if (!equipment) return null;

    return {
      ...equipment,
      brandName: equipment.brandName ?? undefined,
      modelName: equipment.modelName ?? undefined,
    };
  }

  public async updateMedicalEquipment(
    id: string,
    data: Partial<AddMedicalEquipmentResponseDTO>,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    const updatedEquipment = await this.prisma.medicalEquipment.update({
      where: { id },
      data,
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
      },
    });

    return {
      ...updatedEquipment,
      brandName: updatedEquipment.brandName ?? undefined,
      modelName: updatedEquipment.modelName ?? undefined,
    };
  }

  public async getMedicalEquipment(): Promise<MedicalEquipmentDTO[]> {
    return await this.prisma.medicalEquipment.findMany();
  }

  public async getFilteredMedicalEquipment(
    whereClause: Prisma.MedicalEquipmentWhereInput,
  ): Promise<MedicalEquipmentDTO[]> {
    return await this.prisma.medicalEquipment.findMany({ where: whereClause });
  }

  public async getMedicalEquipmentById(
    id: string,
  ): Promise<MedicalEquipmentDTO | null> {
    return await this.prisma.medicalEquipment.findUnique({
      where: { id },
    });
  }

  public async getMedicalEquipmentByName(
    nameQuery: string,
  ): Promise<MedicalEquipment[]> {
    return await this.prisma.medicalEquipment.findMany({
      where: {
        name: {
          contains: nameQuery,
        },
      },
    });
  }

  public async deleteMedicalEquipment(id: string): Promise<MedicalEquipmentDTO | null> {
      // Soft delete by updating `deletedOn` field instead of removing the record
      return await this.prisma.medicalEquipment.update({
        where: { id },
        data: { deletedOn: new Date() },
      });
    }
}

export default MedicalEquipmentRepository;
