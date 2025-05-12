import { PaginationOptions } from "../../interfaces/pagination.interface";
import {
  CreateMaintenanceHistoryDTO,
  MaintenanceHistoryDTO,
  MaintenanceHistoryDetailDTO,
} from "../../dto/maintenance-history.dto";
import { MaintenanceHistoryFilterOptions } from "../../interfaces/maintenance-history.filter.interface";

export interface IMaintenanceHistoryService {
  createMaintenanceHistory(
    maintenanceData: CreateMaintenanceHistoryDTO,
  ): Promise<MaintenanceHistoryDTO>;
  getMaintenanceHistories(
    search?: string,
    filters?: MaintenanceHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: MaintenanceHistoryDetailDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
}
