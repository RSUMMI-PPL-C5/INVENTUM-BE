import UserService from '../../../../src/services/user.service';
import UserController from '../../../../src/controllers/user.controller';
import { Request, Response } from 'express';
import AppError from '../../../../src/utils/appError';

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
      user: { userId: '2' }, // Adding authenticated user info
      body: {
        fullname: 'Updated User One',
        role: '1',
        password: 'newpassword',
        divisiId: 1,
        waNumber: '1234567890',
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
      createdBy: '1',
      createdOn: new Date(),
      modifiedBy: '2',
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };
    mockUserService.updateUser.mockResolvedValue(updatedUser);

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', mockRequest.body, '2');
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      data: updatedUser
    });
  });

  test('PUT /user/:id - should return 404 if user not found or invalid data', async () => {
    mockUserService.updateUser.mockResolvedValue(null);

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', mockRequest.body, '2');
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found or invalid data' });
  });

  test('PUT /user/:id - should handle generic errors', async () => {
    const errorMessage = 'Database error';
    mockUserService.updateUser.mockRejectedValue(new Error(errorMessage));

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', mockRequest.body, '2');
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      status: "error", 
      statusCode: 500, 
      message: errorMessage 
    });
  });

  test('PUT /user/:id - should handle AppError', async () => {
    const appError = new AppError('Validation failed', 422);
    mockUserService.updateUser.mockRejectedValue(appError);

    await userController.updateUser(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.updateUser).toHaveBeenCalledWith('1', mockRequest.body, '2');
    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 422,
      message: 'Validation failed'
    });
  });

  test('PUT /user/:id - should handle missing authenticated user', async () => {
    // Create request without user property
    const requestWithoutUser = {
      params: { id: '1' },
      body: mockRequest.body
    };

    await userController.updateUser(requestWithoutUser as unknown as Request, mockResponse as Response);

    // Should either handle the error appropriately or not call the service
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});