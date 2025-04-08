import { MedicalEquipment } from "@prisma/client";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  UpdateMedicalEquipmentDTO,
  MedicalEquipmentDTO,
} from "../../dto/medicalequipment.dto";
import { MedicalEquipmentFilterOptions } from "../../filters/interface/medicalequipment.filter.interface";

export interface IMedicalEquipmentService {
  // Create
  addMedicalEquipment(
    data: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO>;

  // Read
  findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;

  getMedicalEquipment(): Promise<MedicalEquipmentDTO[]>;

  getMedicalEquipmentById(
    id: string,
  ): Promise<MedicalEquipmentDTO | null>;

  getFilteredMedicalEquipment(
    filters: MedicalEquipmentFilterOptions,
  ): Promise<MedicalEquipment[]>;

  searchMedicalEquipment(
    name: string,
  ): Promise<MedicalEquipment[]>;

  // Update
  updateMedicalEquipment(
    id: string,
    equipmentData: UpdateMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;
}
