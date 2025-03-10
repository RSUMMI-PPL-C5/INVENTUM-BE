import express, { Request, Response } from "express";
import { searchUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/search", searchUser());

export default router;
