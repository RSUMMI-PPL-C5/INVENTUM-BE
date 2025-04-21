import { body } from "express-validator";

export const addSparepartValidation = [
  body("partsName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Sparepart name is required"),

  body("purchaseDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Purchase date must be a valid date")
    .custom(value => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),

  body("price")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Price must be a number")
    .custom(value => {
      if (value < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),

  body("toolLocation")
    .optional()
    .isString()
    .trim()
    .withMessage("Tool location must be a string"),

  body("toolDate")
    .optional()
    .isString()
    .withMessage("Tool date must be a valid date"),
];

export const updateSparepartValidation = [
  body("partsName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Sparepart name cannot be empty if provided"),

  body("purchaseDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Purchase date must be a valid date")
    .custom(value => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),

  body("price")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Price must be a number")
    .custom(value => {
      if (value < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),

  body("toolLocation")
    .optional()
    .isString()
    .trim()
    .withMessage("Tool location must be a string"),

  body("toolDate")
    .optional()
    .isString()
    .withMessage("Tool date must be a valid date"),
];