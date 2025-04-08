import { DivisionDTO, DivisionWithChildrenDTO } from "../../dto/division.dto";

export interface IDivisionService {
  addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO>;
  getAllDivisions(): Promise<DivisionDTO[]>;
  getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]>;
  getDivisionsWithUserCount(): Promise<
    Array<DivisionDTO & { userCount: number }>
  >;
  getDivisionById(id: number): Promise<DivisionDTO | null>;
  deleteDivision(id: number): Promise<boolean>;
}
