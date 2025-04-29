import { IUserService } from "./interface/user.service.interface";
import { UserDTO, AddUserDTO, AddUserResponseDTO } from "../dto/user.dto";
import { UserFilterOptions } from "../interfaces/user.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import UserRepository from "../repository/user.repository";

class UserService implements IUserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async createUser(userData: AddUserDTO): Promise<AddUserResponseDTO> {
    const emailExists = await this.userRepository.getUserByEmail(
      userData.email,
    );
    if (emailExists) {
      throw new Error("Email already in use");
    }

    const usernameExists = await this.userRepository.getUserByUsername(
      userData.username,
    );
    if (usernameExists) {
      throw new Error("Username already in use");
    }

    if (userData.nokar && userData.nokar !== "") {
      const nokarExists = await this.userRepository.getUserByNokar(
        userData.nokar,
      );
      if (nokarExists) {
        throw new Error("Nokar already in use");
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { password, divisiId, ...data } = userData;
    return await this.userRepository.createUser({
      ...data,
      id: uuidv4(),
      password: hashedPassword,
      divisi: divisiId
        ? {
            connect: {
              id: divisiId,
            },
          }
        : undefined,
    });
  }

  public async getUsers(
    search?: string,
    filters?: UserFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { users, total } = await this.userRepository.getUsers(
      search,
      filters,
      pagination,
    );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: users,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? users.length,
        totalPages,
      },
    };
  }

  public async getUserById(id: string): Promise<UserDTO | null> {
    return await this.userRepository.getUserById(id);
  }

  public async updateUser(
    id: string,
    data: Partial<UserDTO>,
    modifierId: string,
  ): Promise<UserDTO | null> {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      return null;
    }

    const { fullname, role, password, divisiId, waNumber, email, nokar } = data;

    const updatedData: Partial<UserDTO> = {
      ...(fullname && { fullname }),
      ...(role && { role }),
      ...(divisiId !== undefined && { divisiId: Number(divisiId) }),
      ...(waNumber && { waNumber }),
      ...(email && { email }),
      ...(nokar && { nokar }),
      modifiedBy: modifierId,
    };

    // Hash password if provided
    if (password !== undefined) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    return await this.userRepository.updateUser(id, updatedData);
  }

  public async deleteUser(
    id: string,
    deletedBy?: string,
  ): Promise<UserDTO | null> {
    return await this.userRepository.deleteUser(id, deletedBy);
  }
}

export default UserService;
