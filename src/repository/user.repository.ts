import { Prisma, User } from "@prisma/client";
import { UserDTO } from "../dto/user.dto";
import prisma from "../configs/db.config";

class UserRepository {
  public async getUsers(): Promise<UserDTO[]> {
    return await prisma.user.findMany();
  }

  public async getFilteredUsers(
    whereClause: Prisma.UserWhereInput,
  ): Promise<UserDTO[]> {
    return await prisma.user.findMany({ where: whereClause });
  }

  public async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username },
    });
  }
}

export default UserRepository;
