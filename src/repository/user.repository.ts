import { AddUserDTO, AddUserResponseDTO } from '../dto/user.dto';
import { User } from "@prisma/client";  
import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { UserDTO } from "../dto/user.dto";

class UserRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async getUsers(): Promise<UserDTO[]> {
    return await this.prisma.user.findMany();
  }

  public async getUserById(id: string): Promise<UserDTO | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async getUserByEmail(email: string): Promise<UserDTO | null> {
    return await this.prisma.user.findUnique({
        where: { email }
      });
  }
  
  public async createUser(userData: any): Promise<AddUserResponseDTO> {
    
    const newUser = await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        username: true
      }
    });
    
    return newUser;
  }

  public async findUsersByName(nameQuery: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        fullname: {
          contains: nameQuery,
        },
      },
    })
  }

  public async findByUsername(username: string): Promise<UserDTO | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  public async updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO | null> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  public async deleteUser(id: string): Promise<UserDTO | null> {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}

export default UserRepository;