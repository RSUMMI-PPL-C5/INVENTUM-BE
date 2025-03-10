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

  test("should throw an error if name is empty", async () => {
    const userService = new UserService();

    await expect(userService.searchUser("")).rejects.toThrow(
      "Name query is required",
    );
    await expect(userService.searchUser(undefined as any)).rejects.toThrow(
      "Name query is required",
    );
  });
});
