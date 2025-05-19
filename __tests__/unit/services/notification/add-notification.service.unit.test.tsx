import NotificationService from "../../../../src/services/notification.service";
import { v4 as uuidv4 } from "uuid";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

// Mock repository methods
const mockCreateNotification = jest.fn();

// Mock the repository
jest.mock("../../../../src/repository/notification.repository", () => {
  return jest.fn().mockImplementation(() => ({
    createNotification: mockCreateNotification,
    getAllNotifications: jest.fn(),
    getNotificationsByUserId: jest.fn(),
    markAsRead: jest.fn(),
    getNotificationById: jest.fn(),
  }));
});

describe("NotificationService - Create Operations", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();
  });

  describe("createNotification", () => {
    it("should create a notification and transform null values", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "mocked-uuid",
        message: "Test message",
        userId: "user123",
        requestId: null,
        isRead: false,
        createdAt: mockDate,
      };

      mockCreateNotification.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification({
        message: "Test message",
        userId: "user123",
      });

      expect(mockCreateNotification).toHaveBeenCalledWith({
        id: "mocked-uuid",
        message: "Test message",
        userId: "user123",
      });
      expect(result.userId).toBe("user123");
      expect(result.requestId).toBeUndefined();
    });

    it("should handle non-null requestId correctly", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "mocked-uuid",
        message: "Test message",
        userId: "user123",
        requestId: "req123",
        isRead: false,
        createdAt: mockDate,
      };

      mockCreateNotification.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification({
        message: "Test message",
        userId: "user123",
        requestId: "req123",
      });

      expect(result.requestId).toBe("req123");
    });

    it("should transform null userId to undefined", async () => {
      const mockDate = new Date();
      const mockNotification = {
        id: "mocked-uuid",
        message: "Test message",
        userId: null,
        requestId: "req123",
        isRead: false,
        createdAt: mockDate,
      };

      mockCreateNotification.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification({
        message: "Test message",
        requestId: "req123",
      });

      expect(result.userId).toBeUndefined();
    });
  });

  describe("createRequestNotification", () => {
    it("should create a notification for CALIBRATION request", async () => {
      const createSpy = jest
        .spyOn(notificationService, "createNotification")
        .mockResolvedValue({
          id: "notif123",
          message: "New calibration request has been created",
          userId: "user123",
          requestId: "req123",
          isRead: false,
          createdOn: new Date(),
        });

      await notificationService.createRequestNotification(
        "req123",
        "user123",
        "CALIBRATION",
      );

      expect(createSpy).toHaveBeenCalledWith({
        userId: "user123",
        requestId: "req123",
        message: "New calibration request has been created",
      });
    });

    it("should create a notification for MAINTENANCE request", async () => {
      const createSpy = jest
        .spyOn(notificationService, "createNotification")
        .mockResolvedValue({
          id: "notif456",
          message: "New maintenance request has been created",
          userId: "user456",
          requestId: "req456",
          isRead: false,
          createdOn: new Date(),
        });

      await notificationService.createRequestNotification(
        "req456",
        "user456",
        "MAINTENANCE",
      );

      expect(createSpy).toHaveBeenCalledWith({
        userId: "user456",
        requestId: "req456",
        message: "New maintenance request has been created",
      });
    });
  });
});
