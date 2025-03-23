import { Request, Response } from 'express';
import DivisiService from '../../../../src/services/divisi.service';
import DivisiController from '../../../../src/controllers/divisi.controller';

jest.mock('../../../../src/services/divisi.service');

describe('DivisiController - ADD', () => {
  let divisiController: DivisiController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDivisiService: jest.Mocked<DivisiService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockDivisiService = new DivisiService() as jest.Mocked<DivisiService>;
    (DivisiService as jest.Mock).mockImplementation(() => mockDivisiService);
    
    divisiController = new DivisiController();
  });

  test('POST /divisi - should add divisi', async () => {
    mockRequest = {
      body: {
        divisi: 'Divisi 1',
        parentId: 1
      }
    };

    mockDivisiService.addDivisi.mockResolvedValue({
      id: 1,
      divisi: 'Divisi 1',
      parentId: 1
    });

    await divisiController.addDivisi(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 1,
      divisi: 'Divisi 1',
      parentId: 1
    });
  });

  test('POST /divisi - should return 400 if parentId is not a number', async () => {
    mockRequest = {
      body: {
        divisi: 'Divisi 1',
        parentId: 'ABC'
      }
    };

    await divisiController.addDivisi(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Parent ID must be a number' });
  });

  test('POST /divisi - should return 404 if parent divisi not found', async () => {
    mockRequest = {
      body: {
        divisi: 'Divisi 1',
        parentId: 1
      }
    };

    mockDivisiService.addDivisi.mockRejectedValue(new Error('Parent divisi not found'));

    await divisiController.addDivisi(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Parent divisi not found' });
  });

  test('POST /divisi - should return 500 if error', async () => {
    mockRequest = {
      body: {
        divisi: 'Divisi 1',
        parentId: 1
      }
    };

    const errorMessage = 'Database error';
    mockDivisiService.addDivisi.mockRejectedValue(new Error(errorMessage));

    await divisiController.addDivisi(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});