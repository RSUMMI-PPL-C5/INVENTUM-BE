import { Router } from "express";
import PartsHistoryController from "../controllers/parts-history.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";
import {
  createPartsHistoryValidation,
  partsHistoryFilterQueryValidation,
} from "../validations/parts-history.validation";

const router = Router();
const partsController = new PartsHistoryController();

// Global middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Routes
router
  .get(
    "/:equipmentId/parts-history",
    partsHistoryFilterQueryValidation,
    validateRequest,
    partsController.getPartsHistoriesByEquipmentId,
  )
  .post(
    "/:equipmentId/parts-history",
    createPartsHistoryValidation,
    validateRequest,
    partsController.createPartsHistory,
  );

export default router;
