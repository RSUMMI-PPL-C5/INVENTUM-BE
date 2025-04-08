import { query, ValidationChain } from "express-validator";

/**
 * Creates a date field validation chain
 * @param fieldName Name of the date field
 * @param isEndDate Whether this is an end date field (to set time to end of day)
 * @returns ValidationChain for the date field
 */

const createDateValidation = (
  fieldName: string,
  isEndDate: boolean,
): ValidationChain => {
  const chain = query(fieldName)
    .optional()
    .isISO8601()
    .withMessage(`${fieldName} must be a valid ISO date`);

  if (isEndDate) {
    return chain.customSanitizer((value) => {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        date.setUTCHours(23, 59, 59, 999);
      }
      return date;
    });
  } else {
    return chain.customSanitizer((value) => new Date(value));
  }
};

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
    .withMessage("status must contain Active, Maintenance, Inactive"),

  // Date fields using the helper function
  createDateValidation("createdOnStart", false),
  createDateValidation("createdOnEnd", true),
  createDateValidation("modifiedOnStart", false),
  createDateValidation("modifiedOnEnd", true),
  createDateValidation("purchaseDateStart", false),
  createDateValidation("purchaseDateEnd", true),
];
