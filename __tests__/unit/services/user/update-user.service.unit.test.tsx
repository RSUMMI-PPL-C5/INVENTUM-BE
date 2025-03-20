import { UserDTO } from '../../../../src/dto/user.dto';
import bcrypt from 'bcrypt';
import UserService from '../../../../src/services/user.service';
import UserRepository from '../../../../src/repository/user.repository';

jest.mock('../../../../src/repository/user.repository');
jest.mock('bcrypt');

describe('UserService - UPDATE', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository; // Inject mocked repository
  });

  describe('updateUser', () => {
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
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashednewpassword');
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updatedData);

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('1');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('1', {
        ...updatedData,
        password: 'hashednewpassword',
        modifiedOn: expect.any(Date),
      });
      expect(result).toEqual(updatedUser);
    });

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
});