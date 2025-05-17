import { body, query, param } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

export const createCalibrationHistoryValidation = [
  // Validate the equipmentId parameter
  param("equipmentId").notEmpty().withMessage("Equipment ID is required"),

  // Validate request body fields
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

  body("calibrationDate")
    .notEmpty()
    .withMessage("Calibration date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => toJakartaDate(value)),

  body("calibrationMethod")
    .notEmpty()
    .withMessage("Calibration method is required"),

  body("nextCalibrationDue")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid date format for next calibration due date")
    .customSanitizer((value) => toJakartaDate(value)),
];

export const calibrationHistoryFilterQueryValidation = [
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

  query("calibrationDateStart")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, false) : value)),

  query("calibrationDateEnd")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .customSanitizer((value) => (value ? toJakartaDate(value, true) : value)),

  query("calibrationMethod").optional().isString(),

  query("nextCalibrationDueBefore")
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
