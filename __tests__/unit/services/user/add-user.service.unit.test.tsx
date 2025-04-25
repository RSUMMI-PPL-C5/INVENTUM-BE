import UserService from "../../../../src/services/user.service";
import UserRepository from "../../../../src/repository/user.repository";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/repository/user.repository");
jest.mock("bcrypt");
jest.mock("uuid");

describe("UserService - createUser", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;

    // Default mock for uuid
    (uuidv4 as jest.Mock).mockReturnValue("generated-uuid");
  });

  // POSITIVE CASES

  it("should create a new user successfully", async () => {
    const mockUserData = {
      email: "user1@example.com",
      username: "user1",
      password: "password1",
      role: "USER",
      fullname: "User One",
      createdBy: "1",
      nokar: "123",
      waNumber: "081234567890",
      createdOn: new Date().toISOString(),
    };

    const mockCreatedUser = {
      id: "generated-uuid",
      ...mockUserData,
      password: "hashedPassword",
    };

    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.getUserByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);

    const result = await userService.createUser(mockUserData);

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      "user1@example.com",
    );
    expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith("user1");
    expect(bcrypt.hash).toHaveBeenCalledWith("password1", 10);
    expect(uuidv4).toHaveBeenCalled();
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      ...mockUserData,
      id: "generated-uuid",
      password: "hashedPassword",
      divisi: undefined,
    });
    expect(result).toEqual(mockCreatedUser);
  });

  it("should create a new user with divisiId successfully", async () => {
    const mockUserData = {
      email: "user2@example.com",
      username: "user2",
      password: "password2",
      role: "USER",
      fullname: "User Two",
      createdBy: "1",
      nokar: "456",
      waNumber: "081234567891",
      divisiId: 2,
      createdOn: new Date().toISOString(),
    };

    const mockCreatedUser = {
      id: "generated-uuid",
      ...mockUserData,
      password: "hashedPassword",
    };

    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.getUserByUsername.mockResolvedValue(null);
    mockUserRepository.getUserByNokar.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);

    const result = await userService.createUser(mockUserData);

    expect(mockUserRepository.getUserByNokar).toHaveBeenCalledWith("456");
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      ...mockUserData,
      id: "generated-uuid",
      password: "hashedPassword",
      divisi: { connect: { id: 2 } },
      divisiId: undefined,
    });
    expect(result).toEqual(mockCreatedUser);
  });

  // NEGATIVE CASES

  it("should throw an error if email is already in use", async () => {
    const mockExistingUser = {
      id: "123",
      email: "test@example.com",
      username: "testuser",
      password: "password123",
      role: "user",
      fullname: "Test User",
      nokar: "12345",
      waNumber: "1234567890",
      createdBy: "admin",
      createdOn: new Date(),
      divisiId: 1,
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    mockUserRepository.getUserByEmail.mockResolvedValue(mockExistingUser);

    const mockUserData = {
      email: "user1@example.com",
      username: "newuser",
      password: "password1",
      role: "USER",
      fullname: "New User",
      createdBy: "1",
      nokar: "456",
      waNumber: "081234567891",
      createdOn: new Date().toISOString(),
    };

    await expect(userService.createUser(mockUserData)).rejects.toThrow(
      new AppError("Email already in use", 400),
    );

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      "user1@example.com",
    );
    expect(mockUserRepository.getUserByUsername).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("should throw an error if username is already in use", async () => {
    const mockExistingUser = {
      id: "1",
      email: "existing@example.com",
      username: "user1",
      password: "hashedPassword",
      role: "USER",
      fullname: "Existing User",
      nokar: "123",
      waNumber: "081234567890",
      createdBy: "1",
      createdOn: new Date(),
      divisiId: 1,
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.getUserByUsername.mockResolvedValue(mockExistingUser);

    const mockUserData = {
      email: "new@example.com",
      username: "user1",
      password: "password1",
      role: "USER",
      fullname: "New User",
      createdBy: "1",
      nokar: "456",
      waNumber: "081234567891",
      createdOn: new Date().toISOString(),
    };

    await expect(userService.createUser(mockUserData)).rejects.toThrow(
      new AppError("Username already in use", 400),
    );

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
      "new@example.com",
    );
    expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith("user1");
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("should throw an error if nokar is already in use", async () => {
    const mockExistingUser = {
      id: "1",
      email: "existing@example.com",
      username: "existinguser",
      password: "hashedPassword",
      role: "USER",
      fullname: "Existing User",
      nokar: "123456",
      waNumber: "081234567890",
      createdBy: "1",
      createdOn: new Date(),
      divisiId: 1,
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.getUserByUsername.mockResolvedValue(null);
    mockUserRepository.getUserByNokar.mockResolvedValue(mockExistingUser);

    const mockUserData = {
      email: "new@example.com",
      username: "newuser",
      password: "password1",
      role: "USER",
      fullname: "New User",
      createdBy: "1",
      nokar: "123456",
      waNumber: "081234567891",
      createdOn: new Date().toISOString(),
    };

    await expect(userService.createUser(mockUserData)).rejects.toThrow(
      new AppError("Nokar already in use", 400),
    );

    expect(mockUserRepository.getUserByNokar).toHaveBeenCalledWith("123456");
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });
});
