import { DivisiDTO } from '../../../../src/dto/divisi.dto';
import DivisiRepository from '../../../../src/repository/divisi.repository';

jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn();
  const mockFindUnique = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      listDivisi: {
        create: mockCreate,
        findUnique: mockFindUnique,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
      findUnique: mockFindUnique,
    },
  };
});

const { __mockPrisma: mockPrisma } = jest.requireMock('@prisma/client');

describe('DivisiRepository - ADD', () => {
  let divisiRepository: DivisiRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisiRepository = new DivisiRepository();
  });

  it('should add a new list divisi', async () => {
    const mockNewDivisi: DivisiDTO = {
      id: 2,
      divisi: 'Divisi 2',
      parentId: 1,
    };

    const addData: Partial<DivisiDTO> = {
      divisi: 'Divisi 2',
      parentId: 1,
    };

    mockPrisma.create.mockResolvedValue(mockNewDivisi);

    const result = await divisiRepository.addDivisi(addData);

    expect(mockPrisma.create).toHaveBeenCalledWith({data : addData});
    expect(result).toEqual(mockNewDivisi);
  });

  it('should throw an error if failed to add a new list divisi', async () => {
    const addData: Partial<DivisiDTO> = {
      divisi: 'Divisi 2',
      parentId: 99,
    };

    mockPrisma.create.mockRejectedValue(new Error('Failed to add list divisi'));

    await expect(divisiRepository.addDivisi(addData)).rejects.toThrow('Failed to add list divisi');
  });

  it('should get divisi by id', async () => {
    const mockNewDivisi: DivisiDTO = {
      id: 2,
      divisi: 'Divisi 2',
      parentId: 1,
    };

    mockPrisma.findUnique.mockResolvedValue(mockNewDivisi);

    const result = await divisiRepository.getDivisiById(2);

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(result).toEqual(mockNewDivisi);
  });

  it('should return null if divisi not found', async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result = await divisiRepository.getDivisiById(99);

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({ where: { id: 99 } });
    expect(result).toBeNull();
  });
});