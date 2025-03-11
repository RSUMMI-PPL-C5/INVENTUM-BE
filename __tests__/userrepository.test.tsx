import UserRepository from '../src/repository/user.repository';
import { PrismaClient } from '@prisma/client';
import { AddUserDTO } from '../src/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn()
    },
    $disconnect: jest.fn()
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password')
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid')
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockPrismaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaClient = new PrismaClient();
    userRepository = new UserRepository();
  });

  describe('constructor', () => {
    test('should initialize PrismaClient', () => {
      expect(PrismaClient).toHaveBeenCalled();
    });
  });

  describe('checkEmailExists', () => {
    test('should return true when email exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@example.com' });
      
      const result = await userRepository.checkEmailExists('test@example.com');
      
      expect(result).toBe(true);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });

    test('should return false when email does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);
      
      const result = await userRepository.checkEmailExists('nonexistent@example.com');
      
      expect(result).toBe(false);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
    });
  });

  describe('checkUsernameExists', () => {
    test('should return true when username exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce({ id: '1', username: 'existinguser' });
      
      const result = await userRepository.checkUsernameExists('existinguser');
      
      expect(result).toBe(true);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'existinguser' }
      });
    });

    test('should return false when username does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null);
      
      const result = await userRepository.checkUsernameExists('nonexistentuser');
      
      expect(result).toBe(false);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistentuser' }
      });
    });
  });

  describe('createUser', () => {
    test('should create a user with divisiId', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: '123456',
        divisiId: 1,
        waNumber: '081234567890',
        createdBy: 1
      };

      const mockCreatedUser = {
        id: 'mocked-uuid',
        email: userData.email,
        username: userData.username
      };
      
      mockPrismaClient.user.create.mockResolvedValueOnce(mockCreatedUser);
      
      const result = await userRepository.createUser(userData);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(uuidv4).toHaveBeenCalled();
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'mocked-uuid',
          email: userData.email,
          username: userData.username,
          password: 'hashed_password',
          role: userData.role,
          fullname: userData.fullname,
          nokar: userData.nokar,
          waNumber: userData.waNumber,
          createdBy: userData.createdBy,
          divisi: {
            connect: {
              id: userData.divisiId
            }
          }
        }),
        select: {
          id: true,
          email: true,
          username: true
        }
      });
      expect(result).toEqual(mockCreatedUser);
    });

    test('should create a user without divisiId', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: undefined,
        divisiId: undefined,
        waNumber: '081234567890',
        createdBy: 1
      };

      const mockCreatedUser = {
        id: 'mocked-uuid',
        email: userData.email,
        username: userData.username
      };
      
      mockPrismaClient.user.create.mockResolvedValueOnce(mockCreatedUser);
      
      const result = await userRepository.createUser(userData);
      
      // Fix: Remove the divisi property expectation from objectContaining
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'mocked-uuid',
          email: userData.email,
          username: userData.username,
          nokar: "" // Should default to empty string
          // Removed the divisi: undefined expectation
        }),
        select: {
          id: true,
          email: true,
          username: true
        }
      });
      
      // This assertion correctly checks that divisi property isn't present
      const createCall = mockPrismaClient.user.create.mock.calls[0][0];
      expect(createCall.data).not.toHaveProperty('divisi');
      
      expect(result).toEqual(mockCreatedUser);
    });
  });
});