<<<<<<< HEAD
import { IUserService } from "../../../src/services/interface/user.service.interface";
import UserService from "../../../src/services/user.service";
import { UserFilterOptions } from "../../../src/filters/interface/user.filter.interface";

describe("UserService", () => {
  let userService: IUserService;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      getFilteredUsers: jest.fn(),
    };

    userService = new UserService(mockUserRepository);
  });

  describe("getFilteredUsers", () => {
    const mockUsers = [
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
        createdOn: new Date("2022-01-02"),
        modifiedBy: null,
        modifiedOn: new Date("2022-01-04"),
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
        createdOn: new Date("2023-01-03"),
        modifiedBy: null,
        modifiedOn: new Date("2023-01-05"),
        deletedBy: null,
        deletedOn: null,
      },
    ];

    it("should apply role filters", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers[0]);

      const filters: UserFilterOptions = {
        role: ["USER", "ASESOR"],
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        role: {
          in: ["USER", "ASESOR"],
        },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should apply division filters", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers[1]);

      const filters: UserFilterOptions = {
        divisiId: [2, 3],
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        divisiId: {
          in: [2, 3],
        },
      });
      expect(result).toEqual(mockUsers[1]);
    });

    it("should apply createdOn filters with start and end", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers[0]);

      const filters: UserFilterOptions = {
        createdOnStart: new Date("2022-01-01"),
        createdOnEnd: new Date("2022-01-03"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        createdOn: {
          gte: new Date("2022-01-01"),
          lte: new Date("2022-01-03"),
        },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should apply createdOn filters with start only", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers);

      const filters: UserFilterOptions = {
        createdOnStart: new Date("2022-01-01"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        createdOn: {
          gte: new Date("2022-01-01"),
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should apply createdOn filters with end only", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers[0]);

      const filters: UserFilterOptions = {
        createdOnEnd: new Date("2022-01-03"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        createdOn: {
          lte: new Date("2022-01-03"),
        },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should apply modifiedOn filters with start and end", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers[1]);

      const filters: UserFilterOptions = {
        modifiedOnStart: new Date("2023-01-04"),
        modifiedOnEnd: new Date("2023-01-06"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        modifiedOn: {
          gte: new Date("2023-01-04"),
          lte: new Date("2023-01-06"),
        },
      });
      expect(result).toEqual(mockUsers[1]);
    });

    it("should apply modifiedOn filters with start only", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers[1]);

      const filters: UserFilterOptions = {
        modifiedOnStart: new Date("2023-01-04"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        modifiedOn: {
          gte: new Date("2023-01-04"),
        },
      });
      expect(result).toEqual(mockUsers[1]);
    });

    it("should apply modifiedOn filters with end only", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers);

      const filters: UserFilterOptions = {
        modifiedOnEnd: new Date("2022-01-05"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        modifiedOn: {
          lte: new Date("2022-01-05"),
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should apply multiple filters", async () => {
      mockUserRepository.getFilteredUsers.mockResolvedValue(mockUsers);

      const filters: UserFilterOptions = {
        role: ["USER", "ASESOR"],
        divisiId: [1, 2],
        createdOnStart: new Date("2022-01-01"),
        createdOnEnd: new Date("2022-01-03"),
        modifiedOnStart: new Date("2022-01-03"),
        modifiedOnEnd: new Date("2022-01-05"),
      };

      const result = await userService.getFilteredUsers(filters);

      expect(mockUserRepository.getFilteredUsers).toHaveBeenCalledWith({
        role: {
          in: ["USER", "ASESOR"],
        },
        divisiId: {
          in: [1, 2],
        },
        createdOn: {
          gte: new Date("2022-01-01"),
          lte: new Date("2022-01-03"),
        },
        modifiedOn: {
          gte: new Date("2022-01-03"),
          lte: new Date("2022-01-05"),
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });
});
=======
import { UserDTO } from '../../../src/dto/user.dto';
import bcrypt from 'bcrypt';
import UserService from '../../../src/services/user.service';
import UserRepository from '../../../src/repository/user.repository';

jest.mock('../../../src/repository/user.repository');
jest.mock('bcrypt');

const mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository);
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers: UserDTO[] = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          password: 'hashedpwd1',
          role: 'USER',
          fullname: 'User One',
          nokar: '12345',
          divisiId: 1,
          waNumber: '123456789',
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
  
    it('should return an empty list if no users are found', async () => {
      mockUserRepository.getUsers.mockResolvedValue([]);
  
      const result = await userService.getUsers();
  
      expect(mockUserRepository.getUsers).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  
    it('should handle errors thrown by the repository', async () => {
      const errorMessage = 'Database error';
      mockUserRepository.getUsers.mockRejectedValue(new Error(errorMessage));
  
      await expect(userService.getUsers()).rejects.toThrow(errorMessage);
      expect(mockUserRepository.getUsers).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser: UserDTO = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        password: 'hashedpwd1',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: 1,
        waNumber: '123456789',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };
      mockUserRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.getUserById.mockResolvedValue(null);

      const result = await userService.getUserById('1');

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user without password', async () => {
      const mockUser: UserDTO = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        password: 'hashedpwd1',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: 1,
        waNumber: '123456789',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };
      const updatedData: Partial<UserDTO> = {
        fullname: 'Updated User One',
        modifiedBy: 1,
      };
      const updatedUser: UserDTO = {
        ...mockUser,
        ...updatedData,
        modifiedOn: new Date(),
      };

      mockUserRepository.getUserById.mockResolvedValue(mockUser);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updatedData);

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('1', {
        ...updatedData,
        modifiedOn: expect.any(Date),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update a user with password', async () => {
      const mockUser: UserDTO = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        password: 'hashedpwd1',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: 1,
        waNumber: '123456789',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };
      const updatedData: Partial<UserDTO> = {
        fullname: 'Updated User One',
        password: 'newpassword',
        modifiedBy: 1,
      };
      const updatedUser: UserDTO = {
        ...mockUser,
        ...updatedData,
        password: 'hashednewpassword',
        modifiedOn: new Date(),
      };

      mockUserRepository.getUserById.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('hashednewpassword' as unknown as never);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updatedData);

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('1', {
        ...updatedData,
        password: 'hashednewpassword',
        modifiedOn: expect.any(Date),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.getUserById.mockResolvedValue(null);

      const result = await userService.updateUser('1', { fullname: 'Updated User One', modifiedBy: 1 });

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(result).toBeNull();
    });

    it('should return null if data is invalid', async () => {
      const mockUser: UserDTO = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        password: 'hashedpwd1',
        role: 'USER',
        fullname: 'User One',
        nokar: '12345',
        divisiId: 1,
        waNumber: '123456789',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null,
      };

      mockUserRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.updateUser('1', { fullname: 'Up', modifiedBy: 1 });

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(result).toBeNull();
    });
  });

  describe('validateUserData', () => {
    it('should return true for valid data', () => {
      const validData: Partial<UserDTO> = {
        fullname: 'Valid User',
        role: 'USER',
        divisiId: 1,
        modifiedBy: 1,
      };

      const result = (userService as any).validateUserData(validData);

      expect(result).toBe(true);
    });

    it('should return false if modifiedBy is undefined', () => {
      const invalidData: Partial<UserDTO> = {
        fullname: 'Valid User',
        role: 'USER',
        divisiId: 1,
      };

      const result = (userService as any).validateUserData(invalidData);

      expect(result).toBe(false);
    });

    it('should return false if fullname is less than 3 characters', () => {
      const invalidData: Partial<UserDTO> = {
        fullname: 'Up',
        role: 'USER',
        divisiId: 1,
        modifiedBy: 1,
      };

      const result = (userService as any).validateUserData(invalidData);

      expect(result).toBe(false);
    });

    it('should return false if role is not a string', () => {
      const invalidData: Partial<UserDTO> = {
        fullname: 'Valid User',
        role: 123 as any,
        divisiId: 1,
        modifiedBy: 1,
      };

      const result = (userService as any).validateUserData(invalidData);

      expect(result).toBe(false);
    });

    it('should return false if divisiId is not a number', () => {
      const invalidData: Partial<UserDTO> = {
        fullname: 'Valid User',
        role: 'USER',
        divisiId: 'one' as any,
        modifiedBy: 1,
      };

      const result = (userService as any).validateUserData(invalidData);

      expect(result).toBe(false);
    });

    it('should return true if role is undefined', () => {
      const validData: Partial<UserDTO> = {
        fullname: 'Valid User',
        divisiId: 1,
        modifiedBy: 1,
      };

      const result = (userService as any).validateUserData(validData);

      expect(result).toBe(true);
    });

    it('should return true if divisiId is undefined', () => {
      const validData: Partial<UserDTO> = {
        fullname: 'Valid User',
        role: 'USER',
        modifiedBy: 1,
      };

      const result = (userService as any).validateUserData(validData);

      expect(result).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      const mockUser: UserDTO = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        password: 'password1',
        role: '1',
        fullname: 'User One',
        nokar: '123',
        divisiId: 1,
        waNumber: '1234567890',
        createdBy: 1,
        createdOn: new Date(),
        modifiedBy: 1,
        modifiedOn: new Date(),
        deletedBy: null,
        deletedOn: null
      };

      mockUserRepository.deleteUser.mockResolvedValue(mockUser);

      const result = await userService.deleteUser('1');

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.deleteUser.mockResolvedValue(null);

      const result = await userService.deleteUser('999');

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      mockUserRepository.deleteUser.mockRejectedValue(new Error(errorMessage));

      await expect(userService.deleteUser('1')).rejects.toThrow(errorMessage);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('1');
    });
  });
});
>>>>>>> staging
