import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockDelete = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        delete: mockDelete,
      },
    })),
    __mockPrisma: {
      delete: mockDelete,
    },
  };
});

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - DELETE", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  it("should delete a user by ID", async () => {
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

    (mockPrisma.delete as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.deleteUser("1");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found to delete", async () => {
    (mockPrisma.delete as jest.Mock).mockResolvedValue(null);

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
    (mockPrisma.delete as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.deleteUser("1")).rejects.toThrow(errorMessage);
    expect(mockPrisma.delete).toHaveBeenCalledTimes(1);
  });
});
