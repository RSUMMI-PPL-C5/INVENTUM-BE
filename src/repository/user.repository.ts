import { PrismaClient } from "@prisma/client";
import { UserDTO } from "../dto/user.dto";
import { User } from "@prisma/client";

class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  public async getUsers(): Promise<UserDTO[]> {
    return await this.prisma.user.findMany();
  }

  public async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }
}

export default UserRepository;
