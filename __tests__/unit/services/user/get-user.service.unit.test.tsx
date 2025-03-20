import UserService from "../../../../src/services/user.service";
import UserRepository from "../../../../src/repository/user.repository";
import { Prisma } from "@prisma/client";

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
  
    it("should return all users", async () => {
      const mockUsers = [
        {
          id: "1",
          fullname: "User One",
          email: "userone@example.com",
          username: "userone",
          password: "password123",
          role: null,
          nokar: "123",
          divisiId: null,
          waNumber: null,
          createdBy: 1,
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];
      mockUserRepository.getUsers.mockResolvedValue(mockUsers);
  
      const result = await userService.getUsers();
  
      expect(mockUserRepository.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  
    it("should return a user by ID", async () => {
      const mockUser = {
        id: "1",
        fullname: "User One",
        email: "userone@example.com",
        username: "userone",
        password: "password123",
        role: null,
        nokar: "123",
        divisiId: null,
        waNumber: null,
        createdBy: 1,
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
  
    it("should search users by name", async () => {
      const mockUsers = [
        {
          id: "1",
          fullname: "User One",
          email: "userone@example.com",
          username: "userone",
          password: "password123",
          role: null,
          nokar: "123",
          divisiId: null,
          waNumber: null,
          createdBy: 1,
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ];
      mockUserRepository.findUsersByName.mockResolvedValue(mockUsers);
  
      const result = await userService.searchUser("User");
  
      expect(mockUserRepository.findUsersByName).toHaveBeenCalledWith("User");
      expect(result).toEqual(mockUsers);
    });
  
    it("should throw an error if search query is empty", async () => {
      await expect(userService.searchUser("")).rejects.toThrow("Name query is required");
      expect(mockUserRepository.findUsersByName).not.toHaveBeenCalled();
    });

    it("should return filtered users based on filters", async () => {
        const mockFilters = { role: ["ADMIN"], divisiId: [1] }; // Updated divisiId to be an array
        const mockWhereClause: Prisma.UserWhereInput = {
          role: { in: ["ADMIN"] },
          divisiId: { in: [1] },
        };
        const mockUsers = [
          {
            id: "1",
            fullname: "Admin User",
            email: "admin@example.com",
            username: "adminuser",
            password: "hashedPassword",
            role: "ADMIN",
            nokar: "12345",
            divisiId: 1,
            waNumber: "1234567890",
            createdBy: 1,
            createdOn: new Date(),
            modifiedBy: null,
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null,
          },
        ];
      
        mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers);
      
        const result = await userService.getFilteredUsers(mockFilters);
      
        expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith(mockWhereClause);
        expect(result).toEqual(mockUsers);
      });
    
      it("should return all users if no filters are provided", async () => {
        const mockFilters = { role: ["USER"] }; // Updated role to be an array
        const mockWhereClause: Prisma.UserWhereInput = {
          role: { in: ["USER"] }, // Adjusted to match Prisma's `in` filter for arrays
        };
        const mockUsers = [
          {
            id: "1",
            fullname: "User One",
            email: "userone@example.com",
            username: "userone",
            password: "hashedPassword",
            role: "USER",
            nokar: "12345",
            divisiId: null,
            waNumber: null,
            createdBy: 1,
            createdOn: new Date(),
            modifiedBy: null,
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null,
          },
        ];
      
        mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers);
      
        const result = await userService.getFilteredUsers(mockFilters);
      
        expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith(mockWhereClause);
        expect(result).toEqual(mockUsers);
      });
    
      it("should handle empty results when no users match the filters", async () => {
        const mockFilters = { role: ["NON_EXISTENT_ROLE"] }; // Role is an array
        const mockWhereClause: Prisma.UserWhereInput = {
          role: { in: ["NON_EXISTENT_ROLE"] }, // Updated to use Prisma's `in` filter
        };
      
        mockUserRepository.getFilteredUsers.mockResolvedValue([]); // Mock empty result
      
        const result = await userService.getFilteredUsers(mockFilters);
      
        expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith(mockWhereClause);
        expect(result).toEqual([]); // Expect empty result
      });
    
      it("should call filterHandlers to build the where clause", async () => {
        const mockFilters = { role: ["USER"], divisiId: [2] };
        const mockWhereClause: Prisma.UserWhereInput = {
          role: { in: ["USER"] }, // Updated to use Prisma's `in` filter
          divisiId: { in: [2] }, // Updated to use Prisma's `in` filter
        };
        const mockUsers = [
          {
            id: "2",
            fullname: "User Two",
            email: "usertwo@example.com",
            username: "usertwo",
            password: "hashedPassword",
            role: "USER",
            nokar: "67890",
            divisiId: 2,
            waNumber: "9876543210",
            createdBy: 1,
            createdOn: new Date(),
            modifiedBy: null,
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null,
          },
        ];
      
        // Mock filterHandlers behavior
        const filterHandlers = [
          (filters: any, whereClause: Prisma.UserWhereInput) => {
            if (filters.role) whereClause.role = { in: filters.role }; // Updated to use Prisma's `in` filter
          },
          (filters: any, whereClause: Prisma.UserWhereInput) => {
            if (filters.divisiId) whereClause.divisiId = { in: filters.divisiId }; // Updated to use Prisma's `in` filter
          },
        ];
      
        filterHandlers.forEach((handler) => handler(mockFilters, mockWhereClause));
        mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers);
      
        const result = await userService.getFilteredUsers(mockFilters);
      
        expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith(mockWhereClause);
        expect(result).toEqual(mockUsers);
      });
});