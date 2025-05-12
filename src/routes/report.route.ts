import { Router } from "express";
import ReportController from "../controllers/report.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const controller = new ReportController();

// Middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum"));

// Routes
router.get("/monthly-requests", controller.getMonthlyRequestCounts);
router.get("/request-status", controller.getRequestStatusReport);

export default router;
