import { Router } from "express";
import MedicalEquipmentController from "../controllers/medicalequipment.controller";
import verifyToken from "../middleware/verifyToken";
import {
  addMedicalEquipmentValidation,
  updateMedicalEquipmentValidation,
  medicalEquipmentFilterQueryValidation,
} from "../validations/medicalequipment.validation";
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
