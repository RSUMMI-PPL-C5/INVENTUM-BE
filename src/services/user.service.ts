import { AddUserDTO, AddUserResponseDTO , UserDTO} from "../dto/user.dto";
import { User } from "@prisma/client";

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; 
import UserRepository from "../repository/user.repository";
import { IUserService } from './interface/user.service.interface';

class UserService implements IUserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async getUsers(): Promise<UserDTO[]> {
    return await this.userRepository.getUsers();
  }

  public async addUser(userData: AddUserDTO): Promise<AddUserResponseDTO> {

    const emailExists = await this.userRepository.getUserByEmail(userData.email);

    if (emailExists) {
      throw new Error('Email already in use');
    }
    
    const usernameExists = await this.userRepository.findByUsername(userData.username);

    if (usernameExists) {
      throw new Error('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const createData: any = {
      id: uuidv4(),
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      fullname: userData.fullname,
      nokar: userData.nokar ?? "",
      waNumber: userData.waNumber,
      createdBy: userData.createdBy,
      createdOn: new Date(),
      modifiedOn: new Date()
    };
    
    if (userData.divisiId !== undefined && userData.divisiId !== null) {
      createData.divisi = {
        connect: {
          id: userData.divisiId
        }
      };
    }
    
    return await this.userRepository.createUser(createData);
  }

  

  public async findUsersByName(nameQuery: string): Promise<User[]> {
    return await this.userRepository.findUsersByName(nameQuery);
  }
}

export default UserService;
