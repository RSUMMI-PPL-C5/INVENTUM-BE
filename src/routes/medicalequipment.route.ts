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

router.put("/:id", (req, res, next) => {
  medicalEquipmentController
    .updateMedicalEquipment(req, res)
    .catch((err) => next(err));
});

export default router;
