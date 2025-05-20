import {
  CreateNotificationDto,
  NotificationDto,
} from "../dto/notification.dto";
import NotificationRepository from "../repository/notification.repository";
import { INotificationService } from "./interface/notification.service.interface";
import { v4 as uuidv4 } from "uuid";

class NotificationService implements INotificationService {
  private readonly notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  public async createNotification(
    data: Omit<CreateNotificationDto, "id">,
  ): Promise<NotificationDto> {
    const createData: CreateNotificationDto = {
      id: uuidv4(),
      ...data,
    };

    const notification =
      await this.notificationRepository.createNotification(createData);
    return {
      ...notification,
      userId: notification.userId === null ? undefined : notification.userId,
      requestId:
        notification.requestId === null ? undefined : notification.requestId,
    };
  }

  public async getAllNotifications(): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationRepository.getAllNotifications();
    return notifications.map((notification) => ({
      ...notification,
      userId: notification.userId === null ? undefined : notification.userId,
      requestId:
        notification.requestId === null ? undefined : notification.requestId,
      request: notification.request === null ? undefined : notification.request,
    }));
  }

  public async getNotificationsByUserId(
    userId: string,
  ): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationRepository.getNotificationsByUserId(userId);
    return notifications.map((notification) => ({
      ...notification,
      userId: notification.userId === null ? undefined : notification.userId,
      requestId:
        notification.requestId === null ? undefined : notification.requestId,
      request: notification.request === null ? undefined : notification.request,
    }));
  }

  public async markAsRead(notificationId: string): Promise<NotificationDto> {
    const notification =
      await this.notificationRepository.markAsRead(notificationId);
    return {
      ...notification,
      userId: notification.userId === null ? undefined : notification.userId,
      requestId:
        notification.requestId === null ? undefined : notification.requestId,
    };
  }

  public async createRequestNotification(
    requestId: string,
    userId: string,
    requestType: "MAINTENANCE" | "CALIBRATION",
  ) {
    const message =
      requestType === "CALIBRATION"
        ? `New calibration request has been created`
        : `New maintenance request has been created`;

    return this.createNotification({
      userId,
      requestId,
      message,
    });
  }

  public async getNotificationById(id: string): Promise<NotificationDto> {
    const notification =
      await this.notificationRepository.getNotificationById(id);

    if (!notification) {
      throw new Error("Notification not found");
    }

    return {
      ...notification,
      userId: notification.userId === null ? undefined : notification.userId,
      requestId:
        notification.requestId === null ? undefined : notification.requestId,
      request: notification.request === null ? undefined : notification.request,
    };
  }
}

export default NotificationService;
