import UserController from '../src/controllers/user.controller';
import UserService from '../src/services/user.service';
import { Request, Response } from 'express';
import { ValidationError } from 'express-validator';

// Mock dependencies
jest.mock('../src/services/user.service');
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

// Import after mocking
import { validationResult } from 'express-validator';

// Create interface for validation result
interface ValidationResultMock {
  isEmpty: jest.Mock;
  array: jest.Mock;
}

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: jest.Mocked<UserService>;
  let validationResultMock: ValidationResultMock;
  let originalConsoleError: typeof console.error;
  
  beforeEach(() => {
    // Save original console.error before mocking
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock userService methods
    mockUserService = {
      addUser: jest.fn()
    } as unknown as jest.Mocked<UserService>;
    
    // Replace the userService in the controller with our mock
    jest.spyOn(UserService.prototype, 'addUser').mockImplementation(mockUserService.addUser);
    
    // Create controller instance
    userController = new UserController();
    
    // Setup request and response objects
    mockRequest = {
      body: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'USER',
        fullname: 'Test User',
        waNumber: '1234567890',
        userId: 1
      }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Fix the validation mock with proper typing
    validationResultMock = {
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    };
    
    // Proper way to mock validationResult
    (validationResult as unknown as jest.Mock).mockReturnValue(validationResultMock);
  });
  
  // Restore original console.error after tests
  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('addUser', () => {
    it('should create a user successfully and return 201 status', async () => {
      // Arrange
      const responseData = {
        id: 'new-id',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      mockUserService.addUser.mockResolvedValue(responseData);
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockUserService.addUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'USER',
        fullname: 'Test User',
        waNumber: '1234567890',
        createdBy: 1
      });
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(responseData);
    });
    
    it('should handle divisiId when provided as string and convert to number', async () => {
      // Arrange
      mockRequest.body.divisiId = '123';
      const responseData = {
        id: 'new-id',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      mockUserService.addUser.mockResolvedValue(responseData);
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockUserService.addUser).toHaveBeenCalledWith(
        expect.objectContaining({
          divisiId: 123 // Should be converted to number
        })
      );
    });
    
    it('should return 400 status on validation error', async () => {
      // Arrange
      const validationErrors = [{ msg: 'Email is required' } as ValidationError];
      
      // Create new mock with errors
      const errorValidationMock: ValidationResultMock = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(validationErrors)
      };
      
      // Proper way to mock validationResult for this test case
      (validationResult as unknown as jest.Mock).mockReturnValue(errorValidationMock);
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: validationErrors });
      expect(mockUserService.addUser).not.toHaveBeenCalled();
    });
    
    it('should return 409 status when email is already in use', async () => {
      // Arrange
      mockUserService.addUser.mockRejectedValue(new Error('Email already in use'));
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email already in use' });
    });
    
    it('should return 409 status when username is already in use', async () => {
      // Arrange
      mockUserService.addUser.mockRejectedValue(new Error('Username already in use'));
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already in use' });
    });
    
    it('should return 500 status on other errors', async () => {
      // Arrange
      mockUserService.addUser.mockRejectedValue(new Error('Database error'));
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
    
    it('should return 500 status on unknown errors', async () => {
      // Arrange
      mockUserService.addUser.mockRejectedValue('Some non-error object');
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'An unknown error occurred' });
    });
    
    it('should use default userId when not provided in request', async () => {
      // Arrange
      delete mockRequest.body.userId;
      const responseData = {
        id: 'new-id',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      mockUserService.addUser.mockResolvedValue(responseData);
      
      // Act
      await userController.addUser(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Assert
      expect(mockUserService.addUser).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: 1 // Default userId
        })
      );
    });
  });
});