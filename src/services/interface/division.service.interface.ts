import { DivisionDTO, DivisionWithChildrenDTO } from "../../dto/division.dto";

export interface IDivisionService {
  getAllDivisions(): Promise<DivisionDTO[]>;
  getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]>;
  getDivisionsWithUserCount(): Promise<Array<DivisionDTO & { userCount: number }>>;
  getDivisionById(id: number): Promise<DivisionDTO | null>;
}