import { UserDTO } from '../dto/user.dto';
import prisma  from '../configs/db.config';

class UserRepository {
  public async getUsers(): Promise<UserDTO[]> {
    return await prisma.user.findMany();
  }
}

export default UserRepository;