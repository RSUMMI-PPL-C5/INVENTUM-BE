import { User } from "@prisma/client";
import { FilterOptions } from "../user.service";

export interface IUserService {
  getUsers(): Promise<User[]>;
  getFilteredUsers(filters: FilterOptions): Promise<User[]>;
}
