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
  });
});
