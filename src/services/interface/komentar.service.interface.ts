import { Komentar } from "@prisma/client";
import { KomentarDTO } from "../../dto/komentar.dto";

export interface IKomentarService {
  /**
   * Add a new comment
   * @param komentarData Data for the new comment
   */
  addKomentar(komentarData: KomentarDTO): Promise<Komentar>;

 
}