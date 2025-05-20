import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import authorizeRoles from "../middleware/authorizeRole";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const notificationController = new NotificationController();

router.use(verifyToken);

router.get("/my", notificationController.getMyNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.get(
  "/",
  authorizeRoles("Admin", "Fasum"),
  notificationController.getAllNotifications,
);
router.get(
  "/:id",
  authorizeRoles("Admin", "Fasum"),
  notificationController.getNotificationById,
);

export default router;
