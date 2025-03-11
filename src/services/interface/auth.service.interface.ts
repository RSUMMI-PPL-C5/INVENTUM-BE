import { LoginRequestDTO, LoginResponseDTO } from "../../dto/auth.dto";

export interface IAuthService{
    login(loginDto: LoginRequestDTO): Promise<LoginResponseDTO>;
    validateUser(username: string, password: string): Promise<any>;
}