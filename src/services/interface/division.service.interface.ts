import { DivisionDTO } from "../../dto/division.dto";

export interface IDivisionService {
    addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO>;
}