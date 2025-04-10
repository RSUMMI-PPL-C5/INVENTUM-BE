import { Prisma } from "@prisma/client";
import { IUserService } from "./interface/user.service.interface";
import { UserDTO, AddUserDTO, AddUserResponseDTO } from "../dto/user.dto";
import { filterHandlers } from "../filters/user.filter";
import { UserFilterOptions } from "../filters/interface/user.filter.interface";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import UserRepository from "../repository/user.repository";

class UserService implements IUserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async getUsers(): Promise<UserDTO[]> {
    return await this.userRepository.getUsers();
  }

  public async getFilteredUsers(filters: UserFilterOptions): Promise<UserDTO[]> {
    const whereClause: Prisma.UserWhereInput = {};
    filterHandlers.forEach((handler) => handler(filters, whereClause));
    return await this.userRepository.getFilteredUsers(whereClause);
  }

  public async addUser(userData: AddUserDTO): Promise<AddUserResponseDTO> {
    const emailExists = await this.userRepository.getUserByEmail(userData.email);
    if (emailExists) {
      throw new Error("Email already in use");
    }
    
    const usernameExists = await this.userRepository.findByUsername(userData.username);
    if (usernameExists) {
      throw new Error("Username already in use");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createData: any = {
      id: uuidv4(),
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      fullname: userData.fullname,
      nokar: userData.nokar,
      waNumber: userData.waNumber,
      createdBy: userData.createdBy,
      createdOn: new Date(),
      modifiedOn: new Date(),
    };
    
    if (userData.divisiId !== undefined && userData.divisiId !== null) {
      createData.divisi = {
        connect: {
          id: userData.divisiId,
        },
      };
    }
    
    return await this.userRepository.createUser(createData);
  }

  public async searchUser(name: string): Promise<UserDTO[]> {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Name query is required");
    }
    return this.userRepository.findUsersByName(name.trim());
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