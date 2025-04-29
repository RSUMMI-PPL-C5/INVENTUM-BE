import { Request } from "@prisma/client";

export interface RequesDTO extends Request {}

export interface CreateRequestDTO {
  userId: string;
  medicalEquipment: string;
  complaint?: string;
  submissionDate: Date;
  createdBy: string;
  requestType: "MAINTENANCE" | "CALIBRATION";
}

export interface RequestResponseDTO {
  id: string;
  userID: string;
  medicalEquipment: string;
  complaint?: string;
  submissionDate: Date;
  status: string;
  requestType: string;
}
