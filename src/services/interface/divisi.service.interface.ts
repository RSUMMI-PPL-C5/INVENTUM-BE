import { DivisiDTO } from "../../dto/divisi.dto";

export interface IDivisiService {
    addDivisi(data: Partial<DivisiDTO>): Promise<DivisiDTO>;
}