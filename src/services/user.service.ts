import { Prisma } from "@prisma/client";
import { IUserService } from "./interface/user.service.interface";
import { UserDTO, AddUserDTO, AddUserResponseDTO } from "../dto/user.dto";
import { UserFilterOptions, PaginationOptions} from "../filters/interface/user.filter.interface";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import UserRepository from "../repository/user.repository";
import AppError from "../utils/appError";

class UserService implements IUserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async createUser(userData: AddUserDTO): Promise<AddUserResponseDTO> {

    const emailExists = await this.userRepository.getUserByEmail(userData.email);
    if (emailExists) {
      throw new AppError("Email already in use", 400);
    }
    
    const usernameExists = await this.userRepository.getUserByUsername(userData.username);
    if (usernameExists) {
      throw new AppError("Username already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const {password, divisiId, ...data} = userData
    
    return await this.userRepository.createUser(
        {
            ...data,
            id: uuidv4(), 
            password: hashedPassword,
            divisi: {
                connect: {
                    id: userData.divisiId,
                }
            }, 
        }
    );
  }

  public async getUsers(
    search?: string,
    filters?: UserFilterOptions,
    pagination?: PaginationOptions
  ) {
    const { users, total } = await this.userRepository.getUsers(search, filters, pagination);
    
    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;
    
    return {
      data: users,
      meta: {
        total,
        page: pagination?.page || 1,
        limit: pagination?.limit || users.length,
        totalPages
      }
    };
  }

  public async getUserById(id: string): Promise<UserDTO | null> {
    return await this.userRepository.getUserById(id);
  }

  private validateUserData(data: Partial<UserDTO>): boolean {
    const { fullname, role, divisiId, modifiedBy } = data;
    if (modifiedBy === undefined) return false;
    if (!fullname || fullname.length < 3) return false;
    return true;
  }

  public async updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO | null> {
    const user = await this.userRepository.getUserById(id);
    
    if (!user || !this.validateUserData(data)) {
      return null;
    }

    const { fullname, role, password, divisiId, waNumber, modifiedBy, email } = data;
    const updatedData: Partial<UserDTO> = {
      fullname,
      role,
      divisiId: Number(divisiId),
      waNumber,
      modifiedBy,
      modifiedOn: new Date(),
      email,
    };

    if (password !== undefined) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    return await this.userRepository.updateUser(id, updatedData);
  }

  public async deleteUser(id: string): Promise<UserDTO | null> {
    return await this.userRepository.deleteUser(id);
  }
}

export default UserService;