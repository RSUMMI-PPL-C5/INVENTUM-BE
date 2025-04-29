import { SparepartDTO, SparepartsDTO } from "../../dto/sparepart.dto";
import { PaginationOptions } from "../../interfaces/pagination.interface";
import { SparepartFilterOptions } from "../../interfaces/spareparts.filter.interface";

export interface ISparepartService {
  getSpareparts(
    search?: string,
    filters?: SparepartFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: SparepartDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  getSparepartById(id: string): Promise<SparepartDTO | null>;
  addSparepart(userData: SparepartsDTO): Promise<SparepartsDTO>;
  updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null>;
  deleteSparepart(id: string): Promise<SparepartsDTO | null>;
}
