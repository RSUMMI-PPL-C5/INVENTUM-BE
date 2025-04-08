import { ListDivisi } from "@prisma/client";

export interface DivisionDTO extends ListDivisi {}

export interface DivisionWithChildrenDTO extends DivisionDTO {
  children?: DivisionWithChildrenDTO[];
}
