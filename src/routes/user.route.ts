import { Router } from 'express';
import UserController from '../controllers/user.controller';
import verifyToken from '../middleware/verifyToken';
import { userFilterQueryValidation } from '../validations/userfilterquery.validation';
import { addUserValidation, updateUserValidation } from '../validations/user.validation';
import authorizeRoles from '../middleware/authorizeRole';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const userController = new UserController();

router.use(verifyToken, authorizeRoles("Admin"));

router.get('/', userFilterQueryValidation, userController.getUsers);
router.post('/', addUserValidation, validateRequest, userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', updateUserValidation, validateRequest, userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;