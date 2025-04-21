import { Komentar } from "@prisma/client";

export interface KomentarDTO {
  text: string;
  userId: string;
  
}

export interface KomentarResponseDTO extends Komentar {}