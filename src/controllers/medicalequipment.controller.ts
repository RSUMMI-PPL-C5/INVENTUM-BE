import { Request, Response } from "express";
import MedicalEquipmentService from "../services/medicalequipment.service";
import {
  AddMedicalEquipmentDTO,
  UpdateMedicalEquipmentDTO,
} from "../dto/medicalequipment.dto";
import { validationResult } from "express-validator";
import { hasFilters } from "../filters/medicalequipment.filter";
import { MedicalEquipmentFilterOptions } from "../filters/interface/medicalequipment.filter.interface";

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
        createdBy: req.body.userId || 1,
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

  /* Update Medical Equipment */
  public updateMedicalEquipment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const equipmentData: UpdateMedicalEquipmentDTO = req.body;

      const updatedEquipment =
        await this.medicalEquipmentService.updateMedicalEquipment(
          id,
          equipmentData,
        );

      if (!updatedEquipment) {
        res.status(404).json({
          status: "error",
          message: "Medical equipment not found or update failed",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: updatedEquipment,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  };

  /* Get All / Filter / Search Medical Equipment */
  public getMedicalEquipment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: "Invalid input data" });
        return;
      }

      const { search } = req.query;

      if (typeof search === "string") {
        const result =
          await this.medicalEquipmentService.searchMedicalEquipment(search);
        res.status(200).json(result);
        return;
      }

      let medicalEquipment;
      if (hasFilters(req.query)) {
        const filters: MedicalEquipmentFilterOptions = {
          status: req.query.status as any,
          createdOnStart: req.query.createdOnStart as any,
          createdOnEnd: req.query.createdOnEnd as any,
          modifiedOnStart: req.query.modifiedOnStart as any,
          modifiedOnEnd: req.query.modifiedOnEnd as any,
          purchaseDateStart: req.query.purchaseDateStart as any,
          purchaseDateEnd: req.query.purchaseDateEnd as any,
        };

        medicalEquipment =
          await this.medicalEquipmentService.getFilteredMedicalEquipment(
            filters,
          );
      } else {
        medicalEquipment =
          await this.medicalEquipmentService.getMedicalEquipment();
      }

      res.status(200).json(medicalEquipment);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  /* Get Medical Equipment By ID */
  public getMedicalEquipmentById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const medicalEquipment =
        await this.medicalEquipmentService.getMedicalEquipmentById(
          req.params.id,
        );
      if (!medicalEquipment) {
        res.status(404).json({ message: "Medical Equipment not found" });
        return;
      }
      res.status(200).json(medicalEquipment);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public deleteMedicalEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.medicalEquipmentService.deleteMedicalEquipment(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Sparepart not found" });
        return;
      }
      res.status(200).json({ message: "Sparepart deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default MedicalEquipmentController;
