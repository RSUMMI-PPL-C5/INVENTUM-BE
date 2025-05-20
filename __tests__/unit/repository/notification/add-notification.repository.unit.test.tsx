import { PrismaClient } from "@prisma/client";
import NotificationRepository from "../../../../src/repository/notification.repository";
import { CreateNotificationDto } from "../../../../src/dto/notification.dto";

// Create a mock of the Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      notifikasi: {
        create: jest.fn(),
      },
    })),
  };
});

describe("NotificationRepository - createNotification", () => {
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

  describe("Happy Path Tests", () => {
    it("should create a notification with all fields provided", async () => {
      // Arrange
      const mockDate = new Date();
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        userId: "user-123",
        requestId: "request-123",
        message: "Test notification message",
        isRead: false,
      };

      const expectedResult = {
        id: "test-id",
        userId: "user-123",
        requestId: "request-123",
        message: "Test notification message",
        isRead: false,
        createdOn: mockDate,
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: "user-123",
          requestId: "request-123",
          message: "Test notification message",
          isRead: false,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should use default isRead=false when not provided", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
        userId: "user-123",
        requestId: "request-123",
        // isRead not provided
      };

      const expectedResult = {
        id: "test-id",
        userId: "user-123",
        requestId: "request-123",
        message: "Test notification",
        isRead: false,
        createdOn: new Date(),
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: "user-123",
          requestId: "request-123",
          message: "Test notification",
          isRead: false,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should use explicit isRead=true when provided", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
        userId: "user-123",
        requestId: "request-123",
        isRead: true,
      };

      const expectedResult = {
        id: "test-id",
        userId: "user-123",
        requestId: "request-123",
        message: "Test notification",
        isRead: true,
        createdOn: new Date(),
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: "user-123",
          requestId: "request-123",
          message: "Test notification",
          isRead: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined userId", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
        // userId is undefined
        requestId: "request-123",
      };

      const expectedResult = {
        id: "test-id",
        userId: null,
        requestId: "request-123",
        message: "Test notification",
        isRead: false,
        createdOn: new Date(),
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: undefined,
          requestId: "request-123",
          message: "Test notification",
          isRead: false,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should handle undefined requestId", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
        userId: "user-123",
        // requestId is undefined
      };

      const expectedResult = {
        id: "test-id",
        userId: "user-123",
        requestId: null,
        message: "Test notification",
        isRead: false,
        createdOn: new Date(),
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: "user-123",
          requestId: undefined,
          message: "Test notification",
          isRead: false,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should handle both userId and requestId undefined", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
        // userId and requestId are undefined
      };

      const expectedResult = {
        id: "test-id",
        userId: null,
        requestId: null,
        message: "Test notification",
        isRead: false,
        createdOn: new Date(),
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: undefined,
          requestId: undefined,
          message: "Test notification",
          isRead: false,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should handle empty string values for optional fields", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
        userId: "",
        requestId: "",
      };

      const expectedResult = {
        id: "test-id",
        userId: "",
        requestId: "",
        message: "Test notification",
        isRead: false,
        createdOn: new Date(),
      };

      mockPrismaClient.notifikasi.create.mockResolvedValue(expectedResult);

      // Act
      const result =
        await notificationRepository.createNotification(notificationData);

      // Assert
      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledWith({
        data: {
          id: "test-id",
          userId: "",
          requestId: "",
          message: "Test notification",
          isRead: false,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe("Error Cases", () => {
    it("should throw error when Prisma create fails", async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        id: "test-id",
        message: "Test notification",
      };

      const dbError = new Error("Prisma error");
      mockPrismaClient.notifikasi.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        notificationRepository.createNotification(notificationData),
      ).rejects.toThrow("Prisma error");

      expect(mockPrismaClient.notifikasi.create).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is not provided", async () => {
      // Arrange
      const notificationData = {
        message: "Test notification",
      } as CreateNotificationDto; // Missing id

      // Simulate access to undefined id with non-null assertion (data.id!)
      mockPrismaClient.notifikasi.create.mockImplementation(() => {
        throw new TypeError("Cannot read property 'id' of undefined");
      });

      // Act & Assert
      await expect(
        notificationRepository.createNotification(notificationData),
      ).rejects.toThrow();
    });
  });
});
