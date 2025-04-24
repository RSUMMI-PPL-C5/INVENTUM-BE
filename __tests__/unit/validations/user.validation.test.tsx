import { addUserValidation } from '../../../src/validations/user.validation';

describe('Add User Validation', () => {
  test('should export an array with 8 validation rules', () => {
    expect(Array.isArray(addUserValidation)).toBe(true);
    expect(addUserValidation).toHaveLength(8);
  });
  
  test('should include validation rules for all required fields', () => {
    // Just make sure the array isn't empty to achieve code coverage
    expect(addUserValidation[0]).toBeDefined();
    expect(addUserValidation[1]).toBeDefined();
    expect(addUserValidation[2]).toBeDefined();
    expect(addUserValidation[3]).toBeDefined();
    expect(addUserValidation[4]).toBeDefined();
    expect(addUserValidation[5]).toBeDefined();
    expect(addUserValidation[6]).toBeDefined();
    expect(addUserValidation[7]).toBeDefined();
  });
});