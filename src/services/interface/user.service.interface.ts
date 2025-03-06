import { AddUserDTO, AddUserResponseDTO } from "../../dto/user.dto";

export interface IUserService {
  addUser(userData: AddUserDTO): Promise<AddUserResponseDTO>;
}