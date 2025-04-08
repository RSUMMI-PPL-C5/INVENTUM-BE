import { Router } from "express";
import MedicalEquipmentController from "../controllers/medicalequipment.controller";
import { medicalEquipmentFilterQueryValidation } from "../validations/medicalequipmentfilterquery.validation";

const router = Router();
const medicalEquipmentController = new MedicalEquipmentController();

// POST - Add Medical Equipment
router.post(
  "/",
  medicalEquipmentController.addMedicalEquipment.bind(
    medicalEquipmentController,
  ),
);

// PUT - Update Medical Equipment by ID
router.put("/:id", (req, res, next) => {
  medicalEquipmentController
    .updateMedicalEquipment(req, res)
    .catch((err) => next(err));
});

// GET - Get All Medical Equipment (with optional search/filter)
router.get(
  "/",
  medicalEquipmentFilterQueryValidation,
  medicalEquipmentController.getMedicalEquipment,
);

// GET - Get Medical Equipment by ID
router.get(
  "/:id",
  medicalEquipmentController.getMedicalEquipmentById,
);

export default router;
