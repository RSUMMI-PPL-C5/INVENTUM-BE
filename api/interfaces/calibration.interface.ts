export interface ICalibration {
    id: string;
    equipmentName: string;
    date: Date;
    notes: string;
    namaTeknisi: string;
    treatmentType: string;
    flagMaintenance: boolean;
    status: string; // e.g., "pending", "completed"
  }
  