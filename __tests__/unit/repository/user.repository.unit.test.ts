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
      createdBy: 1,
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

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
  });
});
