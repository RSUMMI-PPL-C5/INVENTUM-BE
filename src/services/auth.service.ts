import bcrypt from 'bcrypt';
import UserRepository from '../repository/user.repository';
import { User } from '@prisma/client';

export class AuthService {
    private readonly userRepository: UserRepository;
    private readonly tokenService: any;
  
    constructor(userRepository: UserRepository, tokenService: any) {
      this.userRepository = userRepository;
      this.tokenService = tokenService;
    }
  
    async validateUser(username: string, password: string): Promise<any> {
      return null;
    }
    
    async login(loginDto: any): Promise<any> {
      const { username, password } = loginDto;
      const user = await this.validateUser(username, password);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      const token = await this.tokenService.generateToken(user);
      
      return { ...user, token };
    }
  }