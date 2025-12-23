import express from "express";
import { createChat, destroyThread, getOneThread, getThread } from "../controllers/chatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Everything below requires ACCESS TOKEN   
router.use(authMiddleware);

router.get("/thread", getThread);

router.get("/thread/:threadId", getOneThread);

router.delete("/thread/:threadId", destroyThread);

router.post("/chat", createChat);


export default router;
