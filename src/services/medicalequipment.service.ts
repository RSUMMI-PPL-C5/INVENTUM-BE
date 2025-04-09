import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { IMedicalEquipmentService } from "./interface/medicalequipment.service.interface";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
  MedicalEquipmentDTO,
} from "../dto/medicalequipment.dto";
import { MedicalEquipmentFilterOptions } from "../filters/interface/medicalequipment.filter.interface";
import { filterHandlers } from "../filters/medicalequipment.filter";
import MedicalEquipmentRepository from "../repository/medicalequipment.repository";

class MedicalEquipmentService implements IMedicalEquipmentService {
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;

  constructor() {
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
  }

  // ✅ CREATE
  public async addMedicalEquipment(
    equipmentData: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO> {
    if (
      !equipmentData.inventorisId ||
      typeof equipmentData.inventorisId !== "string" ||
      equipmentData.inventorisId.trim() === ""
    ) {
      throw new Error("inventorisId is required and must be a valid string");
    }

    if (!equipmentData.name || typeof equipmentData.createdBy !== "number") {
      throw new Error(
        "name and createdBy are required, and createdBy must be a number",
      );
    }

    if (equipmentData.purchasePrice !== undefined && equipmentData.purchasePrice < 0) {
      throw new Error("Price cannot be negative");
    }

    if (
      equipmentData.purchaseDate &&
      new Date(equipmentData.purchaseDate) > new Date()
    ) {
      throw new Error("datePurchase cannot be in the future");
    }

    const existingEquipment =
      await this.medicalEquipmentRepository.findByInventorisId(
        equipmentData.inventorisId,
      );
    if (existingEquipment) {
      throw new Error("Inventoris ID already in use");
    }

    const createData = {
      id: uuidv4(),
      ...equipmentData,
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    return await this.medicalEquipmentRepository.addMedicalEquipment(
      createData,
    );
  }

  // ✅ READ
  public async findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    if (
      !inventorisId ||
      typeof inventorisId !== "string" ||
      inventorisId.trim() === ""
    ) {
      throw new Error("inventorisId is required and must be a valid string");
    }

    return await this.medicalEquipmentRepository.findByInventorisId(
      inventorisId,
    );
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

  // ✅ UPDATE
  public async updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Equipment ID is required and must be a valid string");
    }

    if (typeof equipmentData.modifiedBy !== "number") {
      throw new Error("modifiedBy is required and must be a number");
    }

    if (equipmentData.purchasePrice !== undefined && equipmentData.purchasePrice < 0) {
      throw new Error("Price cannot be negative");
    }

    if (
      equipmentData.purchaseDate &&
      new Date(equipmentData.purchaseDate) > new Date()
    ) {
      throw new Error("datePurchase cannot be in the future");
    }

    const equipment = await this.medicalEquipmentRepository.findById(id);
    if (!equipment) {
      throw new Error("Medical equipment not found");
    }

    const updateData = {
      ...equipmentData,
      modifiedOn: new Date(),
    };

    return await this.medicalEquipmentRepository.updateMedicalEquipment(
      id,
      updateData,
    );
  }

  public async deleteMedicalEquipment(id: string): Promise<MedicalEquipmentDTO | null> {
    const sparepart = await this.medicalEquipmentRepository.findById(id);
    if (!sparepart) {
      return null;
    }

    const deletedData: Partial<MedicalEquipmentDTO> = {
      deletedOn: new Date(),
    };

    // Note: If you implement soft delete, call updateSparepart instead
    return await this.medicalEquipmentRepository.deleteMedicalEquipment(id);
  }
}

export default MedicalEquipmentService;
