import { Request, Response, NextFunction } from "express";
import MedicalEquipmentService from "../services/medical-equipment.service";
import {
  AddMedicalEquipmentDTO,
  UpdateMedicalEquipmentDTO,
} from "../dto/medical-equipment.dto";
import { MedicalEquipmentFilterOptions } from "../interfaces/medical-equipment.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";

class MedicalEquipmentController {
  private readonly medicalEquipmentService: MedicalEquipmentService;

  constructor() {
    this.medicalEquipmentService = new MedicalEquipmentService();
  }

  public addMedicalEquipment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipmentData: AddMedicalEquipmentDTO = {
        ...req.body,
        createdBy: (req.user as any).userId,
      };

      const newEquipment =
        await this.medicalEquipmentService.addMedicalEquipment(equipmentData);
      res.status(201).json({
        status: "success",
        data: newEquipment,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateMedicalEquipment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };

  public getMedicalEquipment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: MedicalEquipmentFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;

      const result = await this.medicalEquipmentService.getMedicalEquipment(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getMedicalEquipmentById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const medicalEquipment =
        await this.medicalEquipmentService.getMedicalEquipmentById(
          req.params.id,
        );

      if (!medicalEquipment) {
        res.status(404).json({
          status: "error",
          message: "Medical Equipment not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: medicalEquipment,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteMedicalEquipment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const deletedById = (req.user as any).userId;

      const deleted = await this.medicalEquipmentService.deleteMedicalEquipment(
        req.params.id,
        deletedById,
      );

      if (!deleted) {
        res.status(404).json({
          status: "error",
          message: "Medical Equipment not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Medical Equipment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default MedicalEquipmentController;
