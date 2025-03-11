import UserService from "../../../src/services/user.service";
import UserRepository from "../../../src/repository/user.repository";

jest.mock("../../../src/repository/user.repository");

describe("User Service", () => {
  const mockFindUsersByName = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (UserRepository as jest.Mock).mockImplementation(() => ({
      findUsersByName: mockFindUsersByName,
    }));
  });

  test("should return users when found", async () => {
    const mockUsers = [
      { id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" },
    ];
    mockFindUsersByName.mockResolvedValue(mockUsers);

    const userService = new UserService();
    const result = await userService.searchUser("Azmy");

    expect(mockFindUsersByName).toHaveBeenCalledWith("Azmy");
    expect(result).toEqual(mockUsers);
  });

  test("should return empty array if no users found", async () => {
    mockFindUsersByName.mockResolvedValue([]);

    const userService = new UserService();
    const result = await userService.searchUser("Unknown");

    expect(mockFindUsersByName).toHaveBeenCalledWith("Unknown");
    expect(result).toEqual([]);
  });

  test("should throw an error if name is empty string", async () => {
    const userService = new UserService();

    await expect(userService.searchUser("")).rejects.toThrow(
      "Name query is required",
    );
    expect(mockFindUsersByName).not.toHaveBeenCalled();
  });

  test("should throw an error if name is undefined", async () => {
    const userService = new UserService();

    await expect(userService.searchUser(undefined as any)).rejects.toThrow(
      "Name query is required",
    );
    expect(mockFindUsersByName).not.toHaveBeenCalled();
  });

  test("should throw an error if name is null", async () => {
    const userService = new UserService();

    await expect(userService.searchUser(null as any)).rejects.toThrow(
      "Name query is required",
    );
    expect(mockFindUsersByName).not.toHaveBeenCalled();
  });

  test("should handle repository errors properly", async () => {
    const errorMessage = "Database connection failed";
    mockFindUsersByName.mockRejectedValue(new Error(errorMessage));

    const userService = new UserService();

    await expect(userService.searchUser("Azmy")).rejects.toThrow(errorMessage);
    expect(mockFindUsersByName).toHaveBeenCalledWith("Azmy");
  });

  test("should trim spaces around the search query", async () => {
    const mockUsers = [
      { id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" },
    ];
    mockFindUsersByName.mockResolvedValue(mockUsers);

    const userService = new UserService();
    const result = await userService.searchUser("   Azmy   ");

    expect(mockFindUsersByName).toHaveBeenCalledWith("Azmy");
    expect(result).toEqual(mockUsers);
  });
});
