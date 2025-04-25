import { UserDTO } from "../../../../src/dto/user.dto";
import bcrypt from "bcrypt";
import UserService from "../../../../src/services/user.service";
import UserRepository from "../../../../src/repository/user.repository";

jest.mock("../../../../src/repository/user.repository");
jest.mock("bcrypt");

describe("UserService - updateUser", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository; // Inject mocked repository
  });

  it("should update a user with password", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    const updatedData: Partial<UserDTO> = {
      fullname: "Updated User One",
      password: "newpassword",
      divisiId: 2,
      modifiedBy: "1",
    };

    const updatedUser: UserDTO = {
      ...mockUser,
      ...updatedData,
      password: "hashednewpassword",
      modifiedOn: new Date(),
    };

    mockUserRepository.getUserById.mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashednewpassword");
    mockUserRepository.updateUser.mockResolvedValue(updatedUser);

    const result = await userService.updateUser("1", updatedData, "1");

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith("1", {
      fullname: "Updated User One",
      password: "hashednewpassword",
      divisiId: 2,
      modifiedBy: "1",
    });
    expect(result).toEqual(updatedUser);
  });

  it("should update a user without password", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    const updatedData: Partial<UserDTO> = {
      fullname: "Updated User One",
      divisiId: 2,
      modifiedBy: "1",
    };

    const updatedUser: UserDTO = {
      ...mockUser,
      ...updatedData,
      modifiedOn: new Date(),
    };

    mockUserRepository.getUserById.mockResolvedValue(mockUser);
    mockUserRepository.updateUser.mockResolvedValue(updatedUser);

    const result = await userService.updateUser("1", updatedData, "1");

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith("1", {
      fullname: "Updated User One",
      divisiId: 2,
      modifiedBy: "1",
    });
    expect(result).toEqual(updatedUser);
  });

  it("should update all conditional fields (role, waNumber, email, nokar)", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    const updatedData: Partial<UserDTO> = {
      role: "ADMIN",
      waNumber: "987654321",
      email: "updated@example.com",
      nokar: "54321",
      modifiedBy: "1",
    };

    const updatedUser: UserDTO = {
      ...mockUser,
      ...updatedData,
      modifiedOn: new Date(),
    };

    mockUserRepository.getUserById.mockResolvedValue(mockUser);
    mockUserRepository.updateUser.mockResolvedValue(updatedUser);

    const result = await userService.updateUser("1", updatedData, "1");

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith("1", {
      role: "ADMIN",
      waNumber: "987654321",
      email: "updated@example.com",
      nokar: "54321",
      modifiedBy: "1",
    });
    expect(result).toEqual(updatedUser);
  });

  it("should convert divisiId from string to number", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    const updatedData: Partial<UserDTO> = {
      divisiId: "3" as unknown as number, // Simulate string ID from form
      modifiedBy: "1",
    };

    const updatedUser: UserDTO = {
      ...mockUser,
      divisiId: 3, // Should be converted to number
      modifiedBy: "1",
      modifiedOn: new Date(),
    };

    mockUserRepository.getUserById.mockResolvedValue(mockUser);
    mockUserRepository.updateUser.mockResolvedValue(updatedUser);

    const result = await userService.updateUser("1", updatedData, "1");

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith("1", {
      divisiId: 3, // Should be converted to number type
      modifiedBy: "1",
    });
    expect(result).toEqual(updatedUser);
  });

  it("should return null if user not found", async () => {
    mockUserRepository.getUserById.mockResolvedValue(null);

    const result = await userService.updateUser(
      "1",
      { fullname: "Updated User One" },
      "1",
    );

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
    expect(result).toBeNull();
  });

  it("should handle password hashing failure", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: null,
      deletedBy: null,
      deletedOn: null,
    };

    const updatedData: Partial<UserDTO> = {
      fullname: "Updated User One",
      password: "newpassword",
      modifiedBy: "1",
    };

    mockUserRepository.getUserById.mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("Hashing failed"));

    await expect(userService.updateUser("1", updatedData, "1")).rejects.toThrow(
      new Error("Hashing failed"),
    );

    expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
    expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
  });
});
