import { IUserService } from "../../../src/services/interface/user.service.interface";
import UserService from "../../../src/services/user.service";
import { UserFilterOptions } from "../../../src/services/filters/interface/user.filter.interface";

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
