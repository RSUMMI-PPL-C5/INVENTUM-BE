import { Request, Response } from "express";
import MedicalequipmentService from "../services/medicalequipment.service";
import { validationResult } from "express-validator";
import { hasFilters } from "../filters/medicalequipment.filter";
import { MedicalEquipmentFilterOptions } from "../filters/interface/medicalequipment.filter.interface";

class MedicalequipmentController {
  private readonly medicalequipmentService: MedicalequipmentService;

  constructor() {
    this.medicalequipmentService = new MedicalequipmentService();
  }

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

      // Untuk search
      if (typeof search === "string") {
        const users =
          await this.medicalequipmentService.searchMedicalEquipment(search);
        res.status(200).json(users);
        return;
      }

      // Untuk filter
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
          await this.medicalequipmentService.getFilteredMedicalEquipment(
            filters,
          );
      } else {
        medicalEquipment =
          await this.medicalequipmentService.getMedicalEquipment();
      }

      res.status(200).json(medicalEquipment);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public getMedicalEquipmentById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const medicalEquipment =
        await this.medicalequipmentService.getMedicalEquipmentById(
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
}

export default MedicalequipmentController;
