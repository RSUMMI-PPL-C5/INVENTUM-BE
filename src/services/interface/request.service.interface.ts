import {
  CreateRequestDTO,
  RequestResponseDTO,
  RequestDTO,
} from "../../dto/request.dto";
import { PaginationOptions } from "../../interfaces/pagination.interface";
import { RequestFilterOptions } from "../../interfaces/request.filter.interface";

export interface IRequestService {
  getRequestById(id: string): Promise<{ data: RequestResponseDTO }>;

  getAllRequests(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: RequestResponseDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;

  getAllRequestMaintenance(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: RequestDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;

  getAllRequestCalibration(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: RequestDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;

  createRequest(
    requestData: CreateRequestDTO,
  ): Promise<{ data: RequestResponseDTO }>;
}
