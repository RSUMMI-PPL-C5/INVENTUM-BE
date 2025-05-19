import { body, query } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

const addMedicalEquipmentValidation = [
  body("inventorisId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Inventoris ID is required"),

  body("name").isString().trim().notEmpty().withMessage("Name is required"),

  body("brandName").optional().isString().trim(),

  body("modelName").optional().isString().trim(),

  body("lastLocation").optional().isString().trim(),

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

  body("purchasePrice")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("Purchase price must be a valid number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Price cannot be negative");
      }
      return true;
    }),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Active", "Inactive", "Maintenance"])
    .withMessage("Status must be Active, Inactive, or Maintenance")
    .isString()
    .trim(),

  body("vendor").optional().isString().trim(),
];

const updateMedicalEquipmentValidation = [
  body("inventorisId")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Inventoris ID cannot be empty if provided"),

  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty if provided"),

  body("brandName").optional().isString().trim(),

  body("modelName").optional().isString().trim(),

  body("lastLocation").optional().isString().trim(),

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

  body("purchasePrice")
    .optional()
    .isNumeric()
    .toFloat()
    .custom((value) => {
      if (value < 0) {
        throw new Error("Price cannot be negative");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Maintenance"])
    .withMessage("Status must be Active, Inactive, or Maintenance")
    .isString()
    .trim(),

  body("vendor").optional().isString().trim(),
];

const medicalEquipmentFilterQueryValidation = [
  query("status")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      return value ? [value] : undefined;
    })
    .isArray()
    .withMessage("status must be a string or an array of strings")
    .custom((value) =>
      value.every((status: any) =>
        ["Active", "Maintenance", "Inactive"].includes(status),
      ),
    )
    .withMessage("status must contain Active, Maintenance, or Inactive"),

  query("purchaseDateStart")
    .optional()
    .isISO8601()
    .withMessage("purchaseDateStart must be a valid ISO date")
    .customSanitizer((value) => toJakartaDate(value)),

  query("purchaseDateEnd")
    .optional()
    .isISO8601()
    .withMessage("purchaseDateEnd must be a valid ISO date")
    .customSanitizer((value) => toJakartaDate(value, true)),

  query("createdOnStart")
    .optional()
    .isISO8601()
    .withMessage("createdOnStart must be a valid ISO date")
    .customSanitizer((value) => toJakartaDate(value)),

  query("createdOnEnd")
    .optional()
    .isISO8601()
    .withMessage("createdOnEnd must be a valid ISO date")
    .customSanitizer((value) => toJakartaDate(value, true)),

  query("modifiedOnStart")
    .optional()
    .isISO8601()
    .withMessage("modifiedOnStart must be a valid ISO date")
    .customSanitizer((value) => toJakartaDate(value)),

  query("modifiedOnEnd")
    .optional()
    .isISO8601()
    .withMessage("modifiedOnEnd must be a valid ISO date")
    .customSanitizer((value) => toJakartaDate(value, true)),
];

export {
  addMedicalEquipmentValidation,
  updateMedicalEquipmentValidation,
  medicalEquipmentFilterQueryValidation,
};
