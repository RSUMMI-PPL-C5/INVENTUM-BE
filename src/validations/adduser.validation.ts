import { body } from 'express-validator';

export const addUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isString(),
  body('fullname')
    .optional()
    .isString(),
  body('nokar')
    .optional()
    .isString(),
  body('divisiId')
    .optional()
    .isInt().toInt()
    .withMessage('Division ID must be an integer'),
  body('waNumber')
    .optional()
    .isString(),
];