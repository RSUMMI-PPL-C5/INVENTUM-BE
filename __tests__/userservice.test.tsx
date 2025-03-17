import UserService from '../src/services/user.service';
import UserRepository from '../src/repository/user.repository';
import { AddUserDTO, UserDTO } from '../src/dto/user.dto';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';

// Mock dependencies
jest.mock('../src/repository/user.repository');
jest.mock('bcrypt');
jest.mock('uuid');

describe('UserService', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let userService: UserService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(mockUserRepository);
    
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (uuidv4 as jest.Mock).mockReturnValue('mocked-uuid');
  });

  describe('getUsers', () => {
    it('should return all users from repository', async () => {
      const mockUsers: UserDTO[] = [
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
          createdBy: 1,  // Changed from 'admin' to number
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
          createdBy: 1,  // Changed from 'admin' to number
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null
        }
      ];
      
      mockUserRepository.getUsers.mockResolvedValue(mockUsers);
      
      const result = await userService.getUsers();
      
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.getUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('addUser', () => {
    it('should throw error when email already exists', async () => {
      const userData: AddUserDTO = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password',
        role: 'USER',
        fullname: 'New User',
        waNumber: '1234567890',
        createdBy: 1  // Changed from 'admin' to number
      };
      
      const existingUser: UserDTO = {
        id: 'existing-id',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'Existing User',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,  // Changed from 'admin' to number
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      mockUserRepository.getUserByEmail.mockResolvedValue(existingUser);
      
      await expect(userService.addUser(userData)).rejects.toThrow('Email already in use');
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw error when username already exists', async () => {
      const userData: AddUserDTO = {
        email: 'new@example.com',
        username: 'existinguser',
        password: 'password',
        role: 'USER',
        fullname: 'New User',
        waNumber: '1234567890',
        createdBy: 1  // Changed from 'admin' to number
      };
      
      const existingUser: UserDTO = {
        id: 'existing-id',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'Existing User',
        nokar: '12345',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,  // Changed from 'admin' to number
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(existingUser);
      
      await expect(userService.addUser(userData)).rejects.toThrow('Username already in use');
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('existinguser');
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should create user without divisiId successfully', async () => {
      const userData: AddUserDTO = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password',
        role: 'USER',
        fullname: 'New User',
        waNumber: '1234567890',
        createdBy: 1  // Changed from 'admin' to number
      };
      
      const expectedCreateData = {
        id: 'mocked-uuid',
        email: 'new@example.com',
        username: 'newuser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'New User',
        nokar: "",
        waNumber: '1234567890',
        createdBy: 1,  // Changed from 'admin' to number
        createdOn: expect.any(Date),
        modifiedOn: expect.any(Date)
      };
      
      const createdUser = {
        id: 'mocked-uuid',
        email: 'new@example.com',
        username: 'newuser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'New User',
        nokar: "",
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,  // Changed from 'admin' to number
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(createdUser);
      
      const result = await userService.addUser(userData);
      
      expect(result).toEqual(expect.objectContaining({ id: 'mocked-uuid' }));
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(expect.objectContaining(expectedCreateData));
    });

    it('should create user with divisiId successfully', async () => {
      const userData: AddUserDTO = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password',
        role: 'USER',
        fullname: 'New User',
        waNumber: '1234567890',
        divisiId: 123,  // Changed to a number to match the type
        createdBy: 1  // Changed from 'admin' to number
      };
      
      const createdUser = {
        id: 'mocked-uuid',
        email: 'new@example.com',
        username: 'newuser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'New User',
        nokar: "",
        divisiId: 123,  // Changed to a number to match the type
        waNumber: '1234567890',
        createdBy: 1,  // Changed from 'admin' to number
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(createdUser);
      
      const result = await userService.addUser(userData);
      
      expect(result).toEqual(expect.objectContaining({ id: 'mocked-uuid' }));
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          divisi: {
            connect: {
              id: 123  // Changed to match the number type
            }
          }
        })
      );
    });
    
    it('should create user with nokar when provided', async () => {
      const userData: AddUserDTO = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password',
        role: 'USER',
        fullname: 'New User',
        waNumber: '1234567890',
        nokar: '123456',
        createdBy: 1  // Changed from 'admin' to number
      };
      
      const createdUser = {
        id: 'mocked-uuid',
        email: 'new@example.com',
        username: 'newuser',
        password: 'hashed_password',
        role: 'USER',
        fullname: 'New User',
        nokar: '123456',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1,  // Changed from 'admin' to number
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };
      
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(createdUser);
      
      const result = await userService.addUser(userData);
      
      expect(result).toEqual(expect.objectContaining({ id: 'mocked-uuid', nokar: '123456' }));
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          nokar: '123456'
        })
      );
    });
  });

  describe('findUsersByName', () => {
    it('should return users matching the name query', async () => {
      const nameQuery = 'john';
      const mockUsers: User[] = [
        { 
          id: '1', 
          username: 'johndoe', 
          fullname: 'John Doe',
          email: 'john@example.com',
          password: 'hashed_password',
          role: 'USER',
          nokar: '12345',
          divisiId: null,
          waNumber: '1234567890',
          createdBy: 1,  // Changed from 'admin' to number
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null
        },
        { 
          id: '2', 
          username: 'johnny', 
          fullname: 'Johnny Smith',
          email: 'johnny@example.com',
          password: 'hashed_password',
          role: 'USER',
          nokar: '67890',
          divisiId: null,
          waNumber: '0987654321',
          createdBy: 1,  // Changed from 'admin' to number
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null
        }
      ];
      
      mockUserRepository.findUsersByName.mockResolvedValue(mockUsers);
      
      const result = await userService.findUsersByName(nameQuery);
      
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findUsersByName).toHaveBeenCalledWith(nameQuery);
    });
    
    it('should return empty array when no users match the name query', async () => {
      const nameQuery = 'nonexistent';
      mockUserRepository.findUsersByName.mockResolvedValue([]);
      
      const result = await userService.findUsersByName(nameQuery);
      
      expect(result).toEqual([]);
      expect(mockUserRepository.findUsersByName).toHaveBeenCalledWith(nameQuery);
    });
  });
});