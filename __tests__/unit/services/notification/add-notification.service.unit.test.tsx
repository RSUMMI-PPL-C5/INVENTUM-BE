import NotificationService from "../../../../src/services/notification.service";
import NotificationRepository from "../../../../src/repository/notification.repository";
import { v4 as uuidv4 } from "uuid";

// Mock dependencies
jest.mock("../../../../src/repository/notification.repository");
jest.mock("uuid");

describe("NotificationService - createNotification", () => {
  let notificationService: NotificationService;
  let mockNotificationRepository: jest.Mocked<NotificationRepository>;
  const mockUUID = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UUID generation
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);

    // Setup repository mock
    mockNotificationRepository =
      new NotificationRepository() as jest.Mocked<NotificationRepository>;

    // Initialize service with mocked repo
    notificationService = new NotificationService();
    (notificationService as any).notificationRepository =
      mockNotificationRepository;
  });

  // POSITIVE TEST CASES
  describe("Positive Tests", () => {
    it("should create a notification with all fields provided", async () => {
      // Arrange
      const notificationData = {
        userId: "user-123",
        requestId: "request-123",
        message: "Test notification",
        isRead: false,
      };

      const createdNotification = {
        id: mockUUID,
        userId: "user-123",
        requestId: "request-123",
        message: "Test notification",
        isRead: false,
        createdOn: new Date(),
      };

      mockNotificationRepository.createNotification.mockResolvedValue(
        createdNotification,
      );

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith({
        id: mockUUID,
        ...notificationData,
      });
      expect(result).toEqual(createdNotification);
    });

    it("should create a notification with only required fields", async () => {
      // Arrange
      const notificationData = {
        message: "Test notification",
      };

      const createdNotification = {
        id: mockUUID,
        message: "Test notification",
        userId: null,
        requestId: null,
        isRead: false,
        createdOn: new Date(),
      };

      mockNotificationRepository.createNotification.mockResolvedValue(
        createdNotification,
      );

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith({
        id: mockUUID,
        ...notificationData,
      });
      expect(result).toEqual({
        ...createdNotification,
        userId: undefined,
        requestId: undefined,
      });
    });
  });

  // NEGATIVE TEST CASES
  describe("Negative Tests", () => {
    it("should throw an error when repository createNotification fails", async () => {
      // Arrange
      const notificationData = {
        message: "Test notification",
      };

      const errorMessage = "Failed to create notification";
      mockNotificationRepository.createNotification.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(
        notificationService.createNotification(notificationData),
      ).rejects.toThrow(errorMessage);

      expect(
        mockNotificationRepository.createNotification,
      ).toHaveBeenCalledWith({
        id: mockUUID,
        ...notificationData,
      });
    });
  });

  // CORNER TEST CASES
  describe("Corner Cases", () => {
    it("should transform null userId to undefined in response", async () => {
      // Arrange
      const notificationData = {
        message: "Test notification",
        requestId: "request-123",
      };

      const createdNotification = {
        id: mockUUID,
        message: "Test notification",
        userId: null, // null value that should be transformed
        requestId: "request-123",
        isRead: false,
        createdOn: new Date(),
      };

      mockNotificationRepository.createNotification.mockResolvedValue(
        createdNotification,
      );

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(result.userId).toBeUndefined();
      expect(result.requestId).toBe("request-123");
    });

    it("should transform null requestId to undefined in response", async () => {
      // Arrange
      const notificationData = {
        message: "Test notification",
        userId: "user-123",
      };

      const createdNotification = {
        id: mockUUID,
        message: "Test notification",
        userId: "user-123",
        requestId: null, // null value that should be transformed
        isRead: false,
        createdOn: new Date(),
      };

      mockNotificationRepository.createNotification.mockResolvedValue(
        createdNotification,
      );

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(result.userId).toBe("user-123");
      expect(result.requestId).toBeUndefined();
    });

    it("should transform both null userId and requestId to undefined in response", async () => {
      // Arrange
      const notificationData = {
        message: "Test notification",
      };

      const createdNotification = {
        id: mockUUID,
        message: "Test notification",
        userId: null,
        requestId: null,
        isRead: false,
        createdOn: new Date(),
      };

      mockNotificationRepository.createNotification.mockResolvedValue(
        createdNotification,
      );

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(result.userId).toBeUndefined();
      expect(result.requestId).toBeUndefined();
    });
  });
});
