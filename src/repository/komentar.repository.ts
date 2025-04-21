import { PrismaClient, Komentar } from "@prisma/client";
import { KomentarDTO } from "../dto/komentar.dto";

class KomentarRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Add a new comment to the database
   * @param data Comment data to be stored
   * @returns The created comment
   */
  public async addKomentar(data: KomentarDTO): Promise<Komentar> {
    return this.prisma.komentar.create({
      data: {
        text: data.text,
        userId: data.userId,
        createdAt: new Date(),
        
      }
    });
  }

  /**
   * Get all comments
   */
  
}

export default KomentarRepository;