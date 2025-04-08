import {
  SparepartDTO,
  SparepartsDTO,
  FilterSparepartDTO,
} from "../../dto/sparepart.dto";

export interface ISparepartService {
  getSpareparts(): Promise<SparepartDTO[]>;
  getSparepartById(id: string): Promise<SparepartDTO | null>;
  getFilteredSpareparts(filters: FilterSparepartDTO): Promise<SparepartDTO[]>;

  addSparepart(userData: SparepartsDTO): Promise<SparepartsDTO>;
  updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null>;
  deleteSparepart(id: string): Promise<SparepartsDTO | null>;
}