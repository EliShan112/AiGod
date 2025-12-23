import express from "express";
import Thread from "../model/Thread.js";
import type { Request, Response } from "express";
import getGeminiResponse from "../utils/gemini.js";
import ExpressError from "../utils/ExpressError.js";
import { v4 as uuidv4 } from 'uuid';

// ------------------------------------------------------
// TEST
// ------------------------------------------------------
// export const test = async (req: Request, res: Response) => {
//   try {
//     const thread = new Thread({
//       threadId: "abc",
//       title: "Testing new thread",
//     });
//     const response = await thread.save();
//     res.send(response);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to save in DB (custom)" });
//   }
// };

// ------------------------------------------------------
// GET ALL THREADS
// ------------------------------------------------------
export const getThread = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const threads = await Thread.find({ userId })
      .sort({ updatedAt: -1 })
      .select("threadId title updatedAt")
      .lean();

    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch threads (custom)" });
  }
};

// ------------------------------------------------------
// GET ONE THREAD
// ------------------------------------------------------
export const getOneThread = async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const userId = req.user?.userId;

  try {
    const thread = await Thread.findOne({ threadId, userId }).lean();

    if (!thread) {
      throw new ExpressError(404, "Chat not found (custom)");
    }
    res.json(thread.messages);
  } catch (err) {
    if (err instanceof ExpressError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to fetch thread id data (custom)" });
  }
};

// ------------------------------------------------------
// DELETE THREAD
// ------------------------------------------------------
export const destroyThread = async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const userId = req.user?.userId;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId, userId });

    if (!deletedThread) {
      return res
        .status(404)
        .json({ error: "Chat not found or unauthorized (custom)" });
    }

    res.json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete thread (custom)" });
  }
};

// ------------------------------------------------------
// CREATE CHAT MESSAGE
// ------------------------------------------------------
export const createChat = async (req: Request, res: Response) => {
  let { threadId, message } = req.body;
  const userId = req.user?.userId;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!threadId) {
    threadId = uuidv4();
  }

  try {
    let thread = await Thread.findOne({ threadId, userId });

    // Prepare History for Gemini
    let formattedHistory: any[] = [];

    // If thread doesn't exist — create new one
    if (!thread) {
      thread = new Thread({
        userId,
        threadId,
        title: message.slice(0, 30) + "...",
        messages: [],
      });
    } else {

      
    // Extract last 10 messages for context
    // We slice(-10) to avoid hitting token limits if the chat is huge
    const previousMessages = thread.messages.slice(-10);
    formattedHistory = previousMessages.map((msg)=>({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{text: msg.content}],
    }));
  }

  // If exists, append user message
  thread.messages.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

    // Now Call Gemini with History
    // Note: We don't pass the *current* message in 'formattedHistory', 
    // we pass it as the first argument.
    const assistantReply = await getGeminiResponse(message, formattedHistory);

    // Save Assistant Reply to DB
    thread.messages.push({
      role: "assistant",
      content: assistantReply ?? "Error generating reply",
      timestamp: new Date(),
    });

    await thread.save();

    res.json({
      threadId,
      reply: assistantReply,
      thread,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to generate response (custom)" });
  }
};
