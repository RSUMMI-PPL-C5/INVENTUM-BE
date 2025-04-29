import { body, query } from "express-validator";

const addSparepartValidation = [
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
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error("Purchase date cannot be in the future");
      }
      return true;
    }),

  body("price")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Price must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Price cannot be negative");
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

const updateSparepartValidation = [
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
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error("Purchase date cannot be in the future");
      }
      return true;
    }),

  body("price")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Price must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Price cannot be negative");
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

const sparepartFilterQueryValidation = [
  query("purchaseDateStart")
    .optional()
    .isISO8601()
    .withMessage("Purchase date start must be a valid date in ISO8601 format"),

  query("purchaseDateEnd")
    .optional()
    .isISO8601()
    .withMessage("Purchase date end must be a valid date in ISO8601 format"),

  query("priceMin")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Minimum price must be a number"),

  query("priceMax")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Maximum price must be a number"),

  query("createdOnStart")
    .optional()
    .isISO8601()
    .withMessage("Created date start must be a valid date in ISO8601 format"),

  query("createdOnEnd")
    .optional()
    .isISO8601()
    .withMessage("Created date end must be a valid date in ISO8601 format"),

  query("modifiedOnStart")
    .optional()
    .isISO8601()
    .withMessage("Modified date start must be a valid date in ISO8601 format"),

  query("modifiedOnEnd")
    .optional()
    .isISO8601()
    .withMessage("Modified date end must be a valid date in ISO8601 format"),
];

export {
  addSparepartValidation,
  updateSparepartValidation,
  sparepartFilterQueryValidation,
};
