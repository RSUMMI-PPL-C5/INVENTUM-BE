export interface CalibrationHistoryDTO {
  id: string;
  requestId: string;
  medicalEquipmentId: string;
  actionPerformed: string;
  technician: string;
  result: string; // (Success, Partial, Failed)
  calibrationDate: Date;
  calibrationMethod: string;
  nextCalibrationDue?: Date;
  createdBy: string;
  createdOn: Date;
}
