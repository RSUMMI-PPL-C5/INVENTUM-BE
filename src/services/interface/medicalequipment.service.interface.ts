import { MedicalEquipment } from "@prisma/client";
import {
  AddMedicalEquipmentDTO,
  AddMedicalEquipmentResponseDTO,
  MedicalEquipmentDTO,
} from "../../dto/medicalequipment.dto";
import { MedicalEquipmentFilterOptions } from "../../filters/interface/medicalequipment.filter.interface";

export interface IMedicalEquipmentService {
  // Create
  addMedicalEquipment(
    data: AddMedicalEquipmentDTO,
  ): Promise<AddMedicalEquipmentResponseDTO>;

  findByInventorisId(
    inventorisId: string,
  ): Promise<AddMedicalEquipmentResponseDTO | null>;

  // Read
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
}
