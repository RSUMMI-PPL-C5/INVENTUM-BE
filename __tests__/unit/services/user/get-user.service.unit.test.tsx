import UserService from "../../../../src/services/user.service";
import UserRepository from "../../../../src/repository/user.repository";

jest.mock("../../../../src/repository/user.repository");

describe("UserService - GET", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
  });

  describe("getUsers", () => {
    it("should return paginated users with metadata", async () => {
      const mockUsers = [
        {
          id: "1",
          fullname: "User One",
          email: "userone@example.com",
          username: "userone",
          password: "hashedPassword",
          role: "USER",
          nokar: "12345",
          divisiId: 1,
          divisi: {
            id: 1,
            divisi: "Division One",
            parentId: null,
          },
          waNumber: "1234567890",
          createdBy: "1",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];
      const mockPagination = { page: 1, limit: 10 };
      const mockFilters = { role: ["USER"] };
      const mockSearch = "User";
      const mockTotal = 1;

      mockUserRepository.getUsers.mockResolvedValue({
        users: mockUsers,
        total: mockTotal,
      });

      const result = await userService.getUsers(
        mockSearch,
        mockFilters,
        mockPagination,
      );

      expect(mockUserRepository.getUsers).toHaveBeenCalledWith(
        mockSearch,
        mockFilters,
        mockPagination,
      );
      expect(result).toEqual({
        data: mockUsers,
        meta: {
          total: mockTotal,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should return all users if no pagination is provided", async () => {
      const mockUsers = [
        {
          id: "1",
          fullname: "User One",
          email: "userone@example.com",
          username: "userone",
          password: "hashedPassword",
          role: "USER",
          nokar: "12345",
          divisiId: 1,
          divisi: {
            id: 1,
            divisi: "Division One",
            parentId: null,
          },
          waNumber: "1234567890",
          createdBy: "1",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];
      const mockFilters = { role: ["USER"] };
      const mockSearch = "User";
      const mockTotal = 1;

      mockUserRepository.getUsers.mockResolvedValue({
        users: mockUsers,
        total: mockTotal,
      });

      const result = await userService.getUsers(mockSearch, mockFilters);

      expect(mockUserRepository.getUsers).toHaveBeenCalledWith(
        mockSearch,
        mockFilters,
        undefined,
      );
      expect(result).toEqual({
        data: mockUsers,
        meta: {
          total: mockTotal,
          page: 1,
          limit: mockUsers.length,
          totalPages: 1,
        },
      });
    });

    it("should handle empty results", async () => {
      const mockFilters = { role: ["NON_EXISTENT_ROLE"] };
      const mockSearch = "NonExistent";
      const mockTotal = 0;

      mockUserRepository.getUsers.mockResolvedValue({
        users: [],
        total: mockTotal,
      });

      const result = await userService.getUsers(mockSearch, mockFilters);

      expect(mockUserRepository.getUsers).toHaveBeenCalledWith(
        mockSearch,
        mockFilters,
        undefined,
      );
      expect(result).toEqual({
        data: [],
        meta: {
          total: mockTotal,
          page: 1,
          limit: 0,
          totalPages: 1,
        },
      });
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      const mockUser = {
        id: "1",
        fullname: "User One",
        email: "userone@example.com",
        username: "userone",
        password: "hashedPassword",
        role: "USER",
        nokar: "12345",
        divisiId: 1,
        waNumber: "1234567890",
        createdBy: "1",
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };

      mockUserRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById("1");

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found by ID", async () => {
      mockUserRepository.getUserById.mockResolvedValue(null);

      const result = await userService.getUserById("999");

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith("999");
      expect(result).toBeNull();
    });
  });
});
