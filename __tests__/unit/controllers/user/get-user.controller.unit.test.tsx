import UserService from '../../../../src/services/user.service';
import UserController from '../../../../src/controllers/user.controller';
import { Request, Response } from 'express';
import AppError from '../../../../src/utils/appError';

jest.mock('../../../../src/services/user.service');

describe('UserController - GET', () => {
    let userController: UserController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockUserService: {
      getUsers: jest.Mock;
      getUserById: jest.Mock;
    };

    beforeEach(() => {
      jest.clearAllMocks();

      // Mocking the UserService methods
      mockUserService = {
        getUsers: jest.fn(),
        getUserById: jest.fn(),
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
        query: {},
      };
    });

    test('GET /user - should return users with default pagination', async () => {
      const mockResult = {
        data: [
          {
            id: '1',
            email: 'user1@example.com',
            username: 'user1',
          },
          {
            id: '2',
            email: 'user2@example.com',
            username: 'user2',
          }
        ],
        pagination: {
          total: 2,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        {}, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    test('GET /user - should use provided pagination parameters', async () => {
      mockRequest.query = { page: '2', limit: '20' };
      
      const mockResult = {
        data: [/* some users */],
        pagination: {
          total: 30,
          currentPage: 2,
          totalPages: 2,
          limit: 20
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { page: '2', limit: '20' }, 
        { page: 2, limit: 20 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    test('GET /user - should handle search parameter', async () => {
      mockRequest.query = { search: 'john' };
      
      const mockResult = {
        data: [/* matching users */],
        pagination: {
          total: 1,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        'john', 
        { search: 'john' }, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    test('GET /user - should handle negative page value', async () => {
      mockRequest.query = { page: '-1' };
      
      const mockResult = {
        data: [/* some users */],
        pagination: {
          total: 10,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      // Verify page is corrected to 1
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { page: '-1' }, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
    
    test('GET /user - should handle zero page value', async () => {
      mockRequest.query = { page: '0' };
      
      const mockResult = {
        data: [/* some users */],
        pagination: {
          total: 10,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      // Verify page is corrected to 1
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { page: '0' }, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
    
    test('GET /user - should handle negative limit value', async () => {
      mockRequest.query = { limit: '-5' };
      
      const mockResult = {
        data: [/* some users */],
        pagination: {
          total: 10,
          currentPage: 1,
          totalPages: 1,
          limit: 100
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      // Verify limit is corrected to 10
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { limit: '-5' }, 
        { page: 1, limit: 10 } // limit defaulted to 10
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
    
    test('GET /user - should handle zero limit value', async () => {
      mockRequest.query = { limit: '0' };
      
      const mockResult = {
        data: [/* some users */],
        pagination: {
          total: 10,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      // Verify limit is corrected to 10
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { limit: '0' }, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
    
    test('GET /user - should handle both invalid page and limit values', async () => {
      mockRequest.query = { page: '-2', limit: '-10' };
      
      const mockResult = {
        data: [/* some users */],
        pagination: {
          total: 10,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      // Verify both page and limit are corrected
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { page: '-2', limit: '-10' }, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    test('GET /user - should handle filters', async () => {
      mockRequest.query = { 
        role: 'admin', 
        divisiId: '1',
        createdOnStart: '2023-01-01',
        createdOnEnd: '2023-12-31',
      };
      
      const mockResult = {
        data: [/* filtered users */],
        pagination: {
          total: 5,
          currentPage: 1,
          totalPages: 1,
          limit: 10
        }
      };
      
      mockUserService.getUsers.mockResolvedValue(mockResult);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        undefined, 
        { 
          role: 'admin', 
          divisiId: '1',
          createdOnStart: '2023-01-01',
          createdOnEnd: '2023-12-31',
        }, 
        { page: 1, limit: 10 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    test('GET /user - should handle AppError', async () => {
      const appError = new AppError('Invalid filter parameter', 400);
      mockUserService.getUsers.mockRejectedValue(appError);
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 400,
        message: "Invalid filter parameter"
      });
    });

    test('GET /user - should handle general errors', async () => {
      const errorMessage = 'Database error';
      mockUserService.getUsers.mockRejectedValue(new Error(errorMessage));
      
      await userController.getUsers(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: errorMessage
      });
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
        createdBy: '1',
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: null,
        deletedBy: null,
        deletedOn: null,
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

    test('GET /user/:id - should handle AppError', async () => {
      const appError = new AppError('Invalid user ID format', 400);
      mockUserService.getUserById.mockRejectedValue(appError);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 400,
        message: 'Invalid user ID format'
      });
    });

    test('GET /user/:id - should handle general errors', async () => {
      const errorMessage = 'Database error';
      mockUserService.getUserById.mockRejectedValue(new Error(errorMessage));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        statusCode: 500,
        message: errorMessage
      });
    });
});