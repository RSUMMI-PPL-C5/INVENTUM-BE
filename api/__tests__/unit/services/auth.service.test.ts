import { AuthService } from "../../../services/auth.service";
import { LoginRequestDTO } from "../../../models/dto/auth.dto";
import bcrypt from "bcrypt";

describe ('AuthService', () => {
    let authService: AuthService;
    let mockUserRepository: any;
    let mockTokenService: any;

    beforeEach(() => {
        mockUserRepository = {
            findByUsername: jest.fn(),
        };
        
        mockTokenService = {
            generateToken: jest.fn(),
        };

        authService = new AuthService(mockUserRepository, mockTokenService);
    });

    describe('ValidateUser', () => {
        it('should return user object if user is found/valid (password should be encrypted)', async () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password', 10),
                role: 'user',
            };

            mockUserRepository.findByUsername.mockResolvedValue(mockUser);

            const { password, ...expectedResult } = mockUser;

            //action
            const result = await authService.validateUser('testuser', 'password');

            //and assertion
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
            expect(result).toEqual(expectedResult);
            expect(result.password).toBeUndefined();
        });

        it('should return null if user is not found', async () => {
            mockUserRepository.findByUsername.mockResolvedValue(null);

            const result = await authService.validateUser('notestuser', 'password');

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('notestuser');
            expect(result).toBeNull();
        });

        it('should return null if password is incorrect', async () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'user'
            };

            mockUserRepository.findByUsername.mockResolvedValue(mockUser);

            const result = await authService.validateUser('testuser', 'password');

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return login response with token if credentials are valid', async () => {
          // Arrange
          const loginDto: LoginRequestDTO = {
            username: 'testuser',
            password: 'password123' 
          };
          
          const mockUser = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          };
          
          const mockToken = 'jwt-token-here';
          
          jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
          mockTokenService.generateToken.mockReturnValue(mockToken);
          
          // Act
          const result = await authService.login(loginDto);
          
          // Assert
          expect(authService.validateUser).toHaveBeenCalledWith('testuser', 'password123');
          expect(mockTokenService.generateToken).toHaveBeenCalledWith(mockUser);
          
          expect(result).toEqual({
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            token: mockToken,
            role: 'user'
          });
        });
    
        it('should throw an error if credentials are invalid', async () => {
          // Arrange
          const loginDto: LoginRequestDTO = {
            username: 'testuser',
            password: 'wrongpassword'
          };
          
          jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
          
          // Act & Assert
          await expect(authService.login(loginDto)).rejects.toThrow('Invalid username or password');
        });
      });
    
      // Additional test to ensure constructor is covered
      describe('constructor', () => {
        it('should set userRepository and tokenService properties', () => {
          const authServiceAny = authService as any;
          
          // Assert
          expect(authServiceAny.userRepository).toBe(mockUserRepository);
          expect(authServiceAny.tokenService).toBe(mockTokenService);
        });
      });
});
