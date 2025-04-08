import { Prisma } from "@prisma/client";
import { IMedicalEquipmentService } from "./interface/medicalequipment.service.interface";
import { MedicalEquipmentDTO } from "../dto/medicalequipment.dto";
import { filterHandlers } from "../filters/medicalequipment.filter";
import { MedicalEquipmentFilterOptions } from "../filters/interface/medicalequipment.filter.interface";
import MedicalEquipmentRepository from "../repository/medicalequipment.repository";

class MedicalEquipmentService implements IMedicalEquipmentService {
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;

  constructor() {
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
  }

  public async getMedicalEquipment(): Promise<MedicalEquipmentDTO[]> {
    return await this.medicalEquipmentRepository.getMedicalEquipment();
  }

  public async getMedicalEquipmentById(
    id: string,
  ): Promise<MedicalEquipmentDTO | null> {
    return await this.medicalEquipmentRepository.getMedicalEquipmentById(id);
  }

  public async getFilteredMedicalEquipment(
    filters: MedicalEquipmentFilterOptions,
  ): Promise<MedicalEquipmentDTO[]> {
    const whereClause: Prisma.MedicalEquipmentWhereInput = {};
    filterHandlers.forEach((handler) => handler(filters, whereClause));
    return await this.medicalEquipmentRepository.getFilteredMedicalEquipment(
      whereClause,
    );
  }

  public async searchMedicalEquipment(
    name: string,
  ): Promise<MedicalEquipmentDTO[]> {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Name query is required");
    }
    return this.medicalEquipmentRepository.getMedicalEquipmentByName(
      name.trim(),
    );
  }
}

export default MedicalEquipmentService;
