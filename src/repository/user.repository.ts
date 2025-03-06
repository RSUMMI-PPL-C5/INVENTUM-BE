import { Prisma, PrismaClient } from "@prisma/client";
import { UserDTO } from "../dto/user.dto";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

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
