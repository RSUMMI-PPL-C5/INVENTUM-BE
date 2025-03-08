import { IUserService } from "./interface/user.service.interface";
import { UserDTO } from "../dto/user.dto";

import UserRepository from "../repository/user.repository";

class UserService implements IUserService {

  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async getUsers(): Promise<UserDTO[]> {
    return await this.userRepository.getUsers();
  }

  public async getUserById(id: string): Promise<UserDTO> {

    const user = await this.userRepository.getUserById(id);

    if (user === null) {
      throw new Error(`User with id ${id} not found`);
    }

    return await user;
  }
}

export default UserService;