import { UserDTO } from "../../../../src/dto/user.dto";
import UserService from "../../../../src/services/user.service";
import UserRepository from "../../../../src/repository/user.repository";

jest.mock("../../../../src/repository/user.repository");

describe("UserService - deleteUser", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository; // Inject mocked repository
  });

  it("should delete a user successfully", async () => {
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
      deletedBy: "1",
      deletedOn: new Date(),
    };

    mockUserRepository.deleteUser.mockResolvedValue(mockUser);

    const result = await userService.deleteUser("1", "1");

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("1", "1");
    expect(result).toEqual(mockUser);
  });

  it("should return null if user not found", async () => {
    mockUserRepository.deleteUser.mockResolvedValue(null);

    const result = await userService.deleteUser("nonexistent-id", "1");

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(
      "nonexistent-id",
      "1",
    );
    expect(result).toBeNull();
  });

  it("should handle errors thrown by the repository", async () => {
    mockUserRepository.deleteUser.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(userService.deleteUser("1", "1")).rejects.toThrow(
      "Database error",
    );

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("1", "1");
  });

  it("should handle cases where deletedBy is not provided", async () => {
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
      deletedOn: new Date(),
    };

    mockUserRepository.deleteUser.mockResolvedValue(mockUser);

    const result = await userService.deleteUser("1");

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("1", undefined);
    expect(result).toEqual(mockUser);
  });

  it("should handle edge case where deletedBy is an empty string", async () => {
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
      deletedBy: "",
      deletedOn: new Date(),
    };

    mockUserRepository.deleteUser.mockResolvedValue(mockUser);

    const result = await userService.deleteUser("1", "");

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith("1", "");
    expect(result).toEqual(mockUser);
  });
});
