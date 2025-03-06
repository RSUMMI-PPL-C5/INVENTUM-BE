import { IUserService } from "./interface/user.service.interface";
import { AddUserDTO, AddUserResponseDTO } from "../dto/user.dto";
import UserRepository from "../repository/user.repository";

class UserService implements IUserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async addUser(userData: AddUserDTO): Promise<AddUserResponseDTO> {
    // Check if email already exists
    const emailExists = await this.userRepository.checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error('Email already in use');
    }
    
    // Check if username already exists
    const usernameExists = await this.userRepository.checkUsernameExists(userData.username);
    if (usernameExists) {
      throw new Error('Username already in use');
    }
    
    // Create user in repository
    return await this.userRepository.createUser(userData);
  }
}

export default UserService;