import { User } from "@prisma/client";

export interface UserDTO extends User {
    divisionName?: string | null;
}

export interface AddUserDTO {
    email: string;
    username: string;
    password: string;
    role: string;
    fullname: string;
    nokar: string;
    divisiId: number;
    waNumber: string;
    createdBy: string;
}
  
export interface AddUserResponseDTO {
    id: string;
    email: string;
    username: string;
}