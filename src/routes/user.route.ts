import { Router } from "express";
import UserRepository from "../repository/user.repository";
import UserService from "../services/user.service";
import UserController from "../controllers/user.controller";
import { userFilterQueryValidation } from "../validations/userfilterquery.validation";

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get("/", userFilterQueryValidation, userController.getUsers);

export default router;
