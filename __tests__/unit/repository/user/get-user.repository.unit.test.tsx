import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";

// Mock Prisma Client
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

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - GET", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  test("should find user by name", async () => {
    const mockUser = [
      { id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" },
    ];
    (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findUsersByName("Azmy");
    expect(result).toEqual(mockUser);
  });

  test("should return an empty array if user is not found by name", async () => {
    (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);

    const result = await userRepository.findUsersByName("John Doe");
    expect(result).toEqual([]);
  });

  it("should return a list of users", async () => {
    const mockUsers: UserDTO[] = [
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
    (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const result = await userRepository.getUsers();

    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(mockUsers.length);
    expect(result[0].id).toBe(mockUsers[0].id);
  });

  it("should return an empty list if no users found", async () => {
    (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);

    const result = await userRepository.getUsers();

    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("should throw an error if the database query fails", async () => {
    const errorMessage = "Database connection error";
    (mockPrisma.findMany as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    await expect(userRepository.getUsers()).rejects.toThrow(errorMessage);
    expect(mockPrisma.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return a user by ID when ID is valid", async () => {
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
      createdBy: 1,
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.getUserById("1");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by ID", async () => {
    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.getUserById("1");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toBeNull();
  });

  it("should return a user by username when username is valid", async () => {
    const mockUser: UserDTO = {
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

    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by username", async () => {
    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toBeNull();
  });
});
