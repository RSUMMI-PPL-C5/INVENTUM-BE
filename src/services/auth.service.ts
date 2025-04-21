import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../repository/user.repository";
import { IAuthService } from "./interface/auth.service.interface";
import AppError from "../utils/appError";

class AuthService implements IAuthService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.getUserByUsername(username);
    
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError("Invalid username or password", 401);
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(username: string, password: string): Promise<any> {
    
    const user = await this.validateUser(username, password);

    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      throw new AppError("JWT_SECRET_KEY is not set", 500);
    }

    const token = jwt.sign({ userId: user.id, role: user.role}, secretKey, { expiresIn: "7d" });

    return { ...user, token };
  }
}

export default AuthService;
