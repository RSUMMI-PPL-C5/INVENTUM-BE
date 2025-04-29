import { Router } from "express";
import RequestController from "../controllers/request.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const controller = new RequestController();

// Middleware
router.use(verifyToken);

// Get all requests
router.get("/all", controller.getAllRequests);

// Get request by ID
router.get("/:id", controller.getRequestById);

// Get all maintenance requests
router.get("/maintenance", controller.getAllRequestMaintenance);

// Get all calibration requests
router.get("/calibration", controller.getAllRequestCalibration);
export default router;
