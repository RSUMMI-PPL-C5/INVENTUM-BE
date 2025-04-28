import { v4 as uuidv4 } from "uuid";
import { IMedicalEquipmentService } from "./interface/medical-equipment.service.interface";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
  MedicalEquipmentDTO,
} from "../dto/medical-equipment.dto";
import { MedicalEquipmentFilterOptions } from "../interfaces/medical-equipment.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import MedicalEquipmentRepository from "../repository/medical-equipment.repository";

class MedicalEquipmentService implements IMedicalEquipmentService {
  private readonly medicalEquipmentRepository: MedicalEquipmentRepository;

  constructor() {
    this.medicalEquipmentRepository = new MedicalEquipmentRepository();
  }

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
    };

    return await this.medicalEquipmentRepository.addMedicalEquipment(
      createData,
    );
  }

  public async getMedicalEquipment(
    search?: string,
    filters?: MedicalEquipmentFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { equipments, total } =
      await this.medicalEquipmentRepository.getMedicalEquipment(
        search,
        filters,
        pagination,
      );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: equipments,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? equipments.length,
        totalPages,
      },
    };
  }

  public async getMedicalEquipmentById(
    id: string,
  ): Promise<MedicalEquipmentDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Equipment ID is required and must be a valid string");
    }

    return await this.medicalEquipmentRepository.getMedicalEquipmentById(id);
  }

  public async updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Equipment ID is required and must be a valid string");
    }

    const equipment = await this.medicalEquipmentRepository.findById(id);
    if (!equipment) {
      throw new Error("Medical equipment not found");
    }

    const updateData = {
      ...equipmentData,
    };

    return await this.medicalEquipmentRepository.updateMedicalEquipment(
      id,
      updateData,
    );
  }

  public async deleteMedicalEquipment(
    id: string,
    deletedById?: string,
  ): Promise<MedicalEquipmentDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Equipment ID is required and must be a valid string");
    }

    const equipment = await this.medicalEquipmentRepository.findById(id);
    if (!equipment) {
      throw new Error("Medical equipment not found");
    }

    const deletedBy = deletedById;

    return await this.medicalEquipmentRepository.deleteMedicalEquipment(
      id,
      deletedBy,
    );
  }
}

export default MedicalEquipmentService;
