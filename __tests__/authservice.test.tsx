import bcrypt from 'bcrypt';
import { AuthService } from '../src/services/auth.service';

// src/services/auth.service.test.ts

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;
  let mockTokenService: any;

  beforeEach(() => {
    // Reset mocks
    mockUserRepository = {
      findByUsername: jest.fn(),
    };

    mockTokenService = {
      generateToken: jest.fn(),
    };

    authService = new AuthService(mockUserRepository, mockTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValueOnce(null);
      
      const result = await authService.validateUser('username', 'password');
      
      expect(result).toBeNull();
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('username');
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        username: 'username',
        password: 'hashedPassword',
      };
      mockUserRepository.findByUsername.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await authService.validateUser('username', 'password');
      
      expect(result).toBeNull();
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('username');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return user without password if validation succeeds', async () => {
      const mockUser = {
        id: 1,
        username: 'username',
        password: 'hashedPassword',
        email: 'user@example.com',
      };
      mockUserRepository.findByUsername.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      
      const result = await authService.validateUser('username', 'password');
      
      expect(result).toEqual({
        id: 1,
        username: 'username',
        email: 'user@example.com',
      });
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('username');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      const loginDto = {
        username: 'username',
        password: 'password',
      };
      mockUserRepository.findByUsername.mockResolvedValueOnce(null);
      
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid username or password');
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('username');
    });

    it('should throw error if password is invalid', async () => {
      const loginDto = {
        username: 'username',
        password: 'password',
      };
      mockUserRepository.findByUsername.mockResolvedValueOnce({
        username: 'username',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid username or password');
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('username');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return user with token if login succeeds', async () => {
      const loginDto = {
        username: 'username',
        password: 'password',
      };
      const mockUser = {
        id: 1,
        username: 'username',
        password: 'hashedPassword',
        email: 'user@example.com',
      };
      mockUserRepository.findByUsername.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockTokenService.generateToken.mockResolvedValueOnce('jwt-token');
      
      const result = await authService.login(loginDto);
      
      expect(result).toEqual({
        id: 1,
        username: 'username',
        email: 'user@example.com',
        token: 'jwt-token',
      });
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('username');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        id: 1,
        username: 'username',
        email: 'user@example.com',
      });
    });
  });
});