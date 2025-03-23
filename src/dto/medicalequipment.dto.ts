import { MedicalEquipment } from "@prisma/client";

export interface MedicalEquipmentDTO extends MedicalEquipment {}

export interface AddMedicalEquipmentDTO {
  inventorisId: string;
  name: string;
  brandName?: string;
  modelName?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  status?: string;
  vendor?: string;
  createdBy: number;
}

export interface AddMedicalEquipmentResponseDTO {
  id: string;
  inventorisId: string;
  name: string;
  brandName?: string;
  modelName?: string;
}
