import { Router } from "express";
import MaintenanceHistoryController from "../controllers/maintenance-history.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";
import {
  createMaintenanceHistoryValidation,
  maintenanceHistoryFilterQueryValidation,
} from "../validations/maintenance-history.validation";

const router = Router();
const maintenanceController = new MaintenanceHistoryController();

// Global middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Routes
router
  .get(
    "/:equipmentId/maintenance-history",
    maintenanceHistoryFilterQueryValidation,
    validateRequest,
    maintenanceController.getMaintenanceHistoriesByEquipmentId,
  )
  .post(
    "/:equipmentId/maintenance-history",
    createMaintenanceHistoryValidation,
    validateRequest,
    maintenanceController.createMaintenanceHistory,
  );

export default router;
