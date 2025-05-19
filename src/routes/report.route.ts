import { Router } from "express";
import ReportController from "../controllers/report.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";
import { exportDataValidation } from "../validations/report.validation";
import { generalLimiter } from "../middleware/rateLimiter";

const router = Router();
const controller = new ReportController();

// Middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum"));

// Monthly chart data route
router.get("/monthly-requests", controller.getMonthlyRequestCounts);
router.get("/request-status", controller.getRequestStatusReport);
router.get(
  "/export",
  generalLimiter,
  exportDataValidation,
  validateRequest,
  controller.exportAllData,
);

// Tabular report routes
router.get("/plans", controller.getPlanReports);
router.get("/results", controller.getResultReports);
router.get("/summary", controller.getSummaryReports);

export default router;
