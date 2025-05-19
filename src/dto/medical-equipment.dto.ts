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
  lastLocation?: string;
  createdBy: string;
  createdOn?: Date;
}

export interface AddMedicalEquipmentResponseDTO {
  id: string;
  inventorisId: string;
  name: string;
  brandName?: string;
  modelName?: string;
  lastLocation?: string;
}

export interface UpdateMedicalEquipmentDTO {
  name?: string;
  brandName?: string;
  modelName?: string;
  modifiedBy: string;
  modifiedOn?: Date;
  purchaseDate?: Date;
  purchasePrice?: number;
  status?: string;
  vendor?: string;
  lastLocation?: string;
}
