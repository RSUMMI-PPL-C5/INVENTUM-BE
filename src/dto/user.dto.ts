export interface AddUserDTO {
    email: string;
    username: string;
    password: string;
    role?: string | null;
    fullname?: string | null;
    nokar?: string;
    divisiId?: number | null;
    waNumber?: string | null;
    createdBy: number;
  }
  
  export interface AddUserResponseDTO {
    id: string;
    email: string;
    username: string;
  }