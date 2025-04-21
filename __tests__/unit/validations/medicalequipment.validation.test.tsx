import { Request } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { 
  addMedicalEquipmentValidation,
  updateMedicalEquipmentValidation 
} from '../../../src/validations/medicalequipment.validation';

// Helper function to get the field name from a validation error
const getErrorField = (error: any): string => {
    // Handle different versions of express-validator
    return error.path;
  };
  
  // Helper function to get the error message
  const getErrorMessage = (error: any): string => {
    return error.msg;
  };

// Helper function to run validations against a mock request
const runValidation = async (validations: ValidationChain[], mockRequest: Partial<Request>) => {
  // Run all validations on the request
  const promises = validations.map(validation => validation.run(mockRequest as Request));
  await Promise.all(promises);
  
  // Return the validation result
  return validationResult(mockRequest as Request);
};

describe('Medical Equipment Validations', () => {
  describe('Add Medical Equipment Validation', () => {
    test('should export an array with 8 validation rules', () => {
      expect(Array.isArray(addMedicalEquipmentValidation)).toBe(true);
      expect(addMedicalEquipmentValidation).toHaveLength(8);
    });
    
    test('should pass validation with valid data', async () => {
      const mockRequest = {
        body: {
          inventorisId: 'INV-001',
          name: 'X-Ray Machine',
          brandName: 'MedTech',
          modelName: 'XT-2000',
          purchaseDate: '2023-01-15',
          purchasePrice: 5000,
          status: 'Active',
          vendor: 'Medical Supplies Inc.'
        }
      };
      
      const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(true);
    });
    
    test('should fail when required fields are missing', async () => {
      const mockRequest = {
        body: {
          brandName: 'MedTech',
          modelName: 'XT-2000'
        }
      };
      
      const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(e => getErrorField(e) === 'inventorisId')).toBe(true);
      expect(errors.some(e => getErrorField(e) === 'name')).toBe(true);
      expect(errors.some(e => getErrorField(e) === 'status')).toBe(true);
    });
    
    test('should fail when status is invalid', async () => {
      const mockRequest = {
        body: {
          inventorisId: 'INV-001',
          name: 'X-Ray Machine',
          status: 'NotAValidStatus'
        }
      };
      
      const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const statusError = errors.find(e => getErrorField(e) === 'status');
      expect(statusError).toBeDefined();
      expect(getErrorMessage(statusError)).toBe('Status must be Active, Inactive, or Maintenance');
    });
    
    test('should fail when purchase date is invalid', async () => {
      const mockRequest = {
        body: {
          inventorisId: 'INV-001',
          name: 'X-Ray Machine',
          status: 'Active',
          purchaseDate: 'not-a-date'
        }
      };
      
      const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const dateError = errors.find(e => getErrorField(e) === 'purchaseDate');
      expect(dateError).toBeDefined();
      expect(dateError?.msg).toBe('Purchase date must be a valid date');
    });
    
    test('should fail when purchase date is in the future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const mockRequest = {
        body: {
          inventorisId: 'INV-001',
          name: 'X-Ray Machine',
          status: 'Active',
          purchaseDate: futureDate.toISOString()
        }
      };
      
      const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const dateError = errors.find(e => getErrorField(e) === 'purchaseDate');
      expect(dateError).toBeDefined();
      expect(dateError?.msg).toBe('Purchase date cannot be in the future');
    });
    
    test('should fail when purchase price is negative', async () => {
      const mockRequest = {
        body: {
          inventorisId: 'INV-001',
          name: 'X-Ray Machine',
          status: 'Active',
          purchasePrice: -100
        }
      };
      
      const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const priceError = errors.find(e => getErrorField(e) === 'purchasePrice');
      expect(priceError).toBeDefined();
      expect(priceError?.msg).toBe('Price cannot be negative');
    });
  });

  describe('Update Medical Equipment Validation', () => {
    test('should export an array with 8 validation rules', () => {
      expect(Array.isArray(updateMedicalEquipmentValidation)).toBe(true);
      expect(updateMedicalEquipmentValidation).toHaveLength(8);
    });
    
    test('should pass validation with valid data', async () => {
      const mockRequest = {
        body: {
          name: 'Updated Machine Name',
          status: 'Maintenance',
          purchasePrice: 6000
        }
      };
      
      const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(true);
    });
    
    test('should pass with empty body (no fields to update)', async () => {
      const mockRequest = { body: {} };
      
      const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(true);
    });
    
    test('should fail when provided inventorisId is empty', async () => {
      const mockRequest = {
        body: {
          inventorisId: ''
        }
      };
      
      const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const idError = errors.find(e => getErrorField(e) === 'inventorisId');
      expect(idError).toBeDefined();
      expect(idError?.msg).toBe('Inventoris ID cannot be empty if provided');
    });
    
    test('should fail when status is invalid', async () => {
      const mockRequest = {
        body: {
          status: 'NotAValidStatus'
        }
      };
      
      const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const statusError = errors.find(e => getErrorField(e) === 'status');
      expect(statusError).toBeDefined();
      expect(getErrorMessage(statusError)).toBe('Status must be Active, Inactive, or Maintenance');
    });
    
    test('should fail when purchase date is in the future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const mockRequest = {
        body: {
          purchaseDate: futureDate.toISOString()
        }
      };
      
      const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const dateError = errors.find(e => getErrorField(e) === 'purchaseDate');
      expect(dateError).toBeDefined();
      expect(dateError?.msg).toBe('Purchase date cannot be in the future');
    });

    
    test('should pass when purchase date is today', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Beginning of today
        
        const mockRequest = {
        body: {
            inventorisId: 'INV-001',
            name: 'X-Ray Machine',
            status: 'Active',
            purchaseDate: today.toISOString()
        }
        };
        
        const result = await runValidation(addMedicalEquipmentValidation, mockRequest);
        expect(result.isEmpty()).toBe(true);
    });
    
    // Add these tests to the "Update Medical Equipment Validation" describe block
    test('should pass when purchase date is valid past date for update', async () => {
        // A date in the past
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1); // One year ago
        
        const mockRequest = {
        body: {
            purchaseDate: pastDate.toISOString()
        }
        };
        
        const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
        expect(result.isEmpty()).toBe(true);
    });
    
    test('should pass when purchase date is today for update', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Beginning of today
        
        const mockRequest = {
        body: {
            purchaseDate: today.toISOString()
        }
        };
        
        const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
        expect(result.isEmpty()).toBe(true);
    });
    
    test('should fail when purchase price is negative', async () => {
      const mockRequest = {
        body: {
          purchasePrice: -100
        }
      };
      
      const result = await runValidation(updateMedicalEquipmentValidation, mockRequest);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      const priceError = errors.find(e => getErrorField(e) === 'purchasePrice');
      expect(priceError).toBeDefined();
      expect(priceError?.msg).toBe('Price cannot be negative');
    });
  });
});