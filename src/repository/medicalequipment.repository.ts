import { PrismaClient, MedicalEquipment } from "@prisma/client";
import {
  AddMedicalEquipmentResponseDTO,
  MedicalEquipmentDTO,
} from "../dto/medical-equipment.dto";
import prisma from "../configs/db.config";
import { getJakartaTime } from "../utils/date.utils";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { MedicalEquipmentFilterOptions } from "../interfaces/medicalequipment.filter.interface";

class MedicalEquipmentRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addMedicalEquipment(
    equipmentData: any,
  ): Promise<AddMedicalEquipmentResponseDTO> {
    const jakartaTime = getJakartaTime();
    const newEquipment = await this.prisma.medicalEquipment.create({
      data: {
        ...equipmentData,
        createdOn: jakartaTime,
        modifiedOn: jakartaTime,
      },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
        createdBy: true,
        createdOn: true,
      },
    });

    return {
      ...newEquipment,
      brandName: newEquipment.brandName ?? undefined,
      modelName: newEquipment.modelName ?? undefined,
    };
  }

  private buildWhereClause(
    search?: string,
    filters?: MedicalEquipmentFilterOptions,
  ): any {
    const where: any = {
      deletedOn: null, // Filter to exclude soft deleted records
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { inventorisId: { contains: search } },
        { brandName: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status };
      }

      this.addPurchaseDateFilter(where, filters);
      this.addCreatedOnFilter(where, filters);
      this.addModifiedOnFilter(where, filters);
    }

    return where;
  }

  private addPurchaseDateFilter(
    where: any,
    filters: MedicalEquipmentFilterOptions,
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
    filters: MedicalEquipmentFilterOptions,
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
    filters: MedicalEquipmentFilterOptions,
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

  public async getMedicalEquipment(
    search?: string,
    filters?: MedicalEquipmentFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ equipments: MedicalEquipmentDTO[]; total: number }> {
    const where = this.buildWhereClause(search, filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [equipments, total] = await Promise.all([
      this.prisma.medicalEquipment.findMany({
        where,
        skip,
        take,
        orderBy: {
          id: "desc",
        },
      }),
      this.prisma.medicalEquipment.count({ where }),
    ]);

    return { equipments, total };
  }

  public async findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    const equipment = await this.prisma.medicalEquipment.findUnique({
      where: {
        inventorisId,
        deletedOn: null,
      },
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
    const equipment = await this.prisma.medicalEquipment.findFirst({
      where: {
        id,
        deletedOn: null,
      },
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

  public async getMedicalEquipmentById(
    id: string,
  ): Promise<MedicalEquipmentDTO | null> {
    return await this.prisma.medicalEquipment.findFirst({
      where: {
        id,
        deletedOn: null,
      },
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
        deletedOn: null,
      },
    });
  }

  public async updateMedicalEquipment(
    id: string,
    data: Partial<MedicalEquipmentDTO>,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    const equipment = await this.prisma.medicalEquipment.findFirst({
      where: {
        id,
        deletedOn: null,
      },
    });

    if (!equipment) return null;

    const updatedEquipment = await this.prisma.medicalEquipment.update({
      where: { id },
      data: {
        ...data,
        modifiedOn: getJakartaTime(),
      },
      select: {
        id: true,
        inventorisId: true,
        name: true,
        brandName: true,
        modelName: true,
        modifiedBy: true,
        modifiedOn: true,
      },
    });

    return {
      ...updatedEquipment,
      brandName: updatedEquipment.brandName ?? undefined,
      modelName: updatedEquipment.modelName ?? undefined,
    };
  }

  public async deleteMedicalEquipment(
    id: string,
    deletedBy?: string,
  ): Promise<MedicalEquipmentDTO | null> {
    const equipment = await this.prisma.medicalEquipment.findFirst({
      where: {
        id,
        deletedOn: null,
      },
    });

    if (!equipment) return null;

    return await this.prisma.medicalEquipment.update({
      where: { id },
      data: {
        deletedOn: getJakartaTime(),
        deletedBy: deletedBy,
      },
    });
  }
}

export default MedicalEquipmentRepository;
