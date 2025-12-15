import express from "express";
import { createChat, destroyThread, getOneThread, getThread, test } from "../controllers/chatController.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import asyncWrap from "../utils/asyncWrap.js";
import { myLoginStatus } from "../controllers/userController.js";

const router = express.Router();

router.post("/test", test);

router.get("/thread", getThread);

router.get("/thread/:threadId", getOneThread);

router.delete("/thread/:threadId", destroyThread);

router.post("/chat", createChat);

router.get('/me', verifyRefreshToken, asyncWrap(myLoginStatus));

export default router;
