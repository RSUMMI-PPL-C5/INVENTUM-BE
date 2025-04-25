import { Request, Response } from "express";
import SparepartService from "../services/sparepart.service";
import { SparepartDTO } from "../dto/sparepart.dto";
import { SparepartFilterOptions } from "../filters/interface/spareparts.filter.interface";
import { PaginationOptions } from "../filters/interface/pagination.interface";
import AppError from "../utils/appError";

class SparepartController {
  private readonly sparepartService: SparepartService;

  constructor() {
    this.sparepartService = new SparepartService();
  }

  public addSparepart = async (req: Request, res: Response): Promise<void> => {
    try {
      const sparepartData: SparepartDTO = {
        ...req.body,
        createdBy: (req.user as any).userId,
      };

      const newSparepart =
        await this.sparepartService.addSparepart(sparepartData);

      res.status(201).json({
        status: "success",
        data: newSparepart,
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
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }
  };

  public getSpareparts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: SparepartFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;

      const result = await this.sparepartService.getSpareparts(
        search,
        filters,
        paginationOptions,
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
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }
  };

  public getSparepartById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const sparepart = await this.sparepartService.getSparepartById(
        req.params.id,
      );

      if (!sparepart) {
        res.status(404).json({
          status: "error",
          message: "Sparepart not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: sparepart,
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
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }
  };

  public updateSparepart = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const sparepartData = {
        ...req.body,
        modifiedBy: (req.user as any).userId,
      };

      const updatedSparepart = await this.sparepartService.updateSparepart(
        id,
        sparepartData,
      );

      if (!updatedSparepart) {
        res.status(404).json({
          status: "error",
          message: "Sparepart not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: updatedSparepart,
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
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }
  };

  public deleteSparepart = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const deletedById = (req.user as any).userId;

      const deleted = await this.sparepartService.deleteSparepart(
        req.params.id,
        deletedById,
      );

      if (!deleted) {
        res.status(404).json({
          status: "error",
          message: "Sparepart not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Sparepart deleted successfully",
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
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }
  };
}

export default SparepartController;
