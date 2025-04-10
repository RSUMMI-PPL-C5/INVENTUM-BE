import { Request, Response } from 'express';
import DivisionService from '../../../../src/services/division.service';
import DivisionController from '../../../../src/controllers/division.controller';

jest.mock('../../../../src/services/division.service');

describe('DivisiController - ADD', () => {
  let divisionController: DivisionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDivisionService: jest.Mocked<DivisionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockDivisionService = new DivisionService() as jest.Mocked<DivisionService>;
    (DivisionService as jest.Mock).mockImplementation(() => mockDivisionService);
    
    divisionController = new DivisionController();
  });

  test('POST /divisi - should add divisi', async () => {
    mockRequest = {
      body: {
        divisi: 'Divisi 1',
        parentId: 1
      }
    };

    mockDivisionService.addDivision.mockResolvedValue({
      id: 1,
      divisi: 'Divisi 1',
      parentId: 1
    });

    await divisionController.addDivision(mockRequest as Request, mockResponse as Response);

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

    await divisionController.addDivision(mockRequest as Request, mockResponse as Response);

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

    mockDivisionService.addDivision.mockRejectedValue(new Error('Parent divisi not found'));

    await divisionController.addDivision(mockRequest as Request, mockResponse as Response);

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
    mockDivisionService.addDivision.mockRejectedValue(new Error(errorMessage));

    await divisionController.addDivision(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});