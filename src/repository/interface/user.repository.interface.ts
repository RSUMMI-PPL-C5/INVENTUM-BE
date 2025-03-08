import { UserDTO } from "../../dto/user.dto";

export interface IUserService{
    getUsers(): Promise<UserDTO[]>;
    getUserById(id: string): Promise<UserDTO>;
}