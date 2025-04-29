import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { getJakartaTime } from "../utils/date.utils";

class RequestRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async createRequest(requestData: any): Promise<any> {
    const jakartaTime = getJakartaTime();
    return await this.prisma.request.create({
      data: {
        ...requestData,
        createdOn: jakartaTime,
        modifiedOn: jakartaTime,
      },
    });
  }
}

export default RequestRepository;
