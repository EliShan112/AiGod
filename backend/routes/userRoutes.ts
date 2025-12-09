import { Router } from "express";
import { signUp } from "../controllers/userController.js";
import asyncWrap from "../utils/asyncWrap.js";

const router = Router();

router.post("/signup", asyncWrap(signUp));

export default router;
