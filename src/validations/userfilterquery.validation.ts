import { query } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

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
      value.every((role: any) => ["User", "Admin", "Fasum"].includes(role)),
    )
    .withMessage("role must contain user, admin, or fasum"),

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