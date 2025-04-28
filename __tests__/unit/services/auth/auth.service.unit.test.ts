import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthService from "../../../../src/services/auth.service";
import UserRepository from "../../../../src/repository/user.repository";
import AppError from "../../../../src/utils/appError";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../../src/repository/user.repository");

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const dummyDate = new Date("2025-01-01T00:00:00Z"); // Dummy date for consistency

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService();
    (authService as any).userRepository = mockUserRepository; // Inject mocked repository
  });

  describe("validateUser", () => {
    it("should return user data without password if username and password are valid", async () => {
      const mockUser = {
        id: "1",
        username: "user1",
        password: "hashedPassword",
        email: "user1@example.com",
        role: "User",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: dummyDate,
        modifiedBy: null,
        modifiedOn: dummyDate,
        deletedBy: null,
        deletedOn: null,
      };

      mockUserRepository.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser("user1", "password");

      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith(
        "user1",
      );
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword");
      expect(result).toEqual({
        id: "1",
        username: "user1",
        email: "user1@example.com",
        role: "User",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: dummyDate,
        modifiedBy: null,
        modifiedOn: dummyDate,
        deletedBy: null,
        deletedOn: null,
      });
    });

    it("should throw an AppError if user is not found", async () => {
      mockUserRepository.getUserByUsername.mockResolvedValue(null);

      await expect(
        authService.validateUser("user1", "password"),
      ).rejects.toThrow(new AppError("User not found", 404));

      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith(
        "user1",
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw an AppError if password is invalid", async () => {
      const mockUser = {
        id: "1",
        username: "user1",
        password: "hashedPassword",
        email: "user1@example.com",
        role: "User",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: dummyDate,
        modifiedBy: null,
        modifiedOn: dummyDate,
        deletedBy: null,
        deletedOn: null,
      };

      mockUserRepository.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser("user1", "wrongPassword"),
      ).rejects.toThrow(new AppError("Invalid username or password", 401));

      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith(
        "user1",
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongPassword",
        "hashedPassword",
      );
    });
  });

  describe("login", () => {
    it("should return user data with a token if login is successful", async () => {
      const mockUser = {
        id: "1",
        username: "user1",
        password: "hashedPassword",
        email: "user1@example.com",
        role: "User",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: dummyDate,
        modifiedBy: null,
        modifiedOn: dummyDate,
        deletedBy: null,
        deletedOn: null,
      };

      const mockToken = "mockJwtToken";

      mockUserRepository.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      process.env.JWT_SECRET_KEY = "mockSecretKey";

      const result = await authService.login("user1", "password");

      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith(
        "user1",
      );
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword");
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "1", role: "User", fullname: "User One" },
        "mockSecretKey",
        { expiresIn: "7d" },
      );
      expect(result).toEqual({
        id: "1",
        username: "user1",
        email: "user1@example.com",
        role: "User",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: dummyDate,
        modifiedBy: null,
        modifiedOn: dummyDate,
        deletedBy: null,
        deletedOn: null,
        token: mockToken,
      });
    });

    it("should throw an AppError if JWT_SECRET_KEY is not set", async () => {
      const mockUser = {
        id: "1",
        username: "user1",
        password: "hashedPassword",
        email: "user1@example.com",
        role: "User",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: dummyDate,
        modifiedBy: null,
        modifiedOn: dummyDate,
        deletedBy: null,
        deletedOn: null,
      };

      mockUserRepository.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      delete process.env.JWT_SECRET_KEY;

      await expect(authService.login("user1", "password")).rejects.toThrow(
        new AppError("JWT_SECRET_KEY is not set", 500),
      );

      expect(mockUserRepository.getUserByUsername).toHaveBeenCalledWith(
        "user1",
      );
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword");
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
