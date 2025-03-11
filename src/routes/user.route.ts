import express from "express";
import { searchUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/", searchUser());

export default router;
