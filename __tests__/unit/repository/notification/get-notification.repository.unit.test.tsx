import { PrismaClient } from "@prisma/client";
import NotificationRepository from "../../../../src/repository/notification.repository";

// Create a mock of the Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      notifikasi: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    })),
  };
});

describe("NotificationRepository - Get Methods and markAsRead", () => {
  let notificationRepository: NotificationRepository;
  let mockPrismaClient: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create fresh instances
    mockPrismaClient = new PrismaClient();
    notificationRepository = new NotificationRepository();

    // Replace the repository's Prisma instance with our mock
    Object.defineProperty(notificationRepository, "prisma", {
      value: mockPrismaClient,
    });
  });

  describe("getAllNotifications", () => {
    it("should return all notifications sorted by createdOn in descending order", async () => {
      // Arrange
      const mockNotifications = [
        {
          id: "notification-1",
          message: "First notification",
          userId: "user-1",
          requestId: "request-1",
          isRead: false,
          createdOn: new Date("2023-05-20T10:00:00Z"),
          request: {
            medicalEquipment: "Equipment 1",
            status: "PENDING",
            requestType: "MAINTENANCE",
          },
        },
        {
          id: "notification-2",
          message: "Second notification",
          userId: "user-2",
          requestId: "request-2",
          isRead: true,
          createdOn: new Date("2023-05-21T10:00:00Z"),
          request: {
            medicalEquipment: "Equipment 2",
            status: "COMPLETED",
            requestType: "CALIBRATION",
          },
        },
      ];

      mockPrismaClient.notifikasi.findMany.mockResolvedValue(mockNotifications);

      // Act
      const result = await notificationRepository.getAllNotifications();

      // Assert
      expect(mockPrismaClient.notifikasi.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockNotifications);
    });

    it("should return empty array if no notifications exist", async () => {
      // Arrange
      mockPrismaClient.notifikasi.findMany.mockResolvedValue([]);

      // Act
      const result = await notificationRepository.getAllNotifications();

      // Assert
      expect(mockPrismaClient.notifikasi.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      mockPrismaClient.notifikasi.findMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        notificationRepository.getAllNotifications(),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getNotificationsByUserId", () => {
    it("should return notifications for a specific user", async () => {
      // Arrange
      const userId = "user-123";
      const mockNotifications = [
        {
          id: "notification-1",
          message: "User notification 1",
          userId: "user-123",
          requestId: "request-1",
          isRead: false,
          createdOn: new Date("2023-05-20T10:00:00Z"),
          request: {
            medicalEquipment: "Equipment 1",
            status: "PENDING",
            requestType: "MAINTENANCE",
          },
        },
        {
          id: "notification-2",
          message: "User notification 2",
          userId: "user-123",
          requestId: "request-2",
          isRead: true,
          createdOn: new Date("2023-05-21T10:00:00Z"),
          request: null,
        },
      ];

      mockPrismaClient.notifikasi.findMany.mockResolvedValue(mockNotifications);

      // Act
      const result =
        await notificationRepository.getNotificationsByUserId(userId);

      // Assert
      expect(mockPrismaClient.notifikasi.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockNotifications);
    });

    it("should return empty array if user has no notifications", async () => {
      // Arrange
      const userId = "user-without-notifications";
      mockPrismaClient.notifikasi.findMany.mockResolvedValue([]);

      // Act
      const result =
        await notificationRepository.getNotificationsByUserId(userId);

      // Assert
      expect(mockPrismaClient.notifikasi.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual([]);
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const userId = "user-123";
      const dbError = new Error("Database connection failed");
      mockPrismaClient.notifikasi.findMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        notificationRepository.getNotificationsByUserId(userId),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getNotificationById", () => {
    it("should return a notification when found by ID", async () => {
      // Arrange
      const notificationId = "notification-123";
      const mockNotification = {
        id: "notification-123",
        message: "Test notification",
        userId: "user-123",
        requestId: "request-123",
        isRead: false,
        createdOn: new Date("2023-05-20T10:00:00Z"),
        request: {
          medicalEquipment: "Equipment 1",
          status: "PENDING",
          requestType: "MAINTENANCE",
        },
      };

      mockPrismaClient.notifikasi.findUnique.mockResolvedValue(
        mockNotification,
      );

      // Act
      const result =
        await notificationRepository.getNotificationById(notificationId);

      // Assert
      expect(mockPrismaClient.notifikasi.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
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
      expect(result).toEqual(mockNotification);
    });

    it("should return null when notification with ID not found", async () => {
      // Arrange
      const notificationId = "non-existent-id";
      mockPrismaClient.notifikasi.findUnique.mockResolvedValue(null);

      // Act
      const result =
        await notificationRepository.getNotificationById(notificationId);

      // Assert
      expect(mockPrismaClient.notifikasi.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
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
      expect(result).toBeNull();
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const notificationId = "notification-123";
      const dbError = new Error("Database connection failed");
      mockPrismaClient.notifikasi.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        notificationRepository.getNotificationById(notificationId),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      // Arrange
      const notificationId = "notification-123";
      const mockUpdatedNotification = {
        id: "notification-123",
        message: "Test notification",
        userId: "user-123",
        requestId: "request-123",
        isRead: true, // Now marked as read
        createdOn: new Date("2023-05-20T10:00:00Z"),
      };

      mockPrismaClient.notifikasi.update.mockResolvedValue(
        mockUpdatedNotification,
      );

      // Act
      const result = await notificationRepository.markAsRead(notificationId);

      // Assert
      expect(mockPrismaClient.notifikasi.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: true },
      });
      expect(result).toEqual(mockUpdatedNotification);
    });

    it("should throw error when notification not found", async () => {
      // Arrange
      const notificationId = "non-existent-id";
      const notFoundError = new Error("Notification not found");
      mockPrismaClient.notifikasi.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(
        notificationRepository.markAsRead(notificationId),
      ).rejects.toThrow("Notification not found");
    });

    it("should throw error when database update fails", async () => {
      // Arrange
      const notificationId = "notification-123";
      const dbError = new Error("Database connection failed");
      mockPrismaClient.notifikasi.update.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        notificationRepository.markAsRead(notificationId),
      ).rejects.toThrow("Database connection failed");
    });
  });
});
