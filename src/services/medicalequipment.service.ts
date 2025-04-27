import { v4 as uuidv4 } from "uuid";
import { IMedicalEquipmentService } from "./interface/medicalequipment.service.interface";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
  MedicalEquipmentDTO,
} from "../dto/medicalequipment.dto";
import { MedicalEquipmentFilterOptions } from "../interface/medicalequipment.filter.interface";
import { PaginationOptions } from "../interface/pagination.interface";
import MedicalEquipmentRepository from "../repository/medicalequipment.repository";
import AppError from "../utils/appError";

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
      throw new AppError(
        "inventorisId is required and must be a valid string",
        400,
      );
    }

    const existingEquipment =
      await this.medicalEquipmentRepository.findByInventorisId(
        equipmentData.inventorisId,
      );
    if (existingEquipment) {
      throw new AppError("Inventoris ID already in use", 400);
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
      throw new AppError(
        "Equipment ID is required and must be a valid string",
        400,
      );
    }

    return await this.medicalEquipmentRepository.getMedicalEquipmentById(id);
  }

  public async updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new AppError(
        "Equipment ID is required and must be a valid string",
        400,
      );
    }

    const equipment = await this.medicalEquipmentRepository.findById(id);
    if (!equipment) {
      throw new AppError("Medical equipment not found", 404);
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
      throw new AppError(
        "Equipment ID is required and must be a valid string",
        400,
      );
    }

    const equipment = await this.medicalEquipmentRepository.findById(id);
    if (!equipment) {
      throw new AppError("Medical equipment not found", 404);
    }

    const deletedBy = deletedById;

    return await this.medicalEquipmentRepository.deleteMedicalEquipment(
      id,
      deletedBy,
    );
  }
}

export default MedicalEquipmentService;
