import { Router } from "express";
import { logIn, logOut, myLoginStatus, refresh, signUp } from "../controllers/userController.js";
import asyncWrap from "../utils/asyncWrap.js";
import { requireRefreshToken } from "../middlewares/refreshTokenMiddleware.js";


const router = Router();

router.post("/signup", asyncWrap(signUp));
router.post("/login", asyncWrap(logIn));
router.post("/refresh", asyncWrap(refresh));
router.post("/logout", asyncWrap(logOut));
router.get('/me', requireRefreshToken, asyncWrap(myLoginStatus));

export default router;
