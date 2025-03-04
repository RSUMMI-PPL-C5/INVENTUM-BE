import { UserDTO } from "../../dto/user.dto";

export interface IUserService{
    getUsers(): Promise<UserDTO[]>;
}