import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { CreateNotificationDto } from "../dto/notification.dto";

class NotificationRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
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
    // Untuk pengguna biasa, tampilkan hanya notifikasi yang userId-nya adalah pengguna tersebut
    // Untuk admin dan fasum, tampilkan semua notifikasi
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === "Admin" || user?.role === "Fasum") {
      // Admin dan Fasum melihat semua notifikasi
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
    } else {
      // Pengguna biasa hanya melihat notifikasi mereka sendiri
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
