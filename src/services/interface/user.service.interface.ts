import { User } from "@prisma/client";

export interface IUserService{
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    validateUserData(data: Partial<User>): boolean;
    updateUser(id: string, data: Partial<User>): Promise<User | null>;
}