import UserService from '../src/services/user.service';
import UserRepository from '../src/repository/user.repository';
import { AddUserDTO } from '../src/dto/user.dto';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Mock modules
jest.mock('../src/repository/user.repository');
jest.mock('bcrypt');
jest.mock('uuid');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup repository mock
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    // Mock bcrypt and uuid
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (uuidv4 as jest.Mock).mockReturnValue('mocked-uuid');

    // Create service instance
    userService = new UserService();
  });

  // Test constructor initialization
  test('should initialize with UserRepository', () => {
    expect(UserRepository).toHaveBeenCalled();
  });

  // Test addUser method - successful case
  test('should successfully add a user', async () => {
    // Setup test data
    const userData: AddUserDTO = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: '123456',
      divisiId: 1,
      waNumber: '081234567890',
      createdBy: 1
    };

    const expectedResponse = { id: 'mocked-uuid', ...userData };

    // Mock repository methods
    mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue(null);
    mockUserRepository.findByUsername = jest.fn().mockResolvedValue(null);
    mockUserRepository.createUser = jest.fn().mockResolvedValue(expectedResponse);

    // Call the method
    const result = await userService.addUser(userData);

    // Assertions
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 'mocked-uuid',
      email: userData.email,
      username: userData.username,
      password: 'hashed_password',
      role: userData.role,
      fullname: userData.fullname,
      nokar: userData.nokar,
      waNumber: userData.waNumber,
      createdBy: userData.createdBy,
      divisi: {
        connect: {
          id: userData.divisiId
        }
      },
      createdOn: expect.any(Date),
      modifiedOn: expect.any(Date)
    }));
    expect(result).toEqual(expectedResponse);
  });

  // Test addUser method - email already exists
  test('should throw error when email already exists', async () => {
    // Setup test data
    const userData: AddUserDTO = {
      email: 'existing@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: '123456',
      divisiId: 1,
      waNumber: '081234567890',
      createdBy: 1
    };

    // Mock repository methods
    mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue({ id: 'existing-id', email: userData.email });

    // Call the method and expect error
    await expect(userService.addUser(userData))
      .rejects
      .toThrow('Email already in use');

    // Assertions
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.findByUsername).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  // Test addUser method - username already exists
  test('should throw error when username already exists', async () => {
    // Setup test data
    const userData: AddUserDTO = {
      email: 'test@example.com',
      username: 'existinguser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: '123456',
      divisiId: 1,
      waNumber: '081234567890',
      createdBy: 1
    };

    // Mock repository methods
    mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue(null);
    mockUserRepository.findByUsername = jest.fn().mockResolvedValue({ id: 'existing-id', username: userData.username });

    // Call the method and expect error
    await expect(userService.addUser(userData))
      .rejects
      .toThrow('Username already in use');

    // Assertions
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  // Test getUsers method
  test('should get all users', async () => {
    const expectedUsers = [{ id: '1', username: 'user1' }, { id: '2', username: 'user2' }];
    mockUserRepository.getUsers = jest.fn().mockResolvedValue(expectedUsers);

    const result = await userService.getUsers();

    expect(mockUserRepository.getUsers).toHaveBeenCalled();
    expect(result).toEqual(expectedUsers);
  });

  // Test getFilteredUsers method
  test('should get filtered users', async () => {
    const filters = { role: ['admin'] };
    const expectedUsers = [{ id: '1', username: 'admin1' }];
    mockUserRepository.getFilteredUsers = jest.fn().mockResolvedValue(expectedUsers);

    const result = await userService.getFilteredUsers(filters);

    expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toEqual(expectedUsers);
  });

  // Test searchUser method
  test('should search users by name', async () => {
    const name = 'John';
    const expectedUsers = [{ id: '1', fullname: 'John Doe' }];
    mockUserRepository.findUsersByName = jest.fn().mockResolvedValue(expectedUsers);

    const result = await userService.searchUser(name);

    expect(mockUserRepository.findUsersByName).toHaveBeenCalledWith(name);
    expect(result).toEqual(expectedUsers);
  });

  // Test searchUser method with invalid name
  test('should throw error when searching with empty name', async () => {
    await expect(userService.searchUser('')).rejects.toThrow('Name query is required');
    await expect(userService.searchUser('   ')).rejects.toThrow('Name query is required');
  });

  // Test getUserById method
  test('should get user by id', async () => {
    const userId = '1';
    const expectedUser = { id: userId, username: 'user1' };
    mockUserRepository.getUserById = jest.fn().mockResolvedValue(expectedUser);

    const result = await userService.getUserById(userId);

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expectedUser);
  });

  // Test updateUser method
  test('should update user', async () => {
    const userId = '1';
    const userData = {
      fullname: 'Updated User',
      role: 'admin',
      modifiedBy: 2
    };
    const existingUser = { id: userId, ...userData };
    const updatedUser = { ...existingUser, modifiedOn: expect.any(Date) };

    mockUserRepository.getUserById = jest.fn().mockResolvedValue(existingUser);
    mockUserRepository.updateUser = jest.fn().mockResolvedValue(updatedUser);

    const result = await userService.updateUser(userId, userData);

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, expect.objectContaining({
      fullname: userData.fullname,
      role: userData.role,
      modifiedBy: userData.modifiedBy,
      modifiedOn: expect.any(Date)
    }));
    expect(result).toEqual(updatedUser);
  });

  // Test updateUser with password
  test('should update user with password', async () => {
    const userId = '1';
    const userData = {
      fullname: 'Updated User',
      password: 'newpassword',
      modifiedBy: 2
    };
    const existingUser = { id: userId, fullname: 'Old Name' };

    mockUserRepository.getUserById = jest.fn().mockResolvedValue(existingUser);
    mockUserRepository.updateUser = jest.fn().mockResolvedValue({ ...existingUser, ...userData });

    await userService.updateUser(userId, userData);

    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, expect.objectContaining({
      password: 'hashed_password'
    }));
  });

  // Test updateUser with invalid data
  test('should return null when updating with invalid data', async () => {
    const userId = '1';
    const userData = { fullname: 'Up' }; // Invalid: too short and missing modifiedBy
    const existingUser = { id: userId, fullname: 'Old Name' };

    mockUserRepository.getUserById = jest.fn().mockResolvedValue(existingUser);

    const result = await userService.updateUser(userId, userData);

    expect(result).toBeNull();
    expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
  });

  // Test deleteUser method
  test('should delete user', async () => {
    const userId = '1';
    const expectedUser = { id: userId, username: 'user1' };
    mockUserRepository.deleteUser = jest.fn().mockResolvedValue(expectedUser);

    const result = await userService.deleteUser(userId);

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expectedUser);
  });

  // Test updateUser with invalid role type
  test('should return null when updating with invalid role type', async () => {
    const userId = '1';
    const userData = {
      fullname: 'Updated User',
      role: 123, // Invalid: role should be a string
      modifiedBy: 2
    };
    const existingUser = { id: userId, fullname: 'Old Name' };

    mockUserRepository.getUserById = jest.fn().mockResolvedValue(existingUser);

    const result = await userService.updateUser(userId, userData as any);

    expect(result).toBeNull();
    expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
  });

  // Test updateUser with invalid divisiId type
  test('should return null when updating with invalid divisiId type', async () => {
    const userId = '1';
    const userData = {
      fullname: 'Updated User',
      divisiId: 'not-a-number', // Invalid: divisiId should be a number
      modifiedBy: 2
    };
    const existingUser = { id: userId, fullname: 'Old Name' };

    mockUserRepository.getUserById = jest.fn().mockResolvedValue(existingUser);

    const result = await userService.updateUser(userId, userData as any);

    expect(result).toBeNull();
    expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
  });

  // Test addUser without divisiId (should handle undefined/null divisiId)
  test('should successfully add a user without divisiId', async () => {
    // Setup test data without divisiId
    const userData: AddUserDTO = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: '123456',
      divisiId: undefined, // Testing with undefined divisiId
      waNumber: '081234567890',
      createdBy: 1
    };

    const expectedResponse = { id: 'mocked-uuid', ...userData };

    // Mock repository methods
    mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue(null);
    mockUserRepository.findByUsername = jest.fn().mockResolvedValue(null);
    mockUserRepository.createUser = jest.fn().mockResolvedValue(expectedResponse);

    // Call the method
    const result = await userService.addUser(userData);

    // Assertions
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 'mocked-uuid',
      email: userData.email,
      username: userData.username,
      password: 'hashed_password',
      role: userData.role,
      fullname: userData.fullname,
      nokar: userData.nokar,
      waNumber: userData.waNumber,
      createdBy: userData.createdBy,
      createdOn: expect.any(Date),
      modifiedOn: expect.any(Date)
      // No divisi connection here since divisiId is undefined
    }));
    expect(result).toEqual(expectedResponse);
  });

  // Test addUser with null divisiId
  test('should successfully add a user with null divisiId', async () => {
    // Setup test data with null divisiId
    const userData: AddUserDTO = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'user',
      fullname: 'Test User',
      nokar: '123456',
      divisiId: null, // Testing with null divisiId
      waNumber: '081234567890',
      createdBy: 1
    };

    const expectedResponse = { id: 'mocked-uuid', ...userData };

    // Mock repository methods
    mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue(null);
    mockUserRepository.findByUsername = jest.fn().mockResolvedValue(null);
    mockUserRepository.createUser = jest.fn().mockResolvedValue(expectedResponse);

    // Call the method
    const result = await userService.addUser(userData);

    // Assertions
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 'mocked-uuid',
      email: userData.email,
      username: userData.username,
      password: 'hashed_password',
      role: userData.role,
      fullname: userData.fullname,
      nokar: userData.nokar,
      waNumber: userData.waNumber,
      createdBy: userData.createdBy,
      createdOn: expect.any(Date),
      modifiedOn: expect.any(Date)
      // No divisi connection here since divisiId is null
    }));
    expect(result).toEqual(expectedResponse);
  });
});

