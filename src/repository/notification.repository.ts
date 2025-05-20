import { PrismaClient } from "@prisma/client";
import { CreateNotificationDto } from "../dto/notification.dto";

class NotificationRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async createNotification(data: CreateNotificationDto) {
    return this.prisma.notifikasi.create({
      data: {
        id: data.id!,
        userId: data.userId,
        requestId: data.requestId,
        message: data.message,
        isRead: data.isRead || false,
      },
    });
  }

  public async getAllNotifications() {
    return this.prisma.notifikasi.findMany({
      orderBy: {
        createdOn: "desc",
      },
      include: {
        request: {
          select: {
            medicalEquipment: true,
            status: true,
            requestType: true,
          },
        },
      },
    });
  }

  public async getNotificationsByUserId(userId: string) {
    return this.prisma.notifikasi.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdOn: "desc",
      },
      include: {
        request: {
          select: {
            medicalEquipment: true,
            status: true,
            requestType: true,
          },
        },
      },
    });
  }

  public async markAsRead(id: string) {
    return this.prisma.notifikasi.update({
      where: { id },
      data: { isRead: true },
    });
  }

  public async getNotificationById(id: string) {
    return this.prisma.notifikasi.findUnique({
      where: { id },
      include: {
        request: {
          select: {
            medicalEquipment: true,
            status: true,
            requestType: true,
          },
        },
      },
    });
  }
}

export default NotificationRepository;
