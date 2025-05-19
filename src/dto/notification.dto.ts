export interface CreateNotificationDto {
  id?: string;
  userId?: string;
  requestId?: string;
  message: string;
  isRead?: boolean;
}

export interface NotificationDto {
  id: string;
  userId?: string;
  requestId?: string;
  message: string;
  isRead: boolean;
  createdOn: Date;
  request?: {
    medicalEquipment: string;
    status: string;
    requestType: string;
  };
}
