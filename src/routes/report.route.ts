import { Router } from "express";
import ReportController from "../controllers/report.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";
import { exportDataValidation } from "../validations/report.validation";

const router = Router();
const controller = new ReportController();

// Middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum"));

// Routes
router.get("/monthly-requests", controller.getMonthlyRequestCounts);
router.get("/request-status", controller.getRequestStatusReport);
router.get(
  "/export",
  exportDataValidation,
  validateRequest,
  controller.exportAllData,
);

export default router;
