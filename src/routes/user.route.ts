import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { addUserValidation } from '../validations/adduser.validation';
import { userFilterQueryValidation } from '../validations/userfilterquery.validation';

const router = Router();
const userController = new UserController();

router.get('/', userFilterQueryValidation, userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', addUserValidation, userController.addUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
