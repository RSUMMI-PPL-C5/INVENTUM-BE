import { PrismaClient } from '@prisma/client';
import { UserDTO } from '../dto/user.dto';
import { IUserRepository } from './interface/user.repository.interface';
import { User } from '@prisma/client';

const prisma = new PrismaClient();

class UserRepository implements IUserRepository{
  public async getUsers(): Promise<UserDTO[]> {
    return await prisma.user.findMany();
  }

  public async findByUsername(username: string): Promise<User | null> {
    //TODO
      return null;
  }

}

export default UserRepository;