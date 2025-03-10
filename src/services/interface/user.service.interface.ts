import { User } from "@prisma/client";

export interface IUserService {
  searchUser(name: string): Promise<User[]>;
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  role?: string;
  fullname?: string;
  nokar: string;
  divisiId?: number;
  waNumber?: string;
  createdBy: number;
  createdOn: Date;
  updatedBy?: number;
  updatedOn?: Date;
  deletedBy?: number;
  deletedOn?: Date;
}
