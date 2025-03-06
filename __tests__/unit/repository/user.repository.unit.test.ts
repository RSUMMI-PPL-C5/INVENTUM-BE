import {PrismaClient, User} from '@prisma/client';
import UserRepository from '../../../src/repository/user.repository';
import { UserDTO } from '../../../src/dto/user.dto';
import { IUserRepository } from '../../../src/repository/interface/user.repository.interface';

jest.mock('@prisma/client', () => {
    const mockFindMany = jest.fn();
    const mockFindUnique = jest.fn();
    
    return {
      PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
          findMany: mockFindMany,
          findUnique: mockFindUnique
        }
      })),
      __mockPrisma: {
        findMany: mockFindMany,
        findUnique: mockFindUnique
      }
    };
  });
  
  // Get access to the mocked functions
  const mockPrisma = (jest.requireMock('@prisma/client') as any).__mockPrisma;

  describe('UserRepository', () => {

    let userRepository: IUserRepository;
  
    beforeEach(() => {
        jest.clearAllMocks();
        userRepository = new UserRepository();
    });

    it('should return a list of users', async () => {
        const mockUsers = [
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
              deletedOn: null
            },
            { 
              id: '2', 
              email: 'user2@example.com', 
              username: 'user2', 
              password: 'hashedpwd2',
              role: 'ADMIN',
              fullname: 'User Two',
              nokar: '67890',
              divisiId: 2,
              waNumber: '987654321',
              createdBy: 1,
              createdOn: new Date(),
              modifiedBy: null,
              modifiedOn: new Date(),
              deletedBy: null,
              deletedOn: null
            }
          ];
        mockPrisma.findMany.mockResolvedValue(mockUsers);

        const result = await new UserRepository().getUsers();

        //assertions
        expect(mockPrisma.findMany).toHaveBeenCalled();
        expect(result).toEqual(mockUsers);  
        expect(result.length).toBe(mockUsers.length);
        expect(result[0].id).toBe(mockUsers[0].id);
    });

    it('should return an empty list if no users found', async () => {
        mockPrisma.findMany.mockResolvedValue([]);

        const result = await new UserRepository().getUsers();

        //assertions
        expect(mockPrisma.findMany).toHaveBeenCalled();
        expect(result).toEqual([]);  
        expect(result.length).toBe(0);
    });

    it('should throw an error if the database query fails', async () => {
        // Arrange
        const errorMessage = 'Database connection error';
        mockPrisma.findMany.mockRejectedValue(new Error(errorMessage));
        
        await expect(userRepository.getUsers()).rejects.toThrow(errorMessage);
        expect(mockPrisma.findMany).toHaveBeenCalledTimes(1);
      });

    it('should return a user by username when username is valid', async () => {
        const mockUser = { 
            id: '1', 
            email: 'user1@example.com', 
            username: 'testuser', 
            password: 'hashedpwd',
            role: 'USER',
            fullname: 'Test User',
            nokar: '12345',
            divisiId: 1,
            waNumber: '123456789',
            createdBy: 1,
            createdOn: new Date(),
            modifiedBy: null,
            modifiedOn: new Date(),
            deletedBy: null,
            deletedOn: null
        }

        mockPrisma.findUnique.mockResolvedValue(mockUser);
        
        const result = await new UserRepository().findByUsername('testuser');

        expect(mockPrisma.findUnique).toHaveBeenCalledWith({
            where: {
                username : 'testuser'}
            });
        expect(result).toEqual(mockUser); 
    });

    it('should return null if no user found by username', async () => {
        mockPrisma.findUnique.mockResolvedValue(null);

        const result = await new UserRepository().findByUsername('testuser');

        expect(mockPrisma.findUnique).toHaveBeenCalledWith({
            where: {
                username : 'testuser'}
            });
        expect(result).toBeNull();
    });

  });
