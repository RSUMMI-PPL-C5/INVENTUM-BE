import { Request } from 'express';

export interface RequestIncludesUser extends Request {
  user?: string | object;
}

export interface IUser {
  id: number;
  nokar: string;
  fullname?: string;
  username?: string;
  password?: string;
  divisi_id?: number;
  role?: number; // 1 = User, 2 = Asesor, 3 = Admin
  wa_number?: string;
  CreatedBy: number;
  CreatedOn?: Date;
  ModifiedBy?: number;
  ModifiedOn: Date;
  DeletedBy?: number;
  DeletedOn?: Date;
}

export interface IDivisi {
  id: number;
  divisi?: string;
  parent_id?: number;
}