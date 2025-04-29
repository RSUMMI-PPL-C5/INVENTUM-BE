import { Router } from "express";
import RequestController from "../controllers/request.controller";
import verifyToken from "../middleware/verifyToken";
import { validateRequest } from "../middleware/validateRequest";
import { createRequestValidation } from "../validations/request.validation";

const router = Router();
const controller = new RequestController();

// Middleware
router.use(verifyToken);

// Get all requests
router.get("/all", controller.getAllRequests);

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

export default router;
