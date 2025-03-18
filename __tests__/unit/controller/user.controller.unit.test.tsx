import UserService from '../../../src/services/user.service';
import UserController from '../../../src/controllers/user.controller';
import { Request, Response } from 'express';

jest.mock('../../../src/services/user.service');

const mockUserService = {
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

(UserService as jest.Mock).mockImplementation(() => mockUserService);

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
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

  test('PUT /user/:id - should update user details', async () => {
    const updatedUser = {
      id: '1',
      email: 'updatedUser@example.com',
      username: 'updatedUser',
      password: 'newpassword',
      role: '1',
      fullname: 'Updated User One',
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
    mockUserService.updateUser.mockResolvedValue(updatedUser);

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
      fullname: 'Updated User One',
      role: '1',
      password: 'newpassword',
      divisiId: 1,
      waNumber: '1234567890',
      modifiedBy: 1,
      nokar: '123',
      email: 'updatedUser@example.com',
      username: 'updatedUser',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
  });

  test('PUT /user/:id - should return 404 if user not found or invalid data', async () => {
    mockUserService.updateUser.mockResolvedValue(null);

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
      fullname: 'Updated User One',
      role: '1',
      password: 'newpassword',
      divisiId: 1,
      waNumber: '1234567890',
      modifiedBy: 1,
      nokar: '123',
      email: 'updatedUser@example.com',
      username: 'updatedUser',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found or invalid data' });
  });

  test('PUT /user/:id - should handle errors', async () => {
    const errorMessage = 'Database error';
    mockUserService.updateUser.mockRejectedValue(new Error(errorMessage));

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
      fullname: 'Updated User One',
      role: '1',
      password: 'newpassword',
      divisiId: 1,
      waNumber: '1234567890',
      modifiedBy: 1,
      nokar: '123',
      email: 'updatedUser@example.com',
      username: 'updatedUser',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
  
  test('DELETE /user/:id - should delete user', async () => {
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
    mockUserService.deleteUser.mockResolvedValue(mockUser);

    await userController.deleteUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });

  test('DELETE /user/:id - should return 404 if user not found', async () => {
    mockUserService.deleteUser.mockResolvedValue(null);

    await userController.deleteUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('DELETE /user/:id - should handle errors', async () => {
    const errorMessage = 'Database error';
    mockUserService.deleteUser.mockRejectedValue(new Error(errorMessage));

    await userController.deleteUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});