import { Request, Response } from 'express';
import UserController from '../src/controllers/user.controller';
import UserService from '../src/services/user.service';
import UserRepository from '../src/repository/user.repository';
import { PrismaClient } from '@prisma/client';
import { AddUserDTO } from '../src/dto/user.dto';

// Mock express-validator
jest.mock('express-validator', () => {
  return {
    validationResult: jest.fn(() => ({
      isEmpty: jest.fn(),
      array: jest.fn()
    })),
    body: jest.fn().mockImplementation(() => ({
      isEmail: jest.fn().mockReturnThis(),
      withMessage: jest.fn().mockReturnThis(),
      isString: jest.fn().mockReturnThis(),
      trim: jest.fn().mockReturnThis(),
      notEmpty: jest.fn().mockReturnThis(),
      isLength: jest.fn().mockReturnThis(),
      optional: jest.fn().mockReturnThis(),
      isInt: jest.fn().mockReturnThis(),
      toInt: jest.fn().mockReturnThis()
    }))
  };
});

// Import after mocking
import { validationResult } from 'express-validator';

// Mock other dependencies
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        create: jest.fn()
      }
    }))
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

// Mock Request and Response objects
const mockRequest = () => {
  const req: Partial<Request> = {
    body: {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: 'EMP123',
      divisiId: 1,
      waNumber: '1234567890',
      userId: 1
    }
  };
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  return res as Response;
};

