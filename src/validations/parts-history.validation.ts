import { body, query, param } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

export const createPartsHistoryValidation = [
  // Validate the equipmentId parameter
  param("equipmentId").notEmpty().withMessage("Equipment ID is required"),
  // Validate sparepartId in body
  body("sparepartId").notEmpty().withMessage("Sparepart ID is required"),
  body("actionPerformed")
    .notEmpty()
    .withMessage("Action performed is required"),
  body("technician").notEmpty().withMessage("Technician name is required"),
  body("result")
    .notEmpty()
    .withMessage("Result is required")
    .isIn(["Success", "Partial", "Failed"])
    .withMessage("Result must be Success, Partial, or Failed"),
  body("replacementDate")
    .notEmpty()
    .withMessage("Replacement date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => toJakartaDate(value)),
];

export const partsHistoryFilterQueryValidation = [
  query("search").optional().isString(),
  query("sparepartId").optional().isString(),
  query("result")
    .optional()
    .isIn(["Success", "Partial", "Failed"])
    .withMessage("Invalid result value"),
  query("replacementDateStart")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, false) : value)),
  query("replacementDateEnd")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, true) : value)),
  query("createdOnStart")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, false) : value)),
  query("createdOnEnd")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, true) : value)),
];
