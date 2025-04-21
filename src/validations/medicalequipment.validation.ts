import { body } from 'express-validator';

export const addMedicalEquipmentValidation = [
  body('inventorisId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Inventoris ID is required'),
  
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('brandName')
    .optional()
    .isString()
    .trim(),
  
  body('modelName')
    .optional()
    .isString()
    .trim(),
  
  body('purchaseDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Purchase date must be a valid date')
    .custom(value => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),
  
  body('purchasePrice')
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage('Purchase price must be a valid number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Active', 'Inactive', 'Maintenance'])
    .withMessage('Status must be Active, Inactive, or Maintenance')
    .isString()
    .trim(),
  
  body('vendor')
    .optional()
    .isString()
    .trim(),
];

export const updateMedicalEquipmentValidation = [
  body('inventorisId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Inventoris ID cannot be empty if provided'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty if provided'),
  
  body('brandName')
    .optional()
    .isString()
    .trim(),
  
  body('modelName')
    .optional()
    .isString()
    .trim(),
  
  body('purchaseDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Purchase date must be a valid date')
    .custom(value => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),
  
  body('purchasePrice')
    .optional()
    .isNumeric()
    .toFloat()
    .custom(value => {
      if (value < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Maintenance'])
    .withMessage('Status must be Active, Inactive, or Maintenance')
    .isString()
    .trim(),
  
  body('vendor')
    .optional()
    .isString()
    .trim(),
];