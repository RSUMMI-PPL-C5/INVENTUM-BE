import { Router } from 'express';
import MedicalEquipmentController from "../controllers/medicalequipment.controller";
import verifyToken from "../middleware/verifyToken";
import { medicalEquipmentFilterQueryValidation } from "../validations/medicalequipmentfilterquery.validation";
import { addMedicalEquipmentValidation, updateMedicalEquipmentValidation } from '../validations/medicalequipment.validation';
import { validateRequest } from '../middleware/validateRequest';
import authorizeRoles from '../middleware/authorizeRole';

const router = Router();
const medicalEquipmentController = new MedicalEquipmentController();

router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

router.get('/', medicalEquipmentFilterQueryValidation, medicalEquipmentController.getMedicalEquipment);
router.post('/', addMedicalEquipmentValidation, validateRequest, medicalEquipmentController.addMedicalEquipment);
router.get('/:id', medicalEquipmentController.getMedicalEquipmentById);
router.put('/:id', updateMedicalEquipmentValidation, validateRequest, medicalEquipmentController.updateMedicalEquipment);
router.delete('/:id', medicalEquipmentController.deleteMedicalEquipment);

export default router;