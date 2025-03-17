import { Router } from 'express';
import UserController from '../controllers/user.controller';
import verifyToken from '../middleware/verifyToken';
import { addUserValidation } from '../validations/adduser.validation';
import { userFilterQueryValidation } from '../validations/userfilterquery.validation';

const router = Router();
const userController = new UserController();

router.get('/', verifyToken, userFilterQueryValidation, userController.getUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, addUserValidation, userController.addUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

export default router;
