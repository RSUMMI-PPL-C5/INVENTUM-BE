import prisma from "../configs/db.config";
import { User } from "@prisma/client";

class UserRepository {
  public async findUsersByName(nameQuery: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        fullname: {
          contains: nameQuery,
        },
      },
    });
  }
}

export default UserRepository;
