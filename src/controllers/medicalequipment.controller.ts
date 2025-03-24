import { Request, Response } from "express";
import MedicalEquipmentService from "../services/medicalequipment.service";
import { AddMedicalEquipmentDTO } from "../dto/medicalequipment.dto";
import { validationResult } from "express-validator";

class MedicalEquipmentController {
  private readonly medicalEquipmentService: MedicalEquipmentService;

  constructor() {
    this.medicalEquipmentService = new MedicalEquipmentService();
  }

  /* Add Medical Equipment */
  public addMedicalEquipment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      // Validasi input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const equipmentData: AddMedicalEquipmentDTO = {
        inventorisId: req.body.inventorisId,
        name: req.body.name,
        brandName: req.body.brandName,
        modelName: req.body.modelName,
        purchaseDate: req.body.purchaseDate
          ? new Date(req.body.purchaseDate)
          : undefined,
        purchasePrice: req.body.purchasePrice
          ? Number(req.body.purchasePrice)
          : undefined,
        status: req.body.status,
        vendor: req.body.vendor,
        createdBy: req.body.userId || 1, // Default user ID jika tidak ada
      };

      const newEquipment =
        await this.medicalEquipmentService.addMedicalEquipment(equipmentData);
      res.status(201).json(newEquipment);
    } catch (error: unknown) {
      console.error("Error in addMedicalEquipment controller:", error);
      res
        .status(
          error instanceof Error &&
            error.message === "Inventoris ID already in use"
            ? 409
            : 500,
        )
        .json({
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
    }
  };
}

export default MedicalEquipmentController;
