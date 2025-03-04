import { PrismaClient } from '@prisma/client';
import { UserDTO } from '../dto/user.dto';

const prisma = new PrismaClient();

class UserRepository {
  public async getUsers(): Promise<UserDTO[]> {
    return await prisma.user.findMany();
  }
}

export default UserRepository;