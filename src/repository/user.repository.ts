import { PrismaClient, User } from "@prisma/client";
import prisma from "../configs/db.config";

class UserRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async getUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  public async getUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  public async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  public async deleteUser(id: string): Promise<User | null> {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}

export default UserRepository;