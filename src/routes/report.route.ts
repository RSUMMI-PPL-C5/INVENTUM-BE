import { Router } from "express";
import ReportController from "../controllers/report.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const controller = new ReportController();

router.use(verifyToken, authorizeRoles("Admin", "Fasum"));

router.get("/monthly-requests", controller.getMonthlyRequestCounts);

router.get("/maintenance-count", controller.getMaintenanceCount);

router.get("/plans", controller.getPlanReports);
router.get("/results", controller.getResultReports);
router.get("/summary", controller.getSummaryReports);

export default router;
