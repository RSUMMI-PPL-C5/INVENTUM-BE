import { DivisionDTO, DivisionWithChildrenDTO } from "../../dto/division.dto";

export interface IDivisionService {
  addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO>;
  getAllDivisions(): Promise<DivisionDTO[]>;
  getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]>;
  getDivisionsWithUserCount(): Promise<
    Array<DivisionDTO & { userCount: number }>
  >;
  getDivisionById(id: number): Promise<DivisionDTO | null>;
  updateDivision(
    id: number,
    updateData: { divisi?: string; parentId?: number | null },
  ): Promise<DivisionDTO>;
  deleteDivision(id: number): Promise<boolean>;
}
