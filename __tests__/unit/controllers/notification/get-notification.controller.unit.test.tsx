import { Request, Response, NextFunction } from "express";
import NotificationController from "../../../../src/controllers/notification.controller";
import NotificationService from "../../../../src/services/notification.service";

// Mock the NotificationService
jest.mock("../../../../src/services/notification.service");

describe("NotificationController - Get Notification Methods", () => {
  let notificationController: NotificationController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    // Setup request, response, and next function mocks
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Setup NotificationService mock
    mockNotificationService =
      new NotificationService() as jest.Mocked<NotificationService>;
    (NotificationService as jest.Mock).mockImplementation(
      () => mockNotificationService,
    );

    // Initialize controller
    notificationController = new NotificationController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllNotifications", () => {
    it("should retrieve all notifications successfully", async () => {
      const mockNotifications = [
        {
          id: "notif-1",
          userId: "user-1",
          message: "Test notification 1",
          type: "info",
          isRead: false,
        },
        {
          id: "notif-2",
          userId: "user-2",
          message: "Test notification 2",
          type: "warning",
          isRead: true,
        },
      ];

      mockNotificationService.getAllNotifications = jest
        .fn()
        .mockResolvedValue(mockNotifications);

      await notificationController.getAllNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNotificationService.getAllNotifications).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "All notifications retrieved successfully",
        data: mockNotifications,
      });
    });

    it("should call next with error if service throws an exception", async () => {
      const error = new Error("Service error");
      mockNotificationService.getAllNotifications.mockRejectedValueOnce(error);

      await notificationController.getAllNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getMyNotifications", () => {
    it("should retrieve user notifications successfully", async () => {
      const userId = "user-123";
      mockRequest.user = { userId };

      const mockNotifications = [
        {
          id: "notif-1",
          userId,
          message: "Test notification 1",
          type: "info",
          isRead: false,
        },
        {
          id: "notif-2",
          userId,
          message: "Test notification 2",
          type: "warning",
          isRead: true,
        },
      ];

      mockNotificationService.getNotificationsByUserId = jest
        .fn()
        .mockResolvedValue(mockNotifications);

      await notificationController.getMyNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(
        mockNotificationService.getNotificationsByUserId,
      ).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "User notifications retrieved successfully",
        data: mockNotifications,
      });
    });

    it("should return 400 if userId is missing", async () => {
      mockRequest.user = {}; // No userId in the user object

      await notificationController.getMyNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required",
      });
      expect(
        mockNotificationService.getNotificationsByUserId,
      ).not.toHaveBeenCalled();
    });

    it("should call next with error if service throws an exception", async () => {
      const userId = "user-123";
      mockRequest.user = { userId };

      const error = new Error("Service error");
      mockNotificationService.getNotificationsByUserId.mockRejectedValueOnce(
        error,
      );

      await notificationController.getMyNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getNotificationById", () => {
    it("should retrieve a notification by ID successfully", async () => {
      const notificationId = "notif-123";
      mockRequest.params = { id: notificationId };

      const mockNotification = {
        id: notificationId,
        userId: "user-1",
        message: "Test notification",
        type: "info",
        isRead: false,
      };

      mockNotificationService.getNotificationById = jest
        .fn()
        .mockResolvedValue(mockNotification);

      await notificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(
        notificationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification retrieved successfully",
        data: mockNotification,
      });
    });

    it("should return 400 if notification ID is missing", async () => {
      mockRequest.params = {}; // No id parameter

      await notificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Notification ID is required",
      });
      expect(
        mockNotificationService.getNotificationById,
      ).not.toHaveBeenCalled();
    });

    it("should return 404 if notification is not found", async () => {
      const notificationId = "non-existent-id";
      mockRequest.params = { id: notificationId };

      mockNotificationService.getNotificationById = jest
        .fn()
        .mockResolvedValue(null);

      await notificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(
        notificationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Notification not found",
      });
    });

    it("should call next with error if service throws an exception", async () => {
      mockRequest.params = { id: "notif-123" };

      const error = new Error("Service error");
      mockNotificationService.getNotificationById.mockRejectedValueOnce(error);

      await notificationController.getNotificationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read successfully", async () => {
      const notificationId = "notif-123";
      mockRequest.params = { id: notificationId };

      const mockUpdatedNotification = {
        id: notificationId,
        userId: "user-1",
        message: "Test notification",
        type: "info",
        isRead: true,
      };

      mockNotificationService.markAsRead = jest
        .fn()
        .mockResolvedValue(mockUpdatedNotification);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(
        notificationId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification marked as read",
        data: mockUpdatedNotification,
      });
    });

    it("should return 400 if notification ID is missing", async () => {
      mockRequest.params = {}; // No id parameter

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Notification ID is required",
      });
      expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
    });

    it("should call next with error if service throws an exception", async () => {
      mockRequest.params = { id: "notif-123" };

      const error = new Error("Service error");
      mockNotificationService.markAsRead.mockRejectedValueOnce(error);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
