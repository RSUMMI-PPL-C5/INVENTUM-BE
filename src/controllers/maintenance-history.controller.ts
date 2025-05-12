import { Request, Response, NextFunction } from "express";
import MaintenanceHistoryService from "../services/maintenance-history.service";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { MaintenanceHistoryFilterOptions } from "../interfaces/maintenance-history.filter.interface";
import { CreateMaintenanceHistoryDTO } from "../dto/maintenance-history.dto";

class MaintenanceHistoryController {
  private readonly maintenanceHistoryService: MaintenanceHistoryService;

  constructor() {
    this.maintenanceHistoryService = new MaintenanceHistoryService();
  }

  public createMaintenanceHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipmentId = req.params.equipmentId;

      const maintenanceData: CreateMaintenanceHistoryDTO = {
        medicalEquipmentId: equipmentId,
        ...req.body,
        createdBy: (req.user as any).userId,
      };

      const result =
        await this.maintenanceHistoryService.createMaintenanceHistory(
          maintenanceData,
        );

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMaintenanceHistoriesByEquipmentId = async (
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

      const filters: MaintenanceHistoryFilterOptions = {
        ...req.query,
        medicalEquipmentId: equipmentId,
      } as any;

      const result =
        await this.maintenanceHistoryService.getMaintenanceHistories(
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

export default MaintenanceHistoryController;
