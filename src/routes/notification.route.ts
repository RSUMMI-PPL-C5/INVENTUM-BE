import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import authorizeRoles from "../middleware/authorizeRole";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const notificationController = new NotificationController();

// Middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum"));

// Get all notifications
router.get("/", notificationController.getAllNotifications);

// Get notification by ID
router.get("/:id", notificationController.getNotificationById);

export default router;
