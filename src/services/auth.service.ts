import bcrypt from 'bcrypt';
export class AuthService {
    private readonly userRepository: any;
    private readonly tokenService: any;
  
    constructor(userRepository: any, tokenService: any) {
      this.userRepository = userRepository;
      this.tokenService = tokenService;
    }
  
    async validateUser(username: string, password: string): Promise<any> {
      const user = await this.userRepository.findByUsername(username);
      
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if(!isPasswordValid){
        return null;
      }

      const { password: _, ...result } = user;
      return result;
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