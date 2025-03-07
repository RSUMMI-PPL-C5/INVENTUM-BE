import { Prisma } from "@prisma/client";
import { IUserService } from "./interface/user.service.interface";
import { UserDTO } from "../dto/user.dto";

import UserRepository from "../repository/user.repository";

export interface FilterOptions {
  role?: string[];
  divisiId?: number[];
  createdOnStart?: Date;
  createdOnEnd?: Date;
  modifiedOnStart?: Date;
  modifiedOnEnd?: Date;
}

class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async getUsers(): Promise<UserDTO[]> {
    return await this.userRepository.getUsers();
  }

  public async getFilteredUsers(filters: FilterOptions): Promise<UserDTO[]> {
    const whereClause: Prisma.UserWhereInput = {};

    if (filters.role) whereClause.role = { in: filters.role };
    if (filters.divisiId)
      whereClause.divisiId = { in: filters.divisiId.map(Number) };
    if (filters.createdOnStart || filters.createdOnEnd) {
      whereClause.createdOn = {
        ...(filters.createdOnStart && {
          gte: new Date(filters.createdOnStart),
        }),
        ...(filters.createdOnEnd && { lte: new Date(filters.createdOnEnd) }),
      };
    }
    if (filters.modifiedOnStart || filters.modifiedOnEnd) {
      whereClause.modifiedOn = {
        ...(filters.modifiedOnStart && {
          gte: new Date(filters.modifiedOnStart),
        }),
        ...(filters.modifiedOnEnd && { lte: new Date(filters.modifiedOnEnd) }),
      };
    }
    return await this.userRepository.getFilteredUsers(whereClause);
  }
}

export default UserService;
