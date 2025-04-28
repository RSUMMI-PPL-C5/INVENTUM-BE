import { MedicalEquipmentDTO } from "./medical-equipment.dto";

export interface CalibrationHistoryDTO {
  id: string;
  medicalEquipmentId: string;
  actionPerformed: string;
  technician: string;
  result: string; // Success, Partial, Failed
  calibrationDate: Date;
  calibrationMethod: string;
  nextCalibrationDue?: Date | null;
  createdBy: string;
  createdOn: Date;
}

export interface CalibrationHistoryDetailDTO extends CalibrationHistoryDTO {
  medicalEquipment?: MedicalEquipmentDTO;
}

export interface CreateCalibrationHistoryDTO {
  medicalEquipmentId: string;
  actionPerformed: string;
  technician: string;
  result: string;
  calibrationDate: Date;
  calibrationMethod: string;
  nextCalibrationDue?: Date | null;
  createdBy: string;
}
