import { User } from "@prisma/client";

export interface IUserService{
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    searchUser(name: string): Promise<User[]>;
    updateUser(id: string, data: Partial<User>): Promise<User | null>;
    deleteUser(id: string): Promise<User | null>;
}