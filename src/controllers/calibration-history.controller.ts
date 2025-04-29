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
      // Extract equipment ID from URL parameters
      const equipmentId = req.params.equipmentId;
      const {
        actionPerformed,
        technician,
        result,
        calibrationMethod,
        calibrationDate,
        nextCalibrationDue,
      } = req.body;

      // Convert date strings to Date objects
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

      // Return success response
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
      // Extract equipment ID from URL parameters
      const equipmentId = req.params.equipmentId;
      // Get search term from query string
      const search = req.query.search as string;

      // Parse pagination parameters with fallback values
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      // Build pagination options
      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      // Build filter options
      const filters: CalibrationHistoryFilterOptions = {
        medicalEquipmentId: equipmentId,
        result: req.query.result as string,
        calibrationDateStart: req.query.calibrationDateStart as unknown as Date,
        calibrationDateEnd: req.query.calibrationDateEnd as unknown as Date,
        calibrationMethod: req.query.calibrationMethod as string,
        nextCalibrationDueBefore: req.query
          .nextCalibrationDueBefore as unknown as Date,
        createdOnStart: req.query.createdOnStart as unknown as Date,
        createdOnEnd: req.query.createdOnEnd as unknown as Date,
      };

      // Fetch calibration histories
      const result =
        await this.calibrationHistoryService.getCalibrationHistories(
          search,
          filters,
          paginationOptions,
        );

      // Return success response
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default CalibrationHistoryController;
