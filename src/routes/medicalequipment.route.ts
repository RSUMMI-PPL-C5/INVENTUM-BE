import { Router } from "express";
import MedicalequipmentController from "../controllers/medicalequipment.controller";
import { medicalEquipmentFilterQueryValidation } from "../validations/medicalequipmentfilterquery.validation";

const router = Router();
const medicalequipmentController = new MedicalequipmentController();

router.get(
  "/",
  medicalEquipmentFilterQueryValidation,
  medicalequipmentController.getMedicalEquipment,
);
router.get("/:id", medicalequipmentController.getMedicalEquipmentById);

export default router;
