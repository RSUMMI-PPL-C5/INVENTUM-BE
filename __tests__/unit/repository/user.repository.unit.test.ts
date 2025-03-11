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
  });
});
