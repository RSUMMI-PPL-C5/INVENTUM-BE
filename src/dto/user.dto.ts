import { User } from "@prisma/client";

export interface UserDTO extends User {
  divisionName?: string | null;
}

export interface AddUserDTO {
  email: string;
  username: string;
  password: string;
  fullname: string;
  waNumber: string;
  role: string;
  nokar: string;
  divisiId?: number;
  createdBy: string;
  createdOn: string;
}

export interface AddUserResponseDTO {
  id: string;
  email: string;
  username: string;
}
