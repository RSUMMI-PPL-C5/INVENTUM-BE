import UserRepository from "../repository/user.repository";
import { User } from "@prisma/client";

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async searchUser(name: string): Promise<User[]> {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Name query is required");
    }

    return this.userRepository.findUsersByName(name.trim());
  }
}

export default UserService;
