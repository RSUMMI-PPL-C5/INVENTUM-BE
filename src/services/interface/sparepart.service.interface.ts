import { SparepartDTO, FilterSparepartDTO } from "../../dto/sparepart.dto";

export interface ISparepartService {
  getSpareparts(): Promise<SparepartDTO[]>;
  getSparepartById(id: string): Promise<SparepartDTO | null>;
  getFilteredSpareparts(filters: FilterSparepartDTO): Promise<SparepartDTO[]>;
}