import { User } from "@prisma/client";

export interface IUserService {
  searchUser(name: string): Promise<User[]>;
}
