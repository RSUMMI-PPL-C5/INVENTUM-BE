import DivisiRepository from '../../../../src/repository/divisi.repository';
import { DivisiDTO } from '../../../../src/dto/divisi.dto';

jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      listDivisi: {
        create: mockCreate,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
    },
  };
});

const { __mockPrisma: mockPrisma } = jest.requireMock('@prisma/client');

describe('Add Divisi', () => {
  let divisiRepository: DivisiRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisiRepository = new DivisiRepository();
  });

  it('should add a new list divisi', async () => {
    const mockListDivisi: DivisiDTO = {
      id: 2,
      divisi: 'Divisi 2',
      parentId: 1,
    };

    const addData: Partial<DivisiDTO> = {
      divisi: 'Divisi 2',
      parentId: 1,
    };

    mockPrisma.create.mockResolvedValue(mockListDivisi);

    const result = await divisiRepository.addDivisi(addData);

    expect(mockPrisma.create).toHaveBeenCalledWith({data : addData});
    expect(result).toEqual(mockListDivisi);
  });

  it('should throw an error if failed to add a new list divisi', async () => {
    const addData: Partial<DivisiDTO> = {
      divisi: 'Divisi 2',
      parentId: 99,
    };

    mockPrisma.create.mockRejectedValue(new Error('Failed to add list divisi'));

    await expect(divisiRepository.addDivisi(addData)).rejects.toThrow('Failed to add list divisi');
  });
});