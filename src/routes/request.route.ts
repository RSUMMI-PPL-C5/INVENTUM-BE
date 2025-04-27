import { Router } from "express";
import RequestController from "../controllers/request.controller";
import verifyToken from "../middleware/verifyToken";
import { validateRequest } from "../middleware/validateRequest";
import { createRequestValidation } from "../validations/request.validation";

const router = Router();
const controller = new RequestController();

// Middleware
router.use(verifyToken);

router.post(
  "/maintenance",
  createRequestValidation,
  validateRequest,
  controller.createMaintenanceRequest,
);

router.post(
  "/calibration",
  createRequestValidation,
  validateRequest,
  controller.createCalibrationRequest,
);

export default router;
