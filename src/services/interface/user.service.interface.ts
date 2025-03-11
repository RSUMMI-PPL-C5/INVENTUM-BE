import { User } from "@prisma/client";
import { UserFilterOptions } from "../../filters/interface/user.filter.interface";
import { AddUserDTO, AddUserResponseDTO, UserDTO } from "../../dto/user.dto";


export interface IUserService{
    getUsers(): Promise<UserDTO[]>;
    getUserById(id: string): Promise<UserDTO | null>;
    getFilteredUsers(filters: UserFilterOptions): Promise<User[]>;
    addUser(userData: AddUserDTO): Promise<AddUserResponseDTO>;
    searchUser(name: string): Promise<UserDTO[]>;
    updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO | null>;
    deleteUser(id: string): Promise<UserDTO | null>;
}
