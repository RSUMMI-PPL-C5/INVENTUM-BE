import { User } from "@prisma/client";
import UserRepository from "../../../src/repository/user.repository";

jest.mock("@prisma/client", () => {
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        update: mockUpdate,
        delete: mockDelete,
      },
    })),
    __mockPrisma: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
});

// Get access to the mocked functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  it("should return a list of users", async () => {
    const mockUsers: User[] = [
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

    const result = await userRepository.getUsers();

    // Assertions
    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(mockUsers.length);
    expect(result[0].id).toBe(mockUsers[0].id);
  });

  it("should return an empty list if no users found", async () => {
    mockPrisma.findMany.mockResolvedValue([]);

    const result = await userRepository.getUsers();

    // Assertions
    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("should throw an error if the database query fails", async () => {
    const errorMessage = "Database connection error";
    mockPrisma.findMany.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.getUsers()).rejects.toThrow(errorMessage);
    expect(mockPrisma.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return a user by ID when ID is valid", async () => {
    const mockUser: User = {
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

    mockPrisma.findUnique.mockResolvedValue(mockUser);

    const result = await userRepository.getUserById("1");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by ID", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result = await userRepository.getUserById("1");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toBeNull();
  });

  it("should return a user by username when username is valid", async () => {
    const mockUser: User = {
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

    mockPrisma.findUnique.mockResolvedValue(mockUser);

    const result = await userRepository.findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by username", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result = await userRepository.findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toBeNull();
  });

  it("should update a user by ID", async () => {
    const mockUser: User = {
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

    const updatedData: Partial<User> = {
      fullname: "Updated User One",
    };

    const updatedUser: User = {
      ...mockUser,
      ...updatedData,
    };

    mockPrisma.update.mockResolvedValue(updatedUser);

    const result = await userRepository.updateUser("1", updatedData);

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
      data: updatedData,
    });
    expect(result).toEqual(updatedUser);
  });

  it("should throw an error if the update fails", async () => {
    const errorMessage = "Update failed";
    mockPrisma.update.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.updateUser("1", { fullname: "Updated User One" })).rejects.toThrow(errorMessage);
    expect(mockPrisma.update).toHaveBeenCalledTimes(1);
  });

  it("should delete a user by ID", async () => {
    const mockUser: User = {
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

    mockPrisma.delete.mockResolvedValue(mockUser);

    const result = await userRepository.deleteUser("1");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found to delete", async () => {
    mockPrisma.delete.mockResolvedValue(null);

    const result = await userRepository.deleteUser("999");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: {
        id: "999",
      },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if the delete fails", async () => {
    const errorMessage = "Delete failed";
    mockPrisma.delete.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.deleteUser("1")).rejects.toThrow(errorMessage);
    expect(mockPrisma.delete).toHaveBeenCalledTimes(1);
  });
});