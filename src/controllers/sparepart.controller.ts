import { Request, Response, NextFunction } from "express";
import SparepartService from "../services/sparepart.service";
import { SparepartDTO } from "../dto/sparepart.dto";
import { SparepartFilterOptions } from "../interfaces/spareparts.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";

class SparepartController {
  private readonly sparepartService: SparepartService;

  constructor() {
    this.sparepartService = new SparepartService();
  }

  public addSparepart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };

  public getSpareparts = async (
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

      const filters: SparepartFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;

      const result = await this.sparepartService.getSpareparts(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getSparepartById = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
    } catch (error) {
      next(error);
    }
  };

  public updateSparepart = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
    } catch (error) {
      next(error);
    }
  };

  public deleteSparepart = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
    } catch (error) {
      next(error);
    }
  };
}

export default SparepartController;
