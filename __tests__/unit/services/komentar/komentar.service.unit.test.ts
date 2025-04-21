import { KomentarDTO } from '../../../../src/dto/komentar.dto';
import KomentarService from '../../../../src/services/komentar.service';
import KomentarRepository from '../../../../src/repository/komentar.repository';

jest.mock('../../../../src/repository/komentar.repository');

describe('KomentarService', () => {
  let komentarService: KomentarService;
  let mockKomentarRepository: jest.Mocked<KomentarRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockKomentarRepository = new KomentarRepository() as jest.Mocked<KomentarRepository>;
    komentarService = new KomentarService();
    (komentarService as any).komentarRepository = mockKomentarRepository;
  });

  describe('addKomentar', () => {
    it('should add a comment successfully', async () => {
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

      mockKomentarRepository.addKomentar.mockResolvedValue(mockComment);

      // Act
      const result = await komentarService.addKomentar(komentarDTO);

      // Assert
      expect(mockKomentarRepository.addKomentar).toHaveBeenCalledWith(komentarDTO);
      expect(result).toEqual(mockComment);
    });

    it('should handle errors when adding a comment', async () => {
      // Arrange
      const errorMessage = 'Database error';
      const komentarDTO: KomentarDTO = {
        text: 'Test comment',
        userId: 'user1'
      };

      mockKomentarRepository.addKomentar.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(komentarService.addKomentar(komentarDTO)).rejects.toThrow(errorMessage);
      expect(mockKomentarRepository.addKomentar).toHaveBeenCalledWith(komentarDTO);
    });
  });
});