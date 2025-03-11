<<<<<<< HEAD
import { PrismaClient, User } from "@prisma/client";
import UserRepository from "../../../src/repository/user.repository";
import { UserDTO } from "../../../src/dto/user.dto";

jest.mock("@prisma/client", () => {
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
      },
    })),
    __mockPrisma: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
    },
  };
});

// Get access to the mocked functions
const mockPrisma = (jest.requireMock("@prisma/client") as any).__mockPrisma;

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  it("should return a list of users", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "user1@example.com",
        username: "user1",
        password: "hashedpwd1",
        role: "USER",
        fullname: "User One",
        nokar: "12345",
        divisiId: 1,
        waNumber: "123456789",
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      },
      {
        id: "2",
        email: "user2@example.com",
        username: "user2",
        password: "hashedpwd2",
        role: "ADMIN",
        fullname: "User Two",
        nokar: "67890",
        divisiId: 2,
        waNumber: "987654321",
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      },
    ];
    mockPrisma.findMany.mockResolvedValue(mockUsers);

    const result = await new UserRepository().getUsers();

    //assertions
    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(mockUsers.length);
    expect(result[0].id).toBe(mockUsers[0].id);
  });

  it("should return an empty list if no users found", async () => {
    mockPrisma.findMany.mockResolvedValue([]);

    const result = await new UserRepository().getUsers();

    //assertions
    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("should throw an error if the database query fails", async () => {
    // Arrange
    const errorMessage = "Database connection error";
    mockPrisma.findMany.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.getUsers()).rejects.toThrow(errorMessage);
    expect(mockPrisma.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return a user by username when username is valid", async () => {
    const mockUser = {
      id: "1",
      email: "user1@example.com",
      username: "testuser",
      password: "hashedpwd",
      role: "USER",
      fullname: "Test User",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
=======
<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";
import UserRepository from "../../../src/repository/user.repository";

jest.mock("@prisma/client", () => {
  const prismaMock = {
    user: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => prismaMock) };
});

const prisma = new PrismaClient();
const userRepository = new UserRepository();

describe("User Repository", () => {
  test("should find user by name", async () => {
    const mockUser = [
      { id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" },
    ];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findUsersByName("Azmy");
    expect(result).toEqual(mockUser);
  });

  test("should return an empty array if user is not found", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    const result = await userRepository.findUsersByName("John Doe");
    expect(result).toEqual([]);
=======
import { PrismaClient, User } from "@prisma/client";
import UserRepository from "../../../src/repository/user.repository"

jest.mock("@prisma/client", () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = new PrismaClient();
    userRepository = new UserRepository();
  });

  it("should find a user by username", async () => {
    const mockUser: User = {
      id: "123",
      email: "test@example.com",
      username: "testuser",
      password: "hashedpassword",
      role: "admin",
      fullname: "Test User",
      nokar: "",
      divisiId: 1,
      waNumber: "08123456789",
>>>>>>> staging
      createdBy: 1,
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

<<<<<<< HEAD
    mockPrisma.findUnique.mockResolvedValue(mockUser);

    const result = await new UserRepository().findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by username", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result = await new UserRepository().findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toBeNull();
  });

  describe("Get filtered users", () => {
    it("should return users matching the filter", async () => {
      const mockUser = {
        id: "1",
        email: "user1@example.com",
        username: "testuser",
        password: "hashedpwd",
        role: "USER",
        fullname: "Test User",
        nokar: "12345",
        divisiId: 1,
        waNumber: "123456789",
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };

      mockPrisma.findMany.mockResolvedValue([mockUser]);

      const whereClause = {
        role: { in: ["USER"] },
        divisiId: { in: [1] },
      };
      const result = await userRepository.getFilteredUsers(whereClause);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: whereClause,
      });
      expect(result[0]).toEqual(mockUser);
    });

    it("should return empty array if no users match the filter", async () => {
      mockPrisma.findMany.mockResolvedValue([]);

      const whereClause = {
        role: { in: ["USER"] },
        divisiId: { in: [10] },
      };
      const result = await userRepository.getFilteredUsers(whereClause);
      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: whereClause,
      });
      expect(result).toEqual([]);
    });
=======
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const user = await userRepository.findByUsername("testuser");
    expect(user).toEqual(mockUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: "testuser" },
    });
  });

  it("should return null when user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const user = await userRepository.findByUsername("nonexistent");
    expect(user).toBeNull();
>>>>>>> staging
>>>>>>> staging
  });
});
