import { Request, Response } from "express";
import MedicalEquipmentService from "../services/medicalequipment.service";
import {
  AddMedicalEquipmentDTO,
  UpdateMedicalEquipmentDTO,
} from "../dto/medicalequipment.dto";
import { validationResult } from "express-validator";
import { MedicalEquipmentFilterOptions } from "../filters/interface/medicalequipment.filter.interface";
import { PaginationOptions } from "../filters/interface/pagination.interface";
import AppError from "../utils/appError";

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
        ...req.body,
        createdBy: (req.user as any).userId,
      };

      const newEquipment =
        await this.medicalEquipmentService.addMedicalEquipment(equipmentData);
      res.status(201).json({
        status: "success",
        data: newEquipment
      });
    } catch (error: unknown) {
      console.error("Error in addMedicalEquipment controller:", error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    }
  };

  /* Update Medical Equipment */
  public updateMedicalEquipment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      const { id } = req.params;
      const equipmentData: UpdateMedicalEquipmentDTO = {
        ...req.body,
        modifiedBy: (req.user as any).userId,
      };

      const updatedEquipment =
        await this.medicalEquipmentService.updateMedicalEquipment(
          id,
          equipmentData,
        );

      if (!updatedEquipment) {
        res.status(404).json({
          status: "error",
          message: "Medical equipment not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: updatedEquipment,
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    }
  };

  public getMedicalEquipment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          status: "error",
          errors: errors.array() 
        });
        return;
      }
  
      // Get pagination options
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      const paginationOptions: PaginationOptions = { 
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10
      };
      
      const filters: MedicalEquipmentFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;
  
      const result = await this.medicalEquipmentService.getMedicalEquipment(
        search, 
        filters, 
        paginationOptions
      );
  
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          statusCode: error.statusCode,
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          statusCode: 500,
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
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
        res.status(404).json({
          status: "error",
          message: "Medical Equipment not found"
        });
        return;
      }
      
      res.status(200).json({
        status: "success",
        data: medicalEquipment
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    }
  };

  /* Delete Medical Equipment */
  public deleteMedicalEquipment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const deletedById = (req.user as any).userId;
      
      const deleted = await this.medicalEquipmentService.deleteMedicalEquipment(
        req.params.id,
        deletedById
      );
      
      if (!deleted) {
        res.status(404).json({
          status: "error",
          message: "Medical Equipment not found"
        });
        return;
      }
      
      res.status(200).json({
        status: "success",
        message: "Medical Equipment deleted successfully"
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    }
  };
}

export default MedicalEquipmentController;