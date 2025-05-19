import { RequestType } from "@prisma/client";

export class RequestDTO {
  id!: string;
  userId!: string;
  medicalEquipment!: string;
  complaint!: string | null; // Changed from string? to string | null
  status!: string;
  createdBy!: string;
  createdOn!: Date | null; // Changed to allow null
  modifiedBy!: string | null; // Changed to allow null
  modifiedOn!: Date;
  requestType!: RequestType;
  user?: {
    id: string;
    fullname: string;
    username: string;
  };
}

export class RequestResponseDTO extends RequestDTO {
  comments?: Array<{
    id: string;
    text: string;
    userId: string;
    createdAt: Date;
    modifiedAt: Date;
    requestId: string | null;
    user: {
      id: string;
      fullname: string;
      username: string;
    };
  }>;

  notifications?: Array<{
    id: string;
    userId: string | null;
    requestId: string | null;
    createdOn: Date;
    message: string;
    isRead: boolean;
  }>;
}

export interface CreateRequestDTO {
  userId: string;
  medicalEquipment: string;
  complaint?: string;
  createdBy: string;
  requestType: RequestType;
}
