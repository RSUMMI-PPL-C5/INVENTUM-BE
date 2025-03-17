import { AddUserDTO, AddUserResponseDTO, UserDTO } from "../../dto/user.dto";


export interface IUserService{
    
    addUser(userData: AddUserDTO): Promise<AddUserResponseDTO>;
    
}