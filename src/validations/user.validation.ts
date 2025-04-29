import { body, query } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

const addUserValidation = [
  body("email").isEmail().withMessage("Valid email is required"),

  body("username")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("fullname")
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters")
    .notEmpty()
    .withMessage("Full name is required"),

  body("role")
    .isIn(["User", "Admin", "Fasum"])
    .withMessage("Role must be User, Admin, or Fasum"),

  body("nokar").optional().isString(),

  body("divisiId")
    .optional()
    .isInt()
    .toInt()
    .withMessage("Division ID must be an integer"),

  body("waNumber")
    .isString()
    .matches(/^(\+62|62|0)8[1-9]\d{6,10}$/)
    .withMessage("Valid Indonesian phone number is required"),
];

const updateUserValidation = [
  body("email").optional().isEmail().withMessage("Valid email is required"),

  body("fullname")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters"),

  body("role")
    .optional()
    .isIn(["User", "Admin", "Fasum"])
    .withMessage("Role must be User, Admin, or Fasum"),

  body("nokar").optional().isString(),

  body("password")
    .optional()
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("divisiId")
    .optional()
    .isInt()
    .toInt()
    .withMessage("Division ID must be an integer"),

  body("waNumber")
    .optional()
    .isString()
    .matches(/^(\+62|62|0)8[1-9]\d{6,10}$/)
    .withMessage("Valid Indonesian phone number is required"),
];

const userFilterQueryValidation = [
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

export { addUserValidation, updateUserValidation, userFilterQueryValidation };
