import {
  CreatePartsHistoryDTO,
  PartsHistoryDetailDTO,
  PartsHistoryDTO,
} from "../../dto/parts-history.dto";
import { PaginationOptions } from "../../interfaces/pagination.interface";
import { PartsHistoryFilterOptions } from "../../interfaces/parts-history.filter.interface";

export interface IPartsHistoryService {
  createPartsHistory(
    maintenanceData: CreatePartsHistoryDTO,
  ): Promise<PartsHistoryDTO>;
  getPartsHistories(
    search?: string,
    filters?: PartsHistoryFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: PartsHistoryDetailDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
}
