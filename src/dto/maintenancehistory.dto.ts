export interface MaintenanceHistoryDTO {
  id: string;
  requestId: string;
  medicalEquipmentId: string;
  actionPerformed: string;
  technician: string;
  partsReplaced?: string;
  result: string; // (Success, Partial, Failed)
  completedOn: Date;
  createdBy: string;
  createdOn: Date;
}
