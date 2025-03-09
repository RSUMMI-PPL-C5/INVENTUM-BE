import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import UserRepository from "../repository/user.repository";

class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async getUsers(): Promise<User[]> {
    return await this.userRepository.getUsers();
  }

  public async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.getUserById(id);
  }

  private validateUserData(data: Partial<User>): boolean {
    const { fullname, role, divisiId, modifiedBy } = data;
    if (modifiedBy === undefined) return false;
    if (!fullname || fullname.length < 3) return false;
    if (role !== undefined && typeof role !== 'string') return false;
    if (divisiId !== undefined && typeof divisiId !== 'number') return false;
    return true;
  }

  public async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      return null;
    }

    if (!this.validateUserData(data)) {
      return null;
    }

    const { fullname, role, password, divisiId, waNumber, modifiedBy, email, username } = data;

    const updatedData: Partial<User> = {
      fullname,
      role,
      divisiId,
      waNumber,
      modifiedBy,
      modifiedOn: new Date(),
      email,
      username
    };

    if (password !== undefined) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    return await this.userRepository.updateUser(id, updatedData);
  }

  public async deleteUser(id: string): Promise<User | null> {
    return await this.userRepository.deleteUser(id);
  }
}

export default UserService;