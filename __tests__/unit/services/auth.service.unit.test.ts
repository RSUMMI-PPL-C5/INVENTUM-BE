import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthService from "../../../src/services/auth.service";
import UserRepository from "../../../src/repository/user.repository";

jest.mock("../../../src/repository/user.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService();
    (authService as any).userRepository = userRepositoryMock;
  });

  it("should validate user and return user data", async () => {
    userRepositoryMock.findByUsername.mockResolvedValue({
      id: "123",
      username: "testuser",
      password: "hashedpassword",
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const user = await authService.validateUser("testuser", "password123");

    expect(user).toEqual({ id: "123", username: "testuser" });
    expect(userRepositoryMock.findByUsername).toHaveBeenCalledWith("testuser");
  });

  it("should throw an error when user is not found", async () => {
    userRepositoryMock.findByUsername.mockResolvedValue(null);

    await expect(authService.validateUser("nonexistent", "password123")).rejects.toThrow(
      "User not found"
    );
  });

  it("should throw an error when password is incorrect", async () => {
    userRepositoryMock.findByUsername.mockResolvedValue({
      id: "123",
      username: "testuser",
      password: "hashedpassword",
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(authService.validateUser("testuser", "wrongpassword")).rejects.toThrow(
      "Invalid username or password"
    );
  });

  it("should return a token when login is successful", async () => {
    process.env.JWT_SECRET_KEY = "secret";

    userRepositoryMock.findByUsername.mockResolvedValue({
      id: "123",
      username: "testuser",
      password: "hashedpassword",
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mocked_token");

    const result = await authService.login("testuser", "password123");

    expect(result).toEqual({
      id: "123",
      username: "testuser",
      token: "mocked_token",
    });
  });

  it("should throw an error when user does not exist during login", async () => {
    userRepositoryMock.findByUsername.mockResolvedValue(null);

    await expect(authService.login("wronguser", "password123")).rejects.toThrow(
      "User not found"
    );
  });

  it("should throw an error when JWT_SECRET_KEY is missing", async () => {
    delete process.env.JWT_SECRET_KEY;

    userRepositoryMock.findByUsername.mockResolvedValue({
      id: "123",
      username: "testuser",
      password: "hashedpassword",
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(authService.login("testuser", "password123")).rejects.toThrow(
      "JWT_SECRET_KEY is not set"
    );
  });
});
