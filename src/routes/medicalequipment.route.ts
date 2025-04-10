import { Router, Request, Response, NextFunction } from "express";
import MedicalEquipmentController from "../controllers/medicalequipment.controller";
import { medicalEquipmentFilterQueryValidation } from "../validations/medicalequipmentfilterquery.validation";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const medicalEquipmentController = new MedicalEquipmentController();

// POST - Add Medical Equipment
router.post(
  "/", verifyToken,
  medicalEquipmentController.addMedicalEquipment.bind(
    medicalEquipmentController,
  ),
);

// PUT - Update Medical Equipment by ID
router.put("/:id", verifyToken, (req: Request, res: Response, next: NextFunction) => {
  medicalEquipmentController
    .updateMedicalEquipment(req, res)
    .catch((err) => next(err));
});

// GET - Get All Medical Equipment (with optional search/filter)
router.get(
    "/",
    verifyToken,
    medicalEquipmentFilterQueryValidation,
    (req: Request, res: Response, next: NextFunction) => {
      medicalEquipmentController
        .getMedicalEquipment(req, res)
        .catch((err: Error) => next(err));
    },
  );
  

// GET - Get Medical Equipment by ID
router.get(
  "/:id", verifyToken,
  (req: Request, res: Response, next: NextFunction) => {
    medicalEquipmentController
      .getMedicalEquipmentById(req, res)
      .catch((err: Error) => next(err));
  },
);

// DELETE route (soft delete)
router.delete("/:id", verifyToken, (req: Request, res: Response, next: NextFunction) => {
    medicalEquipmentController
      .deleteMedicalEquipment(req, res)
      .catch((err: Error) => next(err));
  });

export default router;
