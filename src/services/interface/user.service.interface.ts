import { User } from "@prisma/client";
import { UserFilterOptions } from "../filters/interface/user.filter.interface";

export interface IUserService {
  getUsers(): Promise<User[]>;
  getFilteredUsers(filters: UserFilterOptions): Promise<User[]>;
}
