import { Request, Response, NextFunction } from "express";
import CalibrationHistoryService from "../services/calibration-history.service";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { CalibrationHistoryFilterOptions } from "../interfaces/calibration-history.filter.interface";
import { CreateCalibrationHistoryDTO } from "../dto/calibration-history.dto";

class CalibrationHistoryController {
  private readonly calibrationHistoryService: CalibrationHistoryService;

  constructor() {
    this.calibrationHistoryService = new CalibrationHistoryService();
  }

  public createCalibrationHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const equipmentId = req.params.equipmentId;
      const {
        actionPerformed,
        technician,
        result,
        calibrationMethod,
        calibrationDate,
        nextCalibrationDue,
      } = req.body;

      const calibrationData: CreateCalibrationHistoryDTO = {
        medicalEquipmentId: equipmentId,
        actionPerformed,
        technician,
        result,
        calibrationMethod,
        calibrationDate: new Date(calibrationDate),
        createdBy: (req.user as any).userId,
        ...(nextCalibrationDue && {
          nextCalibrationDue: new Date(nextCalibrationDue),
        }),
      };

      const data =
        await this.calibrationHistoryService.createCalibrationHistory(
          calibrationData,
        );

      res.status(201).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCalibrationHistoriesByEquipmentId = async (
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

      const filters: CalibrationHistoryFilterOptions = {
        ...req.query,
        medicalEquipmentId: equipmentId,
      } as any;

      const result =
        await this.calibrationHistoryService.getCalibrationHistories(
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

export default CalibrationHistoryController;
