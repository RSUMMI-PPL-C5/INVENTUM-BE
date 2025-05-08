export interface CalibrationHistoryFilterOptions {
  medicalEquipmentId?: string;
  result?: string[];
  calibrationDateStart?: Date;
  calibrationDateEnd?: Date;
  calibrationMethod?: string;
  nextCalibrationDueBefore?: Date;
  createdOnStart?: Date;
  createdOnEnd?: Date;
}
