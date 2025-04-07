import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { AddMedicalEquipmentResponseDTO } from "../dto/medicalequipment.dto";

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
}

export default MedicalEquipmentRepository;
