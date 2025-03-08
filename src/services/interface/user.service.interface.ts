import { User } from "@prisma/client";

export interface IUserService{
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User>;
}