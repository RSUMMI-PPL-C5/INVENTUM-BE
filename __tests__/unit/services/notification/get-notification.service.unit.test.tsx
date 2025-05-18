import NotificationService from "../../../../src/services/notification.service";
import NotificationRepository from "../../../../src/repository/notification.repository";

// Mock functions
const mockGetNotificationsByUserId = jest.fn();
const mockMarkAsRead = jest.fn();
const mockGetNotificationById = jest.fn();
const mockGetAllNotifications = jest.fn();

// Mock repository
jest.mock("../../../../src/repository/notification.repository", () => {
  return jest.fn().mockImplementation(() => ({
    getNotificationsByUserId: mockGetNotificationsByUserId,
    markAsRead: mockMarkAsRead,
    getNotificationById: mockGetNotificationById,
    getAllNotifications: mockGetAllNotifications,
    createNotification: jest.fn(),
  }));
});

describe("NotificationService", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();
  });

  describe("getAllNotifications", () => {
    it("should return all notifications with null values transformed", async () => {
      const mockDate = new Date();
      const mockNotifications = [
        {
          id: "1",
          message: "test1",
          userId: "user123",
          requestId: null,
          request: null,
          isRead: false,
          createdAt: mockDate,
        },
        {
          id: "2",
          message: "test2",
          userId: null,
          requestId: "req123",
          request: { id: "req123" },
          isRead: true,
          createdAt: mockDate,
        },
        {
          id: "3",
          message: "test3",
          userId: "user456",
          requestId: "req456",
          request: { id: "req456" },
          isRead: false,
          createdAt: mockDate,
        },
      ];

      mockGetAllNotifications.mockResolvedValue(mockNotifications);

      const result = await notificationService.getAllNotifications();

      expect(mockGetAllNotifications).toHaveBeenCalled();
      expect(result).toHaveLength(3); // Should expect 3 items as per mock data
      expect(result[0].requestId).toBeUndefined();
      expect(result[0].request).toBeUndefined();
      expect(result[0].userId).toBe("user123");
      expect(result[1].userId).toBeUndefined();
      expect(result[1].requestId).toBe("req123");
      expect(result[1].request).toEqual({ id: "req123" });
      expect(result[2].userId).toBe("user456");
      expect(result[2].requestId).toBe("req456");
      expect(result[2].request).toEqual({ id: "req456" });
    });
  });

  describe("getNotificationsByUserId", () => {
    it("should return user notifications with null values transformed", async () => {
      const mockDate = new Date();
      const mockNotifications = [
        {
          id: "1",
          message: "test",
          userId: "user123",
          requestId: null,
          request: null,
          isRead: false,
          createdAt: mockDate,
        },
        {
          id: "2",
          message: "test2",
          userId: "user123",
          requestId: "req123",
          request: { id: "req123" },
          isRead: true,
          createdAt: mockDate,
        },
      ];

      mockGetNotificationsByUserId.mockResolvedValue(mockNotifications);

      const result =
        await notificationService.getNotificationsByUserId("user123");

      expect(mockGetNotificationsByUserId).toHaveBeenCalledWith("user123");
      expect(result).toHaveLength(2);
      expect(result[0].requestId).toBeUndefined();
      expect(result[0].request).toBeUndefined();
      expect(result[1].requestId).toBe("req123");
      expect(result[1].request).toBeDefined();
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "notif123",
        message: "test",
        userId: "user123",
        requestId: null,
        isRead: true,
        createdAt: mockDate,
      };

      mockMarkAsRead.mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead("notif123");

      expect(mockMarkAsRead).toHaveBeenCalledWith("notif123");
      expect(result.userId).toBe("user123");
      expect(result.requestId).toBeUndefined();
      expect(result.isRead).toBe(true);
    });

    it("should handle non-null requestId correctly", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "notif123",
        message: "test",
        userId: "user123",
        requestId: "req123",
        isRead: true,
        createdAt: mockDate,
      };

      mockMarkAsRead.mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead("notif123");

      expect(result.requestId).toBe("req123");
    });
  });

  describe("getNotificationById", () => {
    it("should return notification with transformed data", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "notif123",
        message: "test",
        userId: "user123",
        requestId: "req123",
        request: { id: "req123" },
        isRead: false,
        createdAt: mockDate,
      };

      mockGetNotificationById.mockResolvedValue(mockNotification);

      const result = await notificationService.getNotificationById("notif123");

      expect(mockGetNotificationById).toHaveBeenCalledWith("notif123");
      expect(result.userId).toBe("user123");
      expect(result.requestId).toBe("req123");
      expect(result.request).toBeDefined();
    });

    it("should throw error if notification not found", async () => {
      mockGetNotificationById.mockResolvedValue(null);

      await expect(
        notificationService.getNotificationById("notif123"),
      ).rejects.toThrow("Notification not found");
    });

    it("should transform null values to undefined", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "notif123",
        message: "test",
        userId: null,
        requestId: null,
        request: null,
        isRead: false,
        createdAt: mockDate,
      };

      mockGetNotificationById.mockResolvedValue(mockNotification);

      const result = await notificationService.getNotificationById("notif123");

      expect(result.userId).toBeUndefined();
      expect(result.requestId).toBeUndefined();
      expect(result.request).toBeUndefined();
    });
  });
});
