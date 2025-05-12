import { body } from "express-validator";

export const createRequestValidation = [
  body("medicalEquipment")
    .notEmpty()
    .withMessage("Medical equipment ID is required"),

  body("complaint")
    .optional()
    .isString()
    .withMessage("Complaint must be a string"),
];
