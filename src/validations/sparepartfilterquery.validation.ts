// src/validations/sparepartfilterquery.validation.ts
import { query } from "express-validator";

export const sparepartFilterQueryValidation = [
  query("partsName")
    .optional()
    .isString()
    .withMessage("Parts name must be a string"),

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
    .withMessage("Minimum price must be a number"),

  query("priceMax")
    .optional()
    .isNumeric()
    .withMessage("Maximum price must be a number"),

  query("toolLocation")
    .optional()
    .isString()
    .withMessage("Tool location must be a string"),
];
