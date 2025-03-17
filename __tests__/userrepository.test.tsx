import UserRepository from '../src/repository/user.repository';
import { UserDTO, AddUserResponseDTO } from '../src/dto/user.dto';
import { User } from '@prisma/client';
import prisma from '../src/configs/db.config';

// Mock Prisma entirely
jest.mock('../src/configs/db.config', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    }
  };
});

describe('UserRepository', () => {
  let userRepository: UserRepository;
  
  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });
  
  describe('getUsers', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        {
          id: '1',
          username: 'user1',
          email: 'user1@example.com',
          password: 'hashed_password',
          role: 'USER',
          fullname: 'User One',
          nokar: '12345',
          divisiId: null,
          waNumber: '1234567890',
          createdBy: 1,
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null
        },
        {
          id: '2',
          username: 'user2',
          email: 'user2@example.com',
          password: 'hashed_password',
          role: 'USER',
          fullname: 'User Two',
          nokar: '67890',
          divisiId: null,
          waNumber: '0987654321',
          createdBy: 1,
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null
        }
      ];
      
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      
      // Act
      const result = await userRepository.getUsers();
      
      // Assert
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return a user when valid ID is provided', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.getUserById('1');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
    
    it('should return null when user is not found', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await userRepository.getUserById('nonexistent');
      
      // Assert
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' }
      });
    });
  });
  
  describe('getUserByEmail', () => {
    it('should return a user when valid email is provided', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.getUserByEmail('user1@example.com');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user1@example.com' }
      });
    });
    
    it('should return null when email is not found', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await userRepository.getUserByEmail('nonexistent@example.com');
      
      // Assert
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const userData = {
        id: 'new-id',
        email: 'new@example.com',
        username: 'newuser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'New User',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        modifiedOn: new Date()
      };
      
      const expectedResponse = {
        id: 'new-id',
        email: 'new@example.com',
        username: 'newuser'
      };
      
      (prisma.user.create as jest.Mock).mockResolvedValue(expectedResponse);
      
      // Act
      const result = await userRepository.createUser(userData);
      
      // Assert
      expect(result).toEqual(expectedResponse);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
        select: {
          id: true,
          email: true,
          username: true
        }
      });
    });
  });
  
  describe('findUsersByName', () => {
    it('should return users matching the name query', async () => {
      // Arrange
      const nameQuery = 'john';
      const mockUsers = [
        {
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'hashed_password',
          role: 'USER',
          fullname: 'John Doe',
          nokar: '12345',
          divisiId: null,
          waNumber: '1234567890',
          createdBy: 1,
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null
        }
      ];
      
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      
      // Act
      const result = await userRepository.findUsersByName(nameQuery);
      
      // Assert
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          fullname: {
            contains: nameQuery
          }
        }
      });
    });
    
    it('should return empty array when no matches found', async () => {
      // Arrange
      const nameQuery = 'nonexistent';
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      
      // Act
      const result = await userRepository.findUsersByName(nameQuery);
      
      // Assert
      expect(result).toEqual([]);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });
  
  describe('findByUsername', () => {
    it('should return a user when valid username is provided', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.findByUsername('user1');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'user1' }
      });
    });
    
    it('should return null when username is not found', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await userRepository.findByUsername('nonexistent');
      
      // Assert
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' }
      });
    });
  });
  
  describe('updateUser', () => {
    it('should update and return the user', async () => {
      // Arrange
      const userId = '1';
      const updateData = {
        fullname: 'Updated Name',
        waNumber: '9999999999'
      };
      
      const updatedUser = {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'Updated Name',
        nokar: '12345',
        divisiId: null,
        waNumber: '9999999999',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: 1,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);
      
      // Act
      const result = await userRepository.updateUser(userId, updateData);
      
      // Assert
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData
      });
    });
  });
  
  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      // Arrange
      const userId = '1';
      const deletedUser = {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: 1,
        deletedOn: new Date()
      };
      
      (prisma.user.delete as jest.Mock).mockResolvedValue(deletedUser);
      
      // Act
      const result = await userRepository.deleteUser(userId);
      
      // Assert
      expect(result).toEqual(deletedUser);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId }
      });
    });
  });
});