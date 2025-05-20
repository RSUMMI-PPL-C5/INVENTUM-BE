import NotificationService from "../../../../src/services/notification.service";

// Mock repository methods
const mockGetAllNotifications = jest.fn();
const mockGetNotificationsByUserId = jest.fn();
const mockGetNotificationById = jest.fn();
const mockMarkAsRead = jest.fn();

// Mock the repository
jest.mock("../../../../src/repository/notification.repository", () => {
  return jest.fn().mockImplementation(() => ({
    createNotification: jest.fn(),
    getAllNotifications: mockGetAllNotifications,
    getNotificationsByUserId: mockGetNotificationsByUserId,
    markAsRead: mockMarkAsRead,
    getNotificationById: mockGetNotificationById,
  }));
});

describe("NotificationService - Get and Mark Operations", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();
  });

  describe("getAllNotifications", () => {
    it("should return all notifications with transformed values", async () => {
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
      ];

      mockGetAllNotifications.mockResolvedValue(mockNotifications);

      const result = await notificationService.getAllNotifications();

      expect(mockGetAllNotifications).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe("user123");
      expect(result[0].requestId).toBeUndefined();
      expect(result[0].request).toBeUndefined();
      expect(result[1].userId).toBeUndefined();
      expect(result[1].requestId).toBe("req123");
      expect(result[1].request).toEqual({ id: "req123" });
    });
  });

  describe("getNotificationsByUserId", () => {
    it("should return user notifications with transformed values", async () => {
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
      expect(result[1].request).toEqual({ id: "req123" });
    });

    it("should transform null userId to undefined in notifications", async () => {
      const mockDate = new Date();
      const mockNotifications = [
        {
          id: "1",
          message: "test",
          userId: null,
          requestId: null,
          request: null,
          isRead: false,
          createdAt: mockDate,
        },
      ];

      mockGetNotificationsByUserId.mockResolvedValue(mockNotifications);

      const result =
        await notificationService.getNotificationsByUserId("user123");

      expect(result[0].userId).toBeUndefined();
    });
  });

  describe("getNotificationById", () => {
    it("should return notification with transformed values", async () => {
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
      expect(result.request).toEqual({ id: "req123" });
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

    it("should throw error if notification not found", async () => {
      mockGetNotificationById.mockResolvedValue(null);

      await expect(
        notificationService.getNotificationById("notif123"),
      ).rejects.toThrow("Notification not found");
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read and transform null values", async () => {
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

    it("should transform null userId to undefined when marking as read", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "notif123",
        message: "test",
        userId: null,
        requestId: "req123",
        isRead: true,
        createdAt: mockDate,
      };

      mockMarkAsRead.mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead("notif123");

      expect(result.userId).toBeUndefined();
    });
  });
});
