import UserService from "../../../../src/services/user.service";
import UserRepository from "../../../../src/repository/user.repository";
import bcrypt from "bcrypt";

jest.mock("../../../../src/repository/user.repository");
jest.mock("bcrypt");

describe("UserService - ADD", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
  });

  it("should add a new user successfully", async () => {
    const mockUserData = {
      email: "user1@example.com",
      username: "user1",
      password: "password1",
      role: "USER",
      fullname: "User One",
      createdBy: 1,
    };

    const mockCreatedUser = { id: "1", ...mockUserData, password: "hashedPassword" };
    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);

    const result = await userService.addUser(mockUserData);

    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith("user1@example.com");
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("user1");
    expect(bcrypt.hash).toHaveBeenCalledWith("password1", 10);
    expect(mockUserRepository.createUser).toHaveBeenCalled();
    expect(result).toEqual(mockCreatedUser);
  });

  it("should throw an error if email is already in use", async () => {
    const mockExistingUser = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedPassword",
      role: "USER",
      fullname: "User One",
      nokar: "123",
      divisiId: null,
      waNumber: null,
      createdBy: 1,
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };
  
    mockUserRepository.getUserByEmail.mockResolvedValue(mockExistingUser);
  
    await expect(
      userService.addUser({ email: "user1@example.com", username: "user1", password: "password1", createdBy: 1 })
    ).rejects.toThrow("Email already in use");
  
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith("user1@example.com");
    expect(mockUserRepository.findByUsername).not.toHaveBeenCalled();
  });

  it("should throw an error if username is already in use", async () => {
    const mockExistingUser = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedPassword",
      role: "USER",
      fullname: "User One",
      nokar: "123",
      divisiId: null,
      waNumber: null,
      createdBy: 1,
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };
  
    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(mockExistingUser);
  
    await expect(
      userService.addUser({ email: "user1@example.com", username: "user1", password: "password1", createdBy: 1 })
    ).rejects.toThrow("Username already in use");
  
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith("user1@example.com");
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("user1");
  });

  it("should add a new user with divisiId successfully", async () => {
    const mockUserData = {
      email: "user2@example.com",
      username: "user2",
      password: "password2",
      role: "USER",
      fullname: "User Two",
      nokar: "456",
      waNumber: "9876543210",
      createdBy: 1,
      divisiId: 2, // divisiId is provided
    };
  
    const mockCreatedUser = {
      id: "2",
      ...mockUserData,
      password: "hashedPassword",
      createdOn: new Date(),
      modifiedOn: new Date(),
      divisi: { connect: { id: 2 } }, // divisi is connected
    };
  
    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);
  
    const result = await userService.addUser(mockUserData);
  
    expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith("user2@example.com");
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("user2");
    expect(bcrypt.hash).toHaveBeenCalledWith("password2", 10);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user2@example.com",
        username: "user2",
        divisi: { connect: { id: 2 } }, // Ensure divisi is connected
      })
    );
    expect(result).toEqual(mockCreatedUser);
  });
});