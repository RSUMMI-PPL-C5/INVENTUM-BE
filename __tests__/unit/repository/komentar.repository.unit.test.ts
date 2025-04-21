import { PrismaClient } from '@prisma/client';
import { KomentarDTO } from '../../../src/dto/komentar.dto';
import KomentarRepository from '../../../src/repository/komentar.repository';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      komentar: {
        create: mockCreate
      }
    }))
  };
});

describe('KomentarRepository', () => {
  let komentarRepository: KomentarRepository;
  let mockPrismaClient: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    komentarRepository = new KomentarRepository();
    mockPrismaClient = new PrismaClient() as unknown as jest.Mocked<PrismaClient>;
  });

  describe('addKomentar', () => {
    it('should create a comment in the database', async () => {
      // Arrange
      const mockComment = {
        id: '1',
        text: 'Test comment',
        userId: 'user1',
        requestId: null,
        createdAt: new Date(),
        modifiedAt: new Date()
      };
      
      const komentarDTO: KomentarDTO = {
        text: 'Test comment',
        userId: 'user1'
      };
      
      // Get the mocked create function and set its implementation
      const mockCreate = (mockPrismaClient.komentar.create as jest.Mock);
      mockCreate.mockResolvedValue(mockComment);

      // Act
      const result = await komentarRepository.addKomentar(komentarDTO);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          text: komentarDTO.text,
          userId: komentarDTO.userId,
          createdAt: expect.any(Date)
        }
      });
      expect(result).toEqual(mockComment);
    });
  });
});