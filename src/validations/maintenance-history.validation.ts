import { body, query, param } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

export const createMaintenanceHistoryValidation = [
  // Validate the equipmentId parameter
  param("equipmentId").notEmpty().withMessage("Equipment ID is required"),
  // No longer need to validate medicalEquipmentId in body
  body("actionPerformed")
    .notEmpty()
    .withMessage("Action performed is required"),
  body("technician").notEmpty().withMessage("Technician name is required"),
  body("result")
    .notEmpty()
    .withMessage("Result is required")
    .isIn([
      "Success",
      "Partial",
      "Failed",
      "Success with Issues",
      "Failed with Issues",
    ])
    .withMessage(
      "Result must be Success, Partial, Failed, Success with Issues, or Failed with Issues",
    ),
  body("maintenanceDate")
    .notEmpty()
    .withMessage("Maintenance date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => toJakartaDate(value)),
];

export const maintenanceHistoryFilterQueryValidation = [
  query("search").optional().isString(),
  query("medicalEquipmentId").optional(),
  query("result")
    .optional()
    .isIn([
      "Success",
      "Partial",
      "Failed",
      "Success with Issues",
      "Failed with Issues",
    ])
    .withMessage("Invalid result value"),
  query("maintenanceDateStart")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, false) : value)),
  query("maintenanceDateEnd")
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
