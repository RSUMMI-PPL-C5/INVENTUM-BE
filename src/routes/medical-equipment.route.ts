import { Router } from "express";
import MedicalEquipmentController from "../controllers/medical-equipment.controller";
import verifyToken from "../middleware/verifyToken";
import {
  addMedicalEquipmentValidation,
  updateMedicalEquipmentValidation,
  medicalEquipmentFilterQueryValidation,
} from "../validations/medical-equipment.validation";
import { validateRequest } from "../middleware/validateRequest";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const controller = new MedicalEquipmentController();

// Global middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Routes
router
  .get(
    "/",
    medicalEquipmentFilterQueryValidation,
    validateRequest,
    controller.getMedicalEquipment,
  )
  .get("/:id", controller.getMedicalEquipmentById)
  .post(
    "/",
    addMedicalEquipmentValidation,
    validateRequest,
    controller.addMedicalEquipment,
  )
  .put(
    "/:id",
    updateMedicalEquipmentValidation,
    validateRequest,
    controller.updateMedicalEquipment,
  )
  .delete("/:id", controller.deleteMedicalEquipment);

export default router;
