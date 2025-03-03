export class AuthService {
    private userRepository: any;
    private tokenService: any;
  
    constructor(userRepository: any, tokenService: any) {
      this.userRepository = userRepository;
      this.tokenService = tokenService;
    }
  
    async validateUser(username: string, password: string): Promise<any> {
      // TODO
      return null;
    }
    
    async login(loginDto: any): Promise<any> {
      // TODO
      return null;
    }
  }