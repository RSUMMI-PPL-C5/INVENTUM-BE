import { LoginResponseDTO } from "../../dto/auth.dto";

export interface IAuthService {
  login(username: string, password: string): Promise<LoginResponseDTO>;
  validateUser(username: string, password: string): Promise<any>;
}
