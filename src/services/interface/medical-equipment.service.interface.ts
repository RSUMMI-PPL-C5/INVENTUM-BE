import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
  MedicalEquipmentDTO,
} from "../../dto/medical-equipment.dto";
import { MedicalEquipmentFilterOptions } from "../../interfaces/medical-equipment.filter.interface";
import { PaginationOptions } from "../../interfaces/pagination.interface";

export interface IMedicalEquipmentService {
  // Create
  addMedicalEquipment(
    data: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO>;

  getMedicalEquipment(
    search?: string,
    filters?: MedicalEquipmentFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: MedicalEquipmentDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;

  getMedicalEquipmentById(id: string): Promise<MedicalEquipmentDTO | null>;

  // Update
  updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;

  // Delete
  deleteMedicalEquipment(
    id: string,
    deletedById?: string,
  ): Promise<MedicalEquipmentDTO | null>;
}