describe('User Module Tests', () => {
  // Repository Tests
  describe('UserRepository', () => {
    let repository: UserRepository;
    let prismaClient: PrismaClient;

    beforeEach(() => {
      repository = new UserRepository();
      prismaClient = new PrismaClient();
      // Access the private prisma client with type assertion
      (repository as any).prisma = prismaClient;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('checkEmailExists returns true when email exists', async () => {
      (prismaClient.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user1' });
      
      const result = await repository.checkEmailExists('test@example.com');
      
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toBe(true);
    });

    test('checkEmailExists returns false when email does not exist', async () => {
      (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const result = await repository.checkEmailExists('test@example.com');
      
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toBe(false);
    });

    test('checkUsernameExists returns true when username exists', async () => {
      (prismaClient.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user1' });
      
      const result = await repository.checkUsernameExists('testuser');
      
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(result).toBe(true);
    });

    test('checkUsernameExists returns false when username does not exist', async () => {
      (prismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const result = await repository.checkUsernameExists('testuser');
      
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(result).toBe(false);
    });

    test('createUser creates a user with division ID', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: 'EMP123',
        divisiId: 1,
        waNumber: '1234567890',
        createdBy: 1
      };

      const expectedResult = {
        id: 'test-uuid',
        email: 'test@example.com',
        username: 'testuser'
      };

      (prismaClient.user.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.createUser(userData);

      expect(prismaClient.user.create).toHaveBeenCalled();
      
      // Verify the call arguments
      const createCallArgs = (prismaClient.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.id).toBe('test-uuid');
      expect(createCallArgs.data.divisi).toEqual({
        connect: { id: 1 }
      });
      
      expect(result).toEqual(expectedResult);
    });

    test('createUser creates a user without division ID', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: 'EMP123',
        divisiId: undefined,
        waNumber: '1234567890',
        createdBy: 1
      };

      const expectedResult = {
        id: 'test-uuid',
        email: 'test@example.com',
        username: 'testuser'
      };

      (prismaClient.user.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.createUser(userData);

      expect(prismaClient.user.create).toHaveBeenCalled();
      
      // Verify the call arguments doesn't include divisi
      const createCallArgs = (prismaClient.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.id).toBe('test-uuid');
      expect(createCallArgs.data.divisi).toBeUndefined();
      
      expect(result).toEqual(expectedResult);
    });
    
    test('createUser creates a user with null division ID', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: 'EMP123',
        divisiId: null,
        waNumber: '1234567890',
        createdBy: 1
      };

      const expectedResult = {
        id: 'test-uuid',
        email: 'test@example.com',
        username: 'testuser'
      };

      (prismaClient.user.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.createUser(userData);

      expect(prismaClient.user.create).toHaveBeenCalled();
      
      // Verify the call arguments doesn't include divisi
      const createCallArgs = (prismaClient.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.divisi).toBeUndefined();
      
      expect(result).toEqual(expectedResult);
    });
    
    // New test for nokar default value handling - Line 39 branch coverage
    test('createUser handles undefined nokar value', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        // nokar is undefined
        divisiId: 1,
        waNumber: '1234567890',
        createdBy: 1
      };

      const expectedResult = {
        id: 'test-uuid',
        email: 'test@example.com',
        username: 'testuser'
      };

      (prismaClient.user.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.createUser(userData);

      // Verify default value "" was used for nokar
      const createCallArgs = (prismaClient.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.nokar).toBe("");
      
      expect(result).toEqual(expectedResult);
    });

    // Test empty string nokar handling
    test('createUser handles empty string nokar value', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: "", // empty string
        divisiId: 1,
        waNumber: '1234567890',
        createdBy: 1
      };

      const expectedResult = {
        id: 'test-uuid',
        email: 'test@example.com',
        username: 'testuser'
      };

      (prismaClient.user.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.createUser(userData);

      // Verify empty string was passed through
      const createCallArgs = (prismaClient.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.nokar).toBe("");
      
      expect(result).toEqual(expectedResult);
    });

    test('createUser handles database error', async () => {
      const userData: AddUserDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: 'EMP123',
        divisiId: 1,
        waNumber: '1234567890',
        createdBy: 1
      };

      const dbError = new Error('Database error');
      (prismaClient.user.create as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.createUser(userData)).rejects.toThrow('Database error');
    });
  });

  // Service Tests
  describe('UserService', () => {
    let service: UserService;
    let mockRepository: Partial<UserRepository>;

    beforeEach(() => {
      // Create mock repository
      mockRepository = {
        checkEmailExists: jest.fn(),
        checkUsernameExists: jest.fn(),
        createUser: jest.fn()
      };

      service = new UserService();
      // Set mock repository using type assertion for private property
      (service as any).userRepository = mockRepository;
    });

    test('addUser successfully creates a user', async () => {
      const userData: AddUserDTO = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        role: 'user',
        fullname: 'New User',
        nokar: 'EMP456',
        divisiId: 2,
        waNumber: '9876543210',
        createdBy: 1
      };

      const expectedUser = {
        id: 'user-id',
        email: 'new@example.com',
        username: 'newuser'
      };

      (mockRepository.checkEmailExists as jest.Mock).mockResolvedValue(false);
      (mockRepository.checkUsernameExists as jest.Mock).mockResolvedValue(false);
      (mockRepository.createUser as jest.Mock).mockResolvedValue(expectedUser);

      const result = await service.addUser(userData);

      expect(mockRepository.checkEmailExists).toHaveBeenCalledWith('new@example.com');
      expect(mockRepository.checkUsernameExists).toHaveBeenCalledWith('newuser');
      expect(mockRepository.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(expectedUser);
    });

    test('addUser throws error when email exists', async () => {
      const userData: AddUserDTO = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        createdBy: 1
      };

      (mockRepository.checkEmailExists as jest.Mock).mockResolvedValue(true);

      await expect(service.addUser(userData)).rejects.toThrow('Email already in use');
      expect(mockRepository.checkEmailExists).toHaveBeenCalledWith('existing@example.com');
      expect(mockRepository.checkUsernameExists).not.toHaveBeenCalled();
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    test('addUser throws error when username exists', async () => {
      const userData: AddUserDTO = {
        email: 'new@example.com',
        username: 'existinguser',
        password: 'password123',
        createdBy: 1
      };

      (mockRepository.checkEmailExists as jest.Mock).mockResolvedValue(false);
      (mockRepository.checkUsernameExists as jest.Mock).mockResolvedValue(true);

      await expect(service.addUser(userData)).rejects.toThrow('Username already in use');
      expect(mockRepository.checkEmailExists).toHaveBeenCalledWith('new@example.com');
      expect(mockRepository.checkUsernameExists).toHaveBeenCalledWith('existinguser');
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });
  });

  // Controller Tests
  describe('UserController', () => {
    let controller: UserController;
    let mockService: Partial<UserService>;
    let req: Request;
    let res: Response;

    beforeEach(() => {
      mockService = {
        addUser: jest.fn()
      };

      controller = new UserController();
      // Set mock service using type assertion for private property
      (controller as any).userService = mockService;
      
      req = mockRequest();
      res = mockResponse();
    });

    test('addUser returns 400 when validation fails', async () => {
      // Setup validation to fail
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Email is required' }]
      });

      await controller.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Email is required' }] });
      expect(mockService.addUser).not.toHaveBeenCalled();
    });

    test('addUser returns 201 on successful user creation', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const expectedUser = {
        id: 'new-user-id',
        email: 'test@example.com',
        username: 'testuser'
      };

      (mockService.addUser as jest.Mock).mockResolvedValue(expectedUser);

      await controller.addUser(req, res);

      expect(mockService.addUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedUser);
    });

    test('addUser returns 409 when email is already in use', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      (mockService.addUser as jest.Mock).mockRejectedValue(new Error('Email already in use'));

      await controller.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already in use' });
    });

    test('addUser returns 409 when username is already in use', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      (mockService.addUser as jest.Mock).mockRejectedValue(new Error('Username already in use'));

      await controller.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username already in use' });
    });

    test('addUser returns 500 for other errors', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      (mockService.addUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    test('addUser handles non-Error objects in catch block', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      // Reject with a non-Error value
      (mockService.addUser as jest.Mock).mockRejectedValue('Some non-error value');

      await controller.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unknown error occurred' });
    });

    // New test for controller line 30 coverage - handling userId
    test('addUser uses default userId when not provided', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      // Create a request without userId
      const reqWithoutUserId = mockRequest();
      delete reqWithoutUserId.body.userId;

      await controller.addUser(reqWithoutUserId, res);

      // Check that the first argument to addUser has default userId=1
      const userData = (mockService.addUser as jest.Mock).mock.calls[0][0];
      expect(userData.createdBy).toBe(1); // Should use default value 1
    });

    // Test for handling user-provided userId
    test('addUser uses provided userId', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      // Set specific userId in request
      const reqWithSpecificUserId = mockRequest();
      reqWithSpecificUserId.body.userId = 42;

      await controller.addUser(reqWithSpecificUserId, res);

      // Check that the first argument to addUser has the specified userId
      const userData = (mockService.addUser as jest.Mock).mock.calls[0][0];
      expect(userData.createdBy).toBe(42); // Should use provided value
    });

    test('addUser properly passes divisiId as number when provided', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      req.body.divisiId = '5'; // String divisiId
      
      await controller.addUser(req, res);
      
      // Check that the first argument to addUser has divisiId converted to number
      const userData = (mockService.addUser as jest.Mock).mock.calls[0][0];
      expect(userData.divisiId).toBe(5); // Should be number, not string
    });

    test('addUser handles undefined divisiId', async () => {
      // Setup validation to pass
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      req.body.divisiId = undefined;
      
      await controller.addUser(req, res);
      
      // Check that divisiId is undefined
      const userData = (mockService.addUser as jest.Mock).mock.calls[0][0];
      expect(userData.divisiId).toBeUndefined();
    });
  });

  // Validation Tests - Simple tests to check module exists
  describe('Validation Rules', () => {
    // We just need to ensure the addUserValidation array exists and is exported
    test('addUserValidation is defined and exported', () => {
      const { addUserValidation } = require('../src/validations/adduser.validation');
      expect(addUserValidation).toBeDefined();
      expect(Array.isArray(addUserValidation)).toBe(true);
    });
  });

  // Router Tests - Simple tests to check module exists
  describe('User Router', () => {
    test('Router exports a router object', () => {
      // Mock express Router
      jest.mock('express', () => ({
        ...jest.requireActual('express'),
        Router: () => ({
          post: jest.fn()
        })
      }));
      
      const router = require('../src/routes/user.route');
      expect(router).toBeDefined();
    });
  });
});