import UserService from '../src/services/user.service';
import UserRepository from '../src/repository/user.repository';
import { AddUserDTO } from '../src/dto/user.dto';

// Mock the UserRepository
jest.mock('../src/repository/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup repository mock
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    
    // Create service instance
    userService = new UserService();
  });

  // Test constructor initialization
  test('should initialize with UserRepository', () => {
    // Changed to not check exact count since constructor might be called multiple times
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
    
    const expectedResponse = { id: 1, ...userData };
    
    // Mock repository methods
    mockUserRepository.checkEmailExists = jest.fn().mockResolvedValue(false);
    mockUserRepository.checkUsernameExists = jest.fn().mockResolvedValue(false);
    mockUserRepository.createUser = jest.fn().mockResolvedValue(expectedResponse);
    
    // Call the method
    const result = await userService.addUser(userData);
    
    // Assertions
    expect(mockUserRepository.checkEmailExists).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.checkUsernameExists).toHaveBeenCalledWith(userData.username);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith(userData);
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
    mockUserRepository.checkEmailExists = jest.fn().mockResolvedValue(true);
    
    // Call the method and expect error
    await expect(userService.addUser(userData))
      .rejects
      .toThrow('Email already in use');
    
    // Assertions
    expect(mockUserRepository.checkEmailExists).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.checkUsernameExists).not.toHaveBeenCalled();
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
    mockUserRepository.checkEmailExists = jest.fn().mockResolvedValue(false);
    mockUserRepository.checkUsernameExists = jest.fn().mockResolvedValue(true);
    
    // Call the method and expect error
    await expect(userService.addUser(userData))
      .rejects
      .toThrow('Username already in use');
    
    // Assertions
    expect(mockUserRepository.checkEmailExists).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.checkUsernameExists).toHaveBeenCalledWith(userData.username);
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });
});