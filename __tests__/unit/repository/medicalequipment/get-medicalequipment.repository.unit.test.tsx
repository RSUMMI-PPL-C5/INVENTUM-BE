import MedicalEquipmentRepository from '../../../../src/repository/medicalequipment.repository';
import prisma from '../../../../src/configs/db.config';

// Mock the prisma client
jest.mock('../../../../src/configs/db.config', () => {
  return {
    __esModule: true,
    default: {
      medicalEquipment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  };
});

describe('MedicalEquipmentRepository', () => {
  let repository: MedicalEquipmentRepository;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MedicalEquipmentRepository();
  });

  describe('getMedicalEquipment', () => {
    // Positive test case
    it('should return all medical equipment', async () => {
      // Arrange
      const mockData = [
        { id: '1', name: 'Stetoskop', status: 'Active' },
        { id: '2', name: 'MRI Machine', status: 'Maintenance' }
      ];
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getMedicalEquipment();

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it('should throw error when database query fails', async () => {
      // Arrange
      const dbError = new Error('Database connection error');
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.getMedicalEquipment()).rejects.toThrow(dbError);
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledTimes(1);
    });

    // Corner case
    it('should return empty array when no equipment exists', async () => {
      // Arrange
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.getMedicalEquipment();

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('getFilteredMedicalEquipment', () => {
    // Positive test case
    it('should return filtered equipment based on where clause', async () => {
      // Arrange
      const whereClause = { status: 'Active' };
      const mockData = [
        { id: '1', name: 'Stetoskop', status: 'Active' },
        { id: '3', name: 'Thermometer', status: 'Active' }
      ];
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getFilteredMedicalEquipment(whereClause);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: whereClause
      });
      expect(result).toEqual(mockData);
    });

    // Complex filter test case
    it('should handle complex filtering criteria', async () => {
      // Arrange
      const whereClause = {
        status: 'Active',
        AND: [
          { name: { contains: 'Machine' } },
          { purchaseDate: { gte: new Date('2023-01-01') } }
        ]
      };
      const mockData = [{ id: '5', name: 'X-Ray Machine', status: 'Active' }];
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getFilteredMedicalEquipment(whereClause);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: whereClause
      });
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it('should throw error when filter query fails', async () => {
      // Arrange
      const whereClause = { status: 'Invalid Status' };
      const dbError = new Error('Invalid filter criteria');
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.getFilteredMedicalEquipment(whereClause)).rejects.toThrow(dbError);
    });

    // Corner case
    it('should return empty array when no equipment matches filters', async () => {
      // Arrange
      const whereClause = { status: 'NonexistentStatus' };
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.getFilteredMedicalEquipment(whereClause);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: whereClause
      });
      expect(result).toEqual([]);
    });
  });

  describe('getMedicalEquipmentById', () => {
    // Positive test case
    it('should return equipment when found by ID', async () => {
      // Arrange
      const id = 'valid-id';
      const mockData = { id, name: 'MRI Machine', status: 'Active' };
      (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getMedicalEquipmentById(id);

      // Assert
      expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
        where: { id }
      });
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it('should return null when equipment not found by ID', async () => {
      // Arrange
      const id = 'non-existent-id';
      (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.getMedicalEquipmentById(id);

      // Assert
      expect(mockPrisma.medicalEquipment.findUnique).toHaveBeenCalledWith({
        where: { id }
      });
      expect(result).toBeNull();
    });

    // Corner case
    it('should throw error when database query by ID fails', async () => {
      // Arrange
      const id = 'error-id';
      const dbError = new Error('Database error');
      (mockPrisma.medicalEquipment.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.getMedicalEquipmentById(id)).rejects.toThrow(dbError);
    });
  });

  describe('getMedicalEquipmentByName', () => {
    // Positive test case
    it('should return equipment that contains the name query', async () => {
      // Arrange
      const nameQuery = 'steto';
      const mockData = [
        { id: '1', name: 'Stetoskop', status: 'Active' }
      ];
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getMedicalEquipmentByName(nameQuery);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: { name: { contains: nameQuery } }
      });
      expect(result).toEqual(mockData);
    });

    // Case sensitivity test
    it('should perform contains search regardless of case', async () => {
      // Arrange
      const nameQuery = 'STETO';
      const mockData = [
        { id: '1', name: 'Stetoskop', status: 'Active' }
      ];
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getMedicalEquipmentByName(nameQuery);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: { name: { contains: nameQuery } }
      });
      expect(result).toEqual(mockData);
    });

    // Negative test case
    it('should throw error when name search query fails', async () => {
      // Arrange
      const nameQuery = 'error-trigger';
      const dbError = new Error('Search query error');
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.getMedicalEquipmentByName(nameQuery)).rejects.toThrow(dbError);
    });

    // Corner case - empty search
    it('should accept empty string as search parameter', async () => {
      // Arrange
      const nameQuery = '';
      const mockData = [
        { id: '1', name: 'Stetoskop', status: 'Active' },
        { id: '2', name: 'MRI Machine', status: 'Maintenance' }
      ];
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue(mockData);

      // Act
      const result = await repository.getMedicalEquipmentByName(nameQuery);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: { name: { contains: nameQuery } }
      });
      expect(result).toEqual(mockData);
    });

    // Corner case - no results
    it('should return empty array when no equipment matches name query', async () => {
      // Arrange
      const nameQuery = 'nonexistent';
      (mockPrisma.medicalEquipment.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.getMedicalEquipmentByName(nameQuery);

      // Assert
      expect(mockPrisma.medicalEquipment.findMany).toHaveBeenCalledWith({
        where: { name: { contains: nameQuery } }
      });
      expect(result).toEqual([]);
    });
  });
});