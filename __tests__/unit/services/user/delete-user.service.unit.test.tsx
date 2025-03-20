import { UserDTO } from '../../../../src/dto/user.dto';
import UserService from '../../../../src/services/user.service';
import UserRepository from '../../../../src/repository/user.repository';

jest.mock('../../../../src/repository/user.repository');

describe('UserService - DELETE', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository; // Inject mocked repository
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
        deletedOn: null,
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