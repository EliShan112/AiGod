import express from "express";
import { createChat, destroyThread, getOneThread, getThread, test } from "../controllers/chatController.js";

const router = express.Router();

router.post("/test", test);

router.get("/thread", getThread);

router.get("/thread/:threadId", getOneThread);

router.delete("/thread/:threadId", destroyThread);

router.post("/chat", createChat);

export default router;
