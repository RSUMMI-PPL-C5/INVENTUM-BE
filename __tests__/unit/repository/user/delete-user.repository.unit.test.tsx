import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockUpdate = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        update: mockUpdate,
      },
    })),
    __mockPrisma: {
      update: mockUpdate,
    },
  };
});

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - DELETE", () => {
  let userRepository: UserRepository;
  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
    // Mock the Jakarta time
    mockDate = new Date();
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
  });

  it("should soft delete a user by ID", async () => {
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
      modifiedOn: new Date(),
      deletedBy: "admin",
      deletedOn: mockDate,
    };

    (mockPrisma.update as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.deleteUser("1", "admin");

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        deletedOn: mockDate,
        deletedBy: "admin",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found to delete", async () => {
    (mockPrisma.update as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.deleteUser("999", "admin");

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "999" },
      data: {
        deletedOn: mockDate,
        deletedBy: "admin",
      },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if the delete fails", async () => {
    const errorMessage = "Update failed";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.deleteUser("1", "admin")).rejects.toThrow(
      errorMessage,
    );
    expect(mockPrisma.update).toHaveBeenCalledTimes(1);
  });

  it("should handle edge case when deletedBy is not provided", async () => {
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
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: mockDate,
    };

    (mockPrisma.update as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.deleteUser("1");

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        deletedOn: mockDate,
        deletedBy: undefined,
      },
    });
    expect(result).toEqual(mockUser);
  });
});
