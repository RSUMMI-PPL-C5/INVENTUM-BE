import { Router } from 'express';
import UserController from '../controllers/user.controller';
import verifyToken from '../middleware/verifyToken';
import { userFilterQueryValidation } from '../validations/userfilterquery.validation';
import authorizeRoles from '../middleware/authorizeRole';

const router = Router();
const userController = new UserController();

router.use(verifyToken, authorizeRoles("Admin"));

router.get('/', userFilterQueryValidation, userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
