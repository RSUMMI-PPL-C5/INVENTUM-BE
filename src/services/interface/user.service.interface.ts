import { PaginationOptions } from "../../interfaces/pagination.interface";
import { UserFilterOptions } from "../../interfaces/user.filter.interface";
import { AddUserDTO, AddUserResponseDTO, UserDTO } from "../../dto/user.dto";

export interface IUserService {
  createUser(userData: AddUserDTO): Promise<AddUserResponseDTO>;
  getUsers(
    search?: string,
    filters?: UserFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{
    data: UserDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  getUserById(id: string): Promise<UserDTO | null>;
  updateUser(
    id: string,
    data: Partial<UserDTO>,
    modifierId: string,
  ): Promise<UserDTO | null>;
  deleteUser(id: string, deletedBy?: string): Promise<UserDTO | null>;
}
