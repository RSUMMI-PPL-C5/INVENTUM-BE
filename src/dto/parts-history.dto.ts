import { MedicalEquipmentDTO } from "./medical-equipment.dto";
import { SparepartDTO } from "./sparepart.dto";

export interface PartsHistoryDTO {
  id: string;
  equipmentId: string;
  sparepartId: string;
  actionPerformed: string;
  technician: string;
  result: string; // Success, Partial, Failed
  replacementDate: Date;
  createdBy: string;
  createdOn: Date;
}

export interface PartsHistoryDetailDTO extends PartsHistoryDTO {
  equipment: MedicalEquipmentDTO;
  sparepart: SparepartDTO;
}

export interface CreatePartsHistoryDTO {
  equipmentId: string;
  sparepartId: string;
  actionPerformed: string;
  technician: string;
  result: string;
  replacementDate: Date;
  createdBy: string;
}
