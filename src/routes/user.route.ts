<<<<<<< HEAD
import { Router } from 'express';
import UserController from '../controllers/user.controller';
// Update the import path if needed
import { addUserValidation } from '../validations/adduser.validation';
=======
<<<<<<< HEAD
import express from "express";
import { searchUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/", searchUser());
=======
import { Router } from 'express';
import UserController from '../controllers/user.controller';
>>>>>>> staging

const router = Router();
const userController = new UserController();

<<<<<<< HEAD
// Create new user
router.post('/', addUserValidation, userController.addUser);
=======
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/id', userController.deleteUser);
>>>>>>> staging
>>>>>>> staging

export default router;
