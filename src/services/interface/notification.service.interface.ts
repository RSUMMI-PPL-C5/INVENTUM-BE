import {
  CreateNotificationDto,
  NotificationDto,
} from "../../dto/notification.dto";

export interface INotificationService {
  createNotification(
    data: Omit<CreateNotificationDto, "id">,
  ): Promise<NotificationDto>;
  getAllNotifications(): Promise<NotificationDto[]>;
  getNotificationsByUserId(userId: string): Promise<NotificationDto[]>;
  getNotificationById(id: string): Promise<NotificationDto>;
  markAsRead(notificationId: string): Promise<NotificationDto>;
  createRequestNotification(
    requestId: string,
    userId: string,
    requestType: "MAINTENANCE" | "CALIBRATION",
    isRequestor?: boolean,
  ): Promise<NotificationDto>;
}
