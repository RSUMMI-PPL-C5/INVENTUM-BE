import { SparepartsDTO } from "../../dto/sparepart.dto";

export interface ISparepartService {
  addSparepart(userData: SparepartsDTO): Promise<SparepartsDTO>;
  updateSparepart(
    id: string,
    data: Partial<SparepartsDTO>,
  ): Promise<SparepartsDTO | null>;
  deleteSparepart(id: string): Promise<SparepartsDTO | null>;
}
