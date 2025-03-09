import { query } from "express-validator";

export const userFilterQueryValidation = [
  query("role")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      return value ? [value] : undefined;
    })
    .isArray()
    .withMessage("role must be a string or an array of strings")
    .custom((value) =>
      value.every((role: any) => ["User", "Admin", "Asesor"].includes(role)),
    )
    .withMessage("role must contain user, admin, or asesor"),

  query("divisiId")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value.map(Number);
      return Number(value) ? [Number(value)] : false;
    })
    .isArray()
    .withMessage("divisiId must be a number or an array of numbers")
    .custom((value) => value.every((id: any) => !isNaN(Number(id))))
    .withMessage("divisiId must contain numbers"),

  query("createdOnStart")
    .optional()
    .isISO8601()
    .withMessage("createdOnStart must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),

  query("createdOnEnd")
    .optional()
    .isISO8601()
    .withMessage("createdOnEnd must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),

  query("modifiedOnStart")
    .optional()
    .isISO8601()
    .withMessage("modifiedOnStart must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),

  query("modifiedOnEnd")
    .optional()
    .isISO8601()
    .withMessage("modifiedOnEnd must be a valid ISO date")
    .customSanitizer((value) => new Date(value)),
];
