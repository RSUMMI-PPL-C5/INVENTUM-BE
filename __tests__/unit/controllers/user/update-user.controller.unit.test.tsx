import UserService from '../../../../src/services/user.service';
import UserController from '../../../../src/controllers/user.controller';
import { Request, Response } from 'express';

jest.mock('../../../../src/services/user.service');

describe('UserController - UPDATE', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: {
    updateUser: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mocking the UserService methods
    mockUserService = {
      updateUser: jest.fn(),
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
});