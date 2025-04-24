import { query } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

export const medicalEquipmentFilterQueryValidation = [
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