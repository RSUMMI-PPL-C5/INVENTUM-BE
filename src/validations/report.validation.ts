import { query } from "express-validator";
import { toJakartaDate } from "../utils/date.utils";

export const exportDataValidation = [
  query("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format")
    .customSanitizer((value) => toJakartaDate(value, false)),
  query("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .customSanitizer((value) => toJakartaDate(value, true)),
];
