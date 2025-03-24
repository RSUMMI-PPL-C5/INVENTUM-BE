import { query } from "express-validator";

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
      value.every((status: any) => ["Active", "Maintenance" ,"Inactive"].includes(status)),
    )
    .withMessage("status must contain Active, Maintenance, Inactive"),

  query("createdOnStart")
    .optional()
    .isISO8601()
    .withMessage("createdOnStart must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),
  
  query("createdOnEnd")
    .optional()
    .isISO8601()
    .withMessage("createdOnEnd must be a valid ISO date")
    .customSanitizer((value) => {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        date.setUTCHours(23, 59, 59, 999);
      }
      return date;
    }),

  query("modifiedOnStart")
    .optional()
    .isISO8601()
    .withMessage("modifiedOnStart must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),

  query("modifiedOnEnd")
    .optional()
    .isISO8601()
    .withMessage("modifiedOnEnd must be a valid ISO date")
    .customSanitizer((value) => {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        date.setUTCHours(23, 59, 59, 999);
      }
      return date;
    }),

  query("purchaseDateStart")
    .optional()
    .isISO8601()
    .withMessage("purchaseDateStart must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),

  query("purchaseDateEnd")
    .optional()
    .isISO8601()
    .withMessage("purchaseDateEnd must be a valid ISO date")
    .customSanitizer((value) => {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        date.setUTCHours(23, 59, 59, 999);
      }
      return date;
    }),
];