import { PaginationOptions } from "../../interfaces/pagination.interface";
import {
  CreateCalibrationHistoryDTO,
  CalibrationHistoryDTO,
  CalibrationHistoryDetailDTO,
} from "../../dto/calibration-history.dto";
import { CalibrationHistoryFilterOptions } from "../../interfaces/calibration-history.filter.interface";

export interface ICalibrationHistoryService {
  createCalibrationHistory(
    calibrationData: CreateCalibrationHistoryDTO,
  ): Promise<CalibrationHistoryDTO>;

  getCalibrationHistories(
    search?: string,
    filters?: CalibrationHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: CalibrationHistoryDetailDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
}
