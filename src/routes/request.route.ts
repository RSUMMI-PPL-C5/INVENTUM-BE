import { Router } from "express";
import RequestController from "../controllers/request.controller";
import verifyToken from "../middleware/verifyToken";
import { validateRequest } from "../middleware/validateRequest";
import { createRequestValidation } from "../validations/request.validation";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const controller = new RequestController();

// Middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Get all requests
router.get("/all", controller.getAllRequests);

// Get all maintenance requests
router.get("/maintenance", controller.getAllRequestMaintenance);

// Get all calibration requests
router.get("/calibration", controller.getAllRequestCalibration);

// Get request by ID
router.get("/:id", controller.getRequestById);

// Create maintenance request
router.post(
  "/maintenance",
  createRequestValidation,
  validateRequest,
  controller.createMaintenanceRequest,
);

// Create calibration request
router.post(
  "/calibration",
  createRequestValidation,
  validateRequest,
  controller.createCalibrationRequest,
);

// Update request status
router.put("/:id", controller.updateRequestStatus);

export default router;
