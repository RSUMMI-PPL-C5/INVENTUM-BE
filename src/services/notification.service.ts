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
      userId: notification.userId ?? undefined,
      requestId: notification.requestId ?? undefined,
    };
  }

  public async getAllNotifications(): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationRepository.getAllNotifications();
    return notifications.map((notification) => ({
      ...notification,
      userId: notification.userId ?? undefined,
      requestId: notification.requestId ?? undefined,
      request: notification.request ?? undefined,
    }));
  }

  public async getNotificationsByUserId(
    userId: string,
  ): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationRepository.getNotificationsByUserId(userId);
    return notifications.map((notification) => ({
      ...notification,
      userId: notification.userId ?? undefined,
      requestId: notification.requestId ?? undefined,
      request: notification.request ?? undefined,
    }));
  }

  public async markAsRead(notificationId: string): Promise<NotificationDto> {
    const notification =
      await this.notificationRepository.markAsRead(notificationId);
    return {
      ...notification,
      userId: notification.userId ?? undefined,
      requestId: notification.requestId ?? undefined,
    };
  }
  public async createRequestNotification(
    requestId: string,
    userId: string,
    requestType: "MAINTENANCE" | "CALIBRATION",
  ) {
    // Gunakan pesan yang sama untuk semua pengguna
    const message =
      requestType === "CALIBRATION"
        ? `Permintaan kalibrasi baru telah dibuat dan perlu ditindaklanjuti`
        : `Permintaan pemeliharaan baru telah dibuat dan perlu ditindaklanjuti`;

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
      userId: notification.userId ?? undefined,
      requestId: notification.requestId ?? undefined,
      request: notification.request ?? undefined,
    };
  }
}

export default NotificationService;
