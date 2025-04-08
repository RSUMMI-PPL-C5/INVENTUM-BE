import { SparepartsDTO } from "../../dto/sparepart.dto";

export interface ISparepartService {
  addSparepart(userData: SparepartsDTO): Promise<SparepartsDTO>;
  deleteSparepart(id: string): Promise<SparepartsDTO | null>;
}
