import { MedicalEquipmentDTO } from "./medical-equipment.dto";

export interface MaintenanceHistoryDTO {
  id: string;
  medicalEquipmentId: string;
  actionPerformed: string;
  technician: string;
  result: string; // Success, Partial, Failed
  maintenanceDate: Date;
  createdBy: string;
  createdOn: Date;
}

export interface MaintenanceHistoryDetailDTO extends MaintenanceHistoryDTO {
  medicalEquipment?: MedicalEquipmentDTO;
}

export interface CreateMaintenanceHistoryDTO {
  medicalEquipmentId: string;
  actionPerformed: string;
  technician: string;
  result: string;
  maintenanceDate: Date;
  createdBy: string;
}
