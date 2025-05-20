import { Request, Response, NextFunction } from "express";
import NotificationService from "../services/notification.service";

class NotificationController {
  private readonly notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  public getAllNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const notifications =
        await this.notificationService.getAllNotifications();

      res.status(200).json({
        success: true,
        message: "All notifications retrieved successfully",
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req.user as any).userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const notifications =
        await this.notificationService.getNotificationsByUserId(userId);

      res.status(200).json({
        success: true,
        message: "User notifications retrieved successfully",
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  public getNotificationById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
        return;
      }

      const notification =
        await this.notificationService.getNotificationById(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          message: "Notification not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Notification retrieved successfully",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
        return;
      }

      const notification = await this.notificationService.markAsRead(id);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationController;
