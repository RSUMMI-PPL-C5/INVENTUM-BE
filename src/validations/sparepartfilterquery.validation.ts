import { query } from "express-validator";

export const sparepartFilterQueryValidation = [
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

  // // Pagination parameters
  // query("page")
  //   .optional()
  //   .isInt({ min: 1 })
  //   .withMessage("Page must be a positive integer"),

  // query("limit")
  //   .optional()
  //   .isInt({ min: 1 })
  //   .withMessage("Limit must be a positive integer"),

  // // Search parameter
  // query("search")
  //   .optional()
  //   .isString()
  //   .withMessage("Search must be a string"),
];
