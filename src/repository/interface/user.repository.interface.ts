import { UserDTO } from "../../dto/user.dto";
import { User } from "@prisma/client";
export interface IUserRepository {
    getUsers(): Promise<UserDTO[]>;
    findByUsername(username: string): Promise<User | null>;
}