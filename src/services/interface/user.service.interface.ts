import { AddUserDTO, AddUserResponseDTO, UserDTO } from "../../dto/user.dto";


export interface IUserService{
    getUsers(): Promise<UserDTO[]>;
    getUserById(id: string): Promise<UserDTO | null>;
    addUser(userData: AddUserDTO): Promise<AddUserResponseDTO>;
    searchUser(name: string): Promise<UserDTO[]>;
    updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO | null>;
    deleteUser(id: string): Promise<UserDTO | null>;
}