import { LoginRequestDTO, LoginResponseDTO } from "../dto/auth.dto";

export interface IAuthService{
    login(loginDto: LoginRequestDTO): Promise<LoginResponseDTO>;
    ValidateUser(username: string, password: string): Promise<any>;
}