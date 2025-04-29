import { Router } from "express";
import CalibrationHistoryController from "../controllers/calibration-history.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";
import {
  createCalibrationHistoryValidation,
  calibrationHistoryFilterQueryValidation,
} from "../validations/calibration-history.validation";

const router = Router();
const calibrationController = new CalibrationHistoryController();

// Apply global middlewares - authentication and authorization
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Define routes
router
  .get(
    "/:equipmentId/calibration-history",
    calibrationHistoryFilterQueryValidation,
    validateRequest,
    calibrationController.getCalibrationHistoriesByEquipmentId,
  )
  .post(
    "/:equipmentId/calibration-history",
    createCalibrationHistoryValidation,
    validateRequest,
    calibrationController.createCalibrationHistory,
  );

export default router;
