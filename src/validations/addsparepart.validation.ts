import { body } from "express-validator";

export const addSparepartValidation = [
  body("partsName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Sparepart name is required"),

  body("purchaseDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Purchase date must be a valid date"),

  body("price").optional().isNumeric().withMessage("Price must be a number"),

  body("toolLocation")
    .optional()
    .isString()
    .trim()
    .withMessage("Tool location must be a string"),

  body("toolDate")
    .optional()
    .isString()
    .toDate()
    .withMessage("Tool date must be a valid date"),

  body("createdBy").isInt().withMessage("CreatedBy must be an integer"),

  body("createdOn")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("CreatedOn must be a valid date"),

  body("modifiedBy")
    .optional()
    .isInt()
    .withMessage("ModifiedBy must be an integer"),

  body("modifiedOn")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("ModifiedOn must be a valid date"),

  body("deletedBy")
    .optional()
    .isInt()
    .withMessage("DeletedBy must be an integer"),

  body("deletedOn")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("DeletedOn must be a valid date"),
];
