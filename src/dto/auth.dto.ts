export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  id: string;
  username: string;
  email: string;
  token: string;
  role: string | null;
}
