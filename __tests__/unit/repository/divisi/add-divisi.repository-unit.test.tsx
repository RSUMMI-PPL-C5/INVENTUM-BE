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

describe('Create Divisi', () => {
  let divisiRepository: DivisiRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisiRepository = new DivisiRepository();
  });

  it('should create a new list divisi', async () => {
    const mockListDivisi: DivisiDTO = {
      id: 2,
      divisi: 'Divisi 2',
      parentId: 1,
    };

    const createData: Partial<DivisiDTO> = {
      divisi: 'Divisi 2',
      parentId: 1,
    };

    mockPrisma.create.mockResolvedValue(mockListDivisi);

    const result = await divisiRepository.createDivisi(createData);

    expect(mockPrisma.create).toHaveBeenCalledWith({data : createData});
    expect(result).toEqual(mockListDivisi);
  });

  it('should throw an error if failed to create a new list divisi', async () => {
    const createData: Partial<DivisiDTO> = {
      divisi: 'Divisi 2',
      parentId: 99,
    };

    mockPrisma.create.mockRejectedValue(new Error('Failed to create list divisi'));

    await expect(divisiRepository.createDivisi(createData)).rejects.toThrow('Failed to create list divisi');
  });
});