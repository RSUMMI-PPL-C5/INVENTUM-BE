import { body } from "express-validator";

export const addUserValidation = [
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

export const updateUserValidation = [
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
