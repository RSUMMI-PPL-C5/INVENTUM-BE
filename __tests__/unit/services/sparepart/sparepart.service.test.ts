// __tests__/unit/services/sparepart/sparepart.service.unit.test.ts
import SparepartService from '../../../../src/services/sparepart.service';
import SparepartRepository from '../../../../src/repository/sparepart.repository';

// Mock the repository
jest.mock('../../../../src/repository/sparepart.repository');

describe('SparepartService', () => {
  let sparepartService: SparepartService;
  let mockSparepartRepository: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock repository
    mockSparepartRepository = new SparepartRepository() as jest.Mocked<SparepartRepository>;
    
    // Create service instance with mocked repository
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = mockSparepartRepository;
  });

  describe('getSpareparts', () => {
    it('should return all spareparts', async () => {
      const mockSpareparts = [
        { 
          id: '1', 
          partsName: 'Test Part 1',
          purchaseDate: new Date(),
          price: 100,
          toolLocation: 'Location 1',
          toolDate: '2025-03-24'
        },
        { 
          id: '2', 
          partsName: 'Test Part 2',
          purchaseDate: new Date(),
          price: 200,
          toolLocation: 'Location 2',
          toolDate: '2025-03-24'
        }
      ];

      mockSparepartRepository.getSpareparts = jest.fn().mockResolvedValue(mockSpareparts);

      const result = await sparepartService.getSpareparts();

      expect(mockSparepartRepository.getSpareparts).toHaveBeenCalled();
      expect(result).toEqual(mockSpareparts);
    });

    it('should throw an error if repository fails', async () => {
      const errorMessage = 'Database error';
      mockSparepartRepository.getSpareparts = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(sparepartService.getSpareparts()).rejects.toThrow(errorMessage);
    });
  });

  describe('getSparepartById', () => {
    it('should return a sparepart by ID', async () => {
      const mockSparepart = { 
        id: '1', 
        partsName: 'Test Part 1',
        purchaseDate: new Date(),
        price: 100,
        toolLocation: 'Location 1',
        toolDate: '2025-03-24'
      };

      mockSparepartRepository.getSparepartById = jest.fn().mockResolvedValue(mockSparepart);

      const result = await sparepartService.getSparepartById('1');

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockSparepart);
    });

    it('should return null if sparepart not found', async () => {
      mockSparepartRepository.getSparepartById = jest.fn().mockResolvedValue(null);

      const result = await sparepartService.getSparepartById('999');

      expect(mockSparepartRepository.getSparepartById).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });

    it('should throw an error if repository fails', async () => {
      const errorMessage = 'Database error';
      mockSparepartRepository.getSparepartById = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(sparepartService.getSparepartById('1')).rejects.toThrow(errorMessage);
    });
  });
});