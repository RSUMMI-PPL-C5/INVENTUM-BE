import { Router } from 'express';
import UserController from '../controllers/user.controller';
// Update the import path if needed
import { addUserValidation } from '../validations/adduser.validation';

const router = Router();
const userController = new UserController();

// Create new user
router.post('/', addUserValidation, userController.addUser);

export default router;