import { Router } from "express";
import { logIn, logOut, refresh, signUp } from "../controllers/userController.js";
import asyncWrap from "../utils/asyncWrap.js";

const router = Router();

router.post("/signup", asyncWrap(signUp));
router.post("/login", asyncWrap(logIn));
router.post("/refresh", asyncWrap(refresh));
router.post("/logout", asyncWrap(logOut));

export default router;
