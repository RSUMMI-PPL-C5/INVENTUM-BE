import UserService from '../../../../src/services/user.service';
import UserController from '../../../../src/controllers/user.controller';
import { Request, Response } from 'express';

jest.mock('../../../../src/services/user.service');

const mockValidationResult = (isValid: boolean, errors: any[] = []) => {
  const mockValidation = {
    isEmpty: () => isValid,
    array: () => errors,
  };

  jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(() => mockValidation),
  }));
};

describe('UserController - GET', () => {
    let userController: UserController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockUserService: {
      getUsers: jest.Mock;
      getUserById: jest.Mock;
      getFilteredUsers: jest.Mock;
      searchUser: jest.Mock;
    };

    beforeEach(() => {
      jest.clearAllMocks();

      // Mocking the UserService methods
      mockUserService = {
        getUsers: jest.fn(),
        getUserById: jest.fn(),
        getFilteredUsers: jest.fn(),
        searchUser: jest.fn(),
      };

      // Mocking the UserService implementation
      (UserService as jest.Mock).mockImplementation(() => mockUserService);

      userController = new UserController();

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockRequest = {
        params: { id: '1' },
        body: {
          fullname: 'Updated User One',
          role: '1',
          password: 'newpassword',
          divisiId: 1,
          waNumber: '1234567890',
          modifiedBy: 1,
          nokar: '123',
          email: 'updatedUser@example.com',
          username: 'updatedUser',
        },
      };
    });

    test('GET /user - should return 400 if validation errors exist', async () => {
      // Reset modules first to ensure clean state
      jest.resetModules();

      const mockValidationResult = {
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid input' }],
      };
      
      // Mock express-validator before importing the controller
      jest.doMock('express-validator', () => ({
        validationResult: jest.fn().mockImplementation(() => mockValidationResult)
      }));
      
      // Import controller after mocking
      const { default: UserController } = await import('../../../../src/controllers/user.controller');
      const userController = new UserController();
      
      mockRequest.query = {}; // Ensure query is defined
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid input data' });
      
      // Clean up by resetting modules
      jest.resetModules();
    });

    test('GET /user - should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          password: 'password1',
          role: '1',
          fullname: 'User One',
          nokar: '123',
          divisiId: 1,
          waNumber: '1234567890',
          createdBy: 1,
          createdOn: new Date(),
          updatedBy: 1,
          updatedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
          modifiedBy: 1,
          modifiedOn: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
          password: 'password2',
          role: '2',
          fullname: 'User Two',
          nokar: '456',
          divisiId: 2,
          waNumber: '0987654321',
          createdBy: 1,
          createdOn: new Date(),
          updatedBy: 1,
          updatedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
          modifiedBy: 1,
          modifiedOn: new Date(),
        },
      ];
    
      // Mocking the service method to return mock data
      mockUserService.getUsers.mockResolvedValue(mockUsers);
    
      // Ensuring mockRequest.query is defined
      mockRequest.query = {}; // Ensure query is not undefined
    
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
    
      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
    
    test('GET /user - should handle errors', async () => {
      const errorMessage = 'Database error';
    
      // Mock the getUsers method to reject with an error
      mockUserService.getUsers.mockRejectedValue(new Error(errorMessage));
    
      mockRequest.query = {}; // Ensure query is not undefined
    
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
    
      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    test('GET /user/:id - should return user details', async () => {
      const mockUser = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        password: 'password1',
        role: '1',
        fullname: 'User One',
        nokar: '123',
        divisiId: 1,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        updatedBy: 1,
        updatedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
        modifiedBy: 1,
        modifiedOn: new Date(),
      };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    test('GET /user/:id - should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('GET /user/:id - should handle errors', async () => {
      const errorMessage = 'Database error';
      mockUserService.getUserById.mockRejectedValue(new Error(errorMessage));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
    
    test('GET /user - should return all users when no filters or search query is provided', async () => {
      // Mock validation success
      mockValidationResult(true);
    
      mockRequest.query = {}; // No filters or search query
      const mockUsers = [{ id: 3, name: 'All Users' }];
      mockUserService.getUsers.mockResolvedValue(mockUsers);
    
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
    
      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
    
    test('GET /user - should return users based on search query', async () => {
      // Mock validation success
      const validationSuccess = { isEmpty: () => true };
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue(validationSuccess);
    
      mockRequest.query = { search: 'test' }; // Search query
      const mockUsers = [{ id: 1, name: 'Test User' }];
      mockUserService.searchUser.mockResolvedValue(mockUsers);
    
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
    
      expect(mockUserService.searchUser).toHaveBeenCalledWith('test');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
    
    test('GET /user - should return filtered users when filters are applied', async () => {
      // Mock validation success
      const validationSuccess = { isEmpty: () => true };
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue(validationSuccess);
    
      mockRequest.query = {
        role: 'admin',
        divisiId: '1',
        createdOnStart: '2023-01-01',
        createdOnEnd: '2023-12-31',
      }; // Filters
      const mockFilteredUsers = [{ id: 2, name: 'Filtered User' }];
      mockUserService.getFilteredUsers.mockResolvedValue(mockFilteredUsers);
    
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
    
      expect(mockUserService.getFilteredUsers).toHaveBeenCalledWith({
        role: 'admin',
        divisiId: '1',
        createdOnStart: '2023-01-01',
        createdOnEnd: '2023-12-31',
        modifiedOnStart: undefined,
        modifiedOnEnd: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFilteredUsers);
    });
    
    test('GET /user - should return all users when no filters or search query is provided', async () => {
      // Mock validation success
      const validationSuccess = { isEmpty: () => true };
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue(validationSuccess);
    
      mockRequest.query = {}; // No filters or search query
      const mockUsers = [{ id: 3, name: 'All Users' }];
      mockUserService.getUsers.mockResolvedValue(mockUsers);
    
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
    
      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
  }
);