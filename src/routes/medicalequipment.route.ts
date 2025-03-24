import { Router } from "express";
import MedicalEquipmentController from "../controllers/medicalequipment.controller";

const router = Router();
const medicalEquipmentController = new MedicalEquipmentController();

router.post(
  "/",
  medicalEquipmentController.addMedicalEquipment.bind(
    medicalEquipmentController,
  ),
);

export default router;
