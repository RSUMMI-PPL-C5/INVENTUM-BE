import { PrismaClient } from '@prisma/client';
import { AddUserDTO, AddUserResponseDTO } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; 

class UserRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  public async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    return user !== null;
  }
  
  public async checkUsernameExists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username }
    });
    return user !== null;
  }
  
  public async createUser(userData: AddUserDTO): Promise<AddUserResponseDTO> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Use the proper Prisma approach for relationships
    const createData: any = {
      id: uuidv4(), // Generate a UUID for the id field
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      fullname: userData.fullname,
      nokar: userData.nokar || "",
      waNumber: userData.waNumber,
      createdBy: userData.createdBy,
      createdOn: new Date(),
      modifiedOn: new Date()
    };
    
    // Use proper connect pattern for divisiId if provided
    if (userData.divisiId !== undefined && userData.divisiId !== null) {
      createData.divisi = {
        connect: {
          id: userData.divisiId
        }
      };
    }
    
    const newUser = await this.prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        username: true
      }
    });
    
    return newUser;
  }
}

export default UserRepository;