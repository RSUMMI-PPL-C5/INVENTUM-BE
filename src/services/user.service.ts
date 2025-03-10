import { Prisma } from "@prisma/client";
import { IUserService } from "./interface/user.service.interface";
import { UserDTO } from "../dto/user.dto";
import { filterHandlers } from "./filters/user.filter";
import { UserFilterOptions } from "./filters/interface/user.filter.interface";

import UserRepository from "../repository/user.repository";

class UserService implements IUserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async getUsers(): Promise<UserDTO[]> {
    return await this.userRepository.getUsers();
  }

  public async getFilteredUsers(
    filters: UserFilterOptions,
  ): Promise<UserDTO[]> {
    const whereClause: Prisma.UserWhereInput = {};

    filterHandlers.forEach((handler) => handler(filters, whereClause));

    return await this.userRepository.getFilteredUsers(whereClause);
  }
}

export default UserService;
