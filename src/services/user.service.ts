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
}

export default UserService;