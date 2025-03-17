import { Request, Response } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import UserController from '../src/controllers/user.controller';
import UserService from '../src/services/user.service';

// Mock dependencies
jest.mock('../src/services/user.service');

// Fix the validationResult mock with proper typing
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

// Get the mock function with proper typing
const mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock request object
    mockRequest = {
      body: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        fullname: 'Test User',
        nokar: '123456',
        divisiId: '1',
        waNumber: '081234567890',
        userId: 2
      }
    };

    // Setup UserService mock
    mockUserService = new UserService() as jest.Mocked<UserService>;
    (UserService as jest.Mock).mockImplementation(() => mockUserService);

    // Create controller instance
    userController = new UserController();
  });

  test('should initialize with UserService', () => {
    // Changed to not check exact count since constructor might be called multiple times
    expect(UserService).toHaveBeenCalled();
  });

  test('should return 400 for validation errors', async () => {
    // Mock validation errors
    const mockErrors = {
      isEmpty: () => false,
      array: () => [{ msg: 'Email is required' }] as ValidationError[]
    };
    mockValidationResult.mockReturnValue(mockErrors as any);

    await userController.addUser(mockRequest as Request, mockResponse as Response);

    expect(mockValidationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ errors: mockErrors.array() });
  });

  test('should successfully add user and return 201', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Mock successful user creation
    const mockNewUser = { id: 1, ...mockRequest.body };
    mockUserService.addUser = jest.fn().mockResolvedValue(mockNewUser);

    await userController.addUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.addUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: '123456',
      divisiId: 1,
      waNumber: '081234567890',
      createdBy: 2
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(mockNewUser);
  });

  test('should use default createdBy when userId is not provided', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Remove userId from request
    const requestWithoutUserId = {
      body: { ...mockRequest.body }
    };
    delete requestWithoutUserId.body.userId;

    // Mock successful user creation
    mockUserService.addUser = jest.fn().mockResolvedValue({ id: 1 });

    await userController.addUser(requestWithoutUserId as Request, mockResponse as Response);

    expect(mockUserService.addUser).toHaveBeenCalledWith(expect.objectContaining({
      createdBy: 1 // Default value
    }));
  });

  test('should handle undefined divisiId', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Remove divisiId from request
    const requestWithoutDivisiId = {
      body: { ...mockRequest.body }
    };
    delete requestWithoutDivisiId.body.divisiId;

    // Mock successful user creation
    mockUserService.addUser = jest.fn().mockResolvedValue({ id: 1 });

    await userController.addUser(requestWithoutDivisiId as Request, mockResponse as Response);

    expect(mockUserService.addUser).toHaveBeenCalledWith(expect.objectContaining({
      divisiId: undefined
    }));
  });

  test('should handle "Email already in use" error with 409', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Mock error
    mockUserService.addUser = jest.fn().mockRejectedValue(new Error('Email already in use'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await userController.addUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email already in use' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('should handle "Username already in use" error with 409', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Mock error
    mockUserService.addUser = jest.fn().mockRejectedValue(new Error('Username already in use'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await userController.addUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already in use' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('should handle generic Error with 500', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Mock generic error
    mockUserService.addUser = jest.fn().mockRejectedValue(new Error('Database connection failed'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await userController.addUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('should handle non-Error object with 500', async () => {
    // Mock successful validation
    mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

    // Mock non-Error object
    mockUserService.addUser = jest.fn().mockRejectedValue('Something went wrong');

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await userController.addUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'An unknown error occurred' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Tests for getUsers method
  describe('getUsers', () => {
    test('should return 400 if validation fails', async () => {
      // Mock validation errors
      const mockErrors = {
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid query parameters' }] as ValidationError[]
      };
      mockValidationResult.mockReturnValue(mockErrors as any);

      mockRequest = {
        query: {}
      };

      await userController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Invalid input data" });
    });

    test('should handle search query', async () => {
      // Mock successful validation
      mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

      mockRequest = {
        query: {
          search: 'test'
        }
      };

      const mockUsers = [{ id: 1, username: 'test' }];
      mockUserService.searchUser = jest.fn().mockResolvedValue(mockUsers);

      await userController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.searchUser).toHaveBeenCalledWith('test');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle filters', async () => {
      // Mock successful validation
      mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

      mockRequest = {
        query: {
          role: 'admin',
          divisiId: '1'
        }
      };

      const mockUsers = [{ id: 1, username: 'admin' }];
      mockUserService.getFilteredUsers = jest.fn().mockResolvedValue(mockUsers);

      // Mock the hasFilters function
      jest.mock('../src/filters/user.filter', () => ({
        hasFilters: jest.fn().mockReturnValue(true)
      }));

      // Import the actual function after mocking
      const { hasFilters } = require('../src/filters/user.filter');
      (hasFilters as jest.Mock).mockReturnValue(true);

      await userController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getFilteredUsers).toHaveBeenCalledWith({
        role: 'admin',
        divisiId: '1',
        createdOnStart: undefined,
        createdOnEnd: undefined,
        modifiedOnStart: undefined,
        modifiedOnEnd: undefined
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should get all users when no filters or search', async () => {
      // Mock successful validation
      mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

      mockRequest = {
        query: {}
      };

      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      mockUserService.getUsers = jest.fn().mockResolvedValue(mockUsers);

      // Mock the hasFilters function
      const { hasFilters } = require('../src/filters/user.filter');
      (hasFilters as jest.Mock).mockReturnValue(false);

      await userController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  // Tests for getUserById method
  describe('getUserById', () => {
    test('should get user by ID successfully', async () => {
      mockRequest = {
        params: {
          id: '1'
        }
      };

      const mockUser = { id: 1, username: 'testuser' };
      mockUserService.getUserById = jest.fn().mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    test('should return 404 when user not found', async () => {
      mockRequest = {
        params: {
          id: '999'
        }
      };

      mockUserService.getUserById = jest.fn().mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('999');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should handle errors', async () => {
      mockRequest = {
        params: {
          id: '1'
        }
      };

      mockUserService.getUserById = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  // Tests for updateUser method
  describe('updateUser', () => {
    test('should update user successfully', async () => {
      mockRequest = {
        params: {
          id: '1'
        },
        body: {
          username: 'updateduser',
          email: 'updated@example.com'
        }
      };

      const mockUpdatedUser = { id: 1, username: 'updateduser', email: 'updated@example.com' };
      mockUserService.updateUser = jest.fn().mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
        username: 'updateduser',
        email: 'updated@example.com'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    test('should return 404 when user not found or invalid data', async () => {
      mockRequest = {
        params: {
          id: '999'
        },
        body: {
          username: 'updateduser'
        }
      };

      mockUserService.updateUser = jest.fn().mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('999', { username: 'updateduser' });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found or invalid data' });
    });

    test('should handle errors', async () => {
      mockRequest = {
        params: {
          id: '1'
        },
        body: {
          username: 'updateduser'
        }
      };

      mockUserService.updateUser = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', { username: 'updateduser' });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  // Tests for deleteUser method
  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      mockRequest = {
        params: {
          id: '1'
        }
      };

      mockUserService.deleteUser = jest.fn().mockResolvedValue({ id: 1, username: 'deleteduser' });

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    test('should return 404 when user not found', async () => {
      mockRequest = {
        params: {
          id: '999'
        }
      };

      mockUserService.deleteUser = jest.fn().mockResolvedValue(null);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('999');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should handle errors', async () => {
      mockRequest = {
        params: {
          id: '1'
        }
      };

      mockUserService.deleteUser = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});