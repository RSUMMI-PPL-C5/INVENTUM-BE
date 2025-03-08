import { UserDTO } from '../dto/user.dto';
import prisma  from '../configs/db.config';

class UserRepository {
  public async getUsers(): Promise<UserDTO[]> {
    return await prisma.user.findMany();
  }

  public async getUserById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    });
    
    return user;
  }
}

export default UserRepository;