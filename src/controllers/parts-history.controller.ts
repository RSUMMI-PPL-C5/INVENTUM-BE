import { Request, Response, NextFunction } from "express";
import PartsHistoryService from "../services/parts-history.service";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { PartsHistoryFilterOptions } from "../interfaces/parts-history.filter.interface";
import { CreatePartsHistoryDTO } from "../dto/parts-history.dto";

class PartsHistoryController {
  private readonly partsHistoryService: PartsHistoryService;

  constructor() {
    this.partsHistoryService = new PartsHistoryService();
  }

  public createPartsHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipmentId = req.params.equipmentId;

      const partsData: CreatePartsHistoryDTO = {
        medicalEquipmentId: equipmentId,
        ...req.body,
        createdBy: (req.user as any).userId,
      };

      const result =
        await this.partsHistoryService.createPartsHistory(partsData);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPartsHistoriesByEquipmentId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipmentId = req.params.equipmentId;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: PartsHistoryFilterOptions = {
        ...req.query,
        medicalEquipmentId: equipmentId,
      } as any;

      const result = await this.partsHistoryService.getPartsHistories(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default PartsHistoryController;
