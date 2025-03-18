import UserService from "../../../src/services/user.service";
import UserRepository from "../../../src/repository/user.repository";
import { AddUserDTO, UserDTO } from "../../../src/dto/user.dto";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(() => Promise.resolve("hashedPassword")),
}));

// Mock UUID
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

jest.mock("../../../src/repository/user.repository");

describe("User Service", () => {
  const mockGetUsers = jest.fn();
  const mockGetFilteredUsers = jest.fn();
  const mockAddUser = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockDeleteUser = jest.fn();
  const mockGetUserByEmail = jest.fn();
  const mockFindUsersByName = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUsers: mockGetUsers,
      getFilteredUsers: mockGetFilteredUsers,
      createUser: mockAddUser,
      updateUser: mockUpdateUser,
      deleteUser: mockDeleteUser,
      getUserByEmail: mockGetUserByEmail,
      findUsersByName: mockFindUsersByName,
    }));
  });

  // Test for getUsers method
  it("should return all users", async () => {
    const mockUsers: UserDTO[] = [
      { id: "1", email: "user1@example.com", username: "user1", password:"password123", role: "USER", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null },
    ];

    mockGetUsers.mockResolvedValue(mockUsers);

    const userService = new UserService();
    const result = await userService.getUsers();

    expect(mockGetUsers).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  // Test for getFilteredUsers method
  it("should return filtered users based on filters", async () => {
    const filters = { role: ["USER"] };
    const mockFilteredUsers: UserDTO[] = [
      { id: "1", email: "user1@example.com", username: "user1", password:"password123",role: "USER", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null },
    ];

    mockGetFilteredUsers.mockResolvedValue(mockFilteredUsers);

    const userService = new UserService();
    const result = await userService.getFilteredUsers(filters);

    expect(mockGetFilteredUsers).toHaveBeenCalledWith(filters);
    expect(result).toEqual(mockFilteredUsers);
  });

  // Test for addUser method
  it("should add a new user successfully", async () => {
    const newUser: AddUserDTO = {
      email: "newuser@example.com",
      username: "newuser",
      password: "password123",
      role: "USER",
      fullname: "New User",
      nokar: "12345",
      waNumber: "123456789",
      createdBy: 1,
      divisiId: 1,
    };

    const mockUserResponse = {
      id: "1",
      email: newUser.email,
      username: newUser.username,
    };

    mockGetUserByEmail.mockResolvedValue(null);
    mockFindUsersByName.mockResolvedValue([]);
    mockAddUser.mockResolvedValue(mockUserResponse);

    const userService = new UserService();
    const result = await userService.addUser(newUser);

    expect(mockAddUser).toHaveBeenCalled();
    expect(result).toEqual(mockUserResponse);
  });

  it("should throw an error if email already exists", async () => {
    const newUser: AddUserDTO = {
      email: "existinguser@example.com",
      username: "newuser",
      password: "password123",
      role: "USER",
      fullname: "New User",
      nokar: "12345",
      waNumber: "123456789",
      createdBy: 1,
      divisiId: 1,
    };

    mockGetUserByEmail.mockResolvedValue({ id: "1", email: "existinguser@example.com", username: "existinguser" });

    const userService = new UserService();

    await expect(userService.addUser(newUser)).rejects.toThrow("Email already in use");
  });

  it("should throw an error if username already exists", async () => {
    const newUser: AddUserDTO = {
      email: "newuser@example.com",
      username: "existinguser",
      password: "password123",
      role: "USER",
      fullname: "New User",
      nokar: "12345",
      waNumber: "123456789",
      createdBy: 1,
      divisiId: 1,
    };

    mockGetUserByEmail.mockResolvedValue(null);
    mockFindUsersByName.mockResolvedValue([]);

    mockAddUser.mockResolvedValue({ id: "1", email: newUser.email, username: newUser.username });

    const userService = new UserService();
    await expect(userService.addUser(newUser)).rejects.toThrow("Username already in use");
  });

  // Test for searchUser method
  it("should search for users by name successfully", async () => {
    const mockUsers = [{ id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" }];
    mockFindUsersByName.mockResolvedValue(mockUsers);

    const userService = new UserService();
    const result = await userService.searchUser("Azmy");

    expect(mockFindUsersByName).toHaveBeenCalledWith("Azmy");
    expect(result).toEqual(mockUsers);
  });

  it("should throw an error if name query is empty or invalid", async () => {
    const userService = new UserService();

    await expect(userService.searchUser("")).rejects.toThrow("Name query is required");
    await expect(userService.searchUser(undefined as any)).rejects.toThrow("Name query is required");
    await expect(userService.searchUser(null as any)).rejects.toThrow("Name query is required");
  });

  it("should trim spaces around the search query", async () => {
    const mockUsers = [{ id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" }];
    mockFindUsersByName.mockResolvedValue(mockUsers);

    const userService = new UserService();
    const result = await userService.searchUser("   Azmy   ");

    expect(mockFindUsersByName).toHaveBeenCalledWith("Azmy");
    expect(result).toEqual(mockUsers);
  });

  // Test for getUserById method
  it("should return a user by ID successfully", async () => {
    const mockUser: UserDTO = { id: "1", email: "user1@example.com", username: "user1", password:"password123", role: "USER", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null };

    mockGetUserByEmail.mockResolvedValue(mockUser);

    const userService = new UserService();
    const result = await userService.getUserById("1");

    expect(mockGetUserByEmail).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by ID", async () => {
    mockGetUserByEmail.mockResolvedValue(null);

    const userService = new UserService();
    const result = await userService.getUserById("1");

    expect(result).toBeNull();
  });

  // Test for updateUser method
  it("should update user data successfully", async () => {
    const updatedData = { fullname: "Updated User", role: "ADMIN" };
    const mockUser: UserDTO = { id: "1", email: "user1@example.com", username: "user1", password:"password123", role: "USER", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null };

    mockGetUserByEmail.mockResolvedValue(mockUser);
    mockUpdateUser.mockResolvedValue({ ...mockUser, ...updatedData });

    const userService = new UserService();
    const result = await userService.updateUser("1", updatedData);

    expect(result).toEqual({ ...mockUser, ...updatedData });
  });

  it("should return null if invalid user data is provided", async () => {
    const updatedData = { fullname: "Updated User" };
    mockGetUserByEmail.mockResolvedValue(null);

    const userService = new UserService();
    const result = await userService.updateUser("999", updatedData);

    expect(result).toBeNull();
  });

  // Test for deleteUser method
  it("should delete a user successfully", async () => {
    const mockUser: UserDTO = { id: "1", email: "user1@example.com", username: "user1", password:"password123", role: "USER", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null };

    mockDeleteUser.mockResolvedValue(mockUser);

    const userService = new UserService();
    const result = await userService.deleteUser("1");

    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found to delete", async () => {
    mockDeleteUser.mockResolvedValue(null);

    const userService = new UserService();
    const result = await userService.deleteUser("999");

    expect(result).toBeNull();
  });
});
