import express from "express";
import Thread from "../model/Thread.js";
import type { Request, Response } from "express";
import getGeminiResponse from "../utils/gemini.js";


// ------------------------------------------------------
// TEST
// ------------------------------------------------------
export const test = async (req: Request, res: Response) => {
  try {
    const thread = new Thread({
      threadId: "abc",
      title: "Testing new thread",
    });
    const response = await thread.save();
    res.send(response);
  } catch (err) {
    res.status(500).json({ error: "Failed to save in DB (custom)" });
  }
};

// ------------------------------------------------------
// GET ALL THREADS
// ------------------------------------------------------
export const getThread = async (req: Request, res: Response) => {
  try {
    const threads = await Thread.find({})
      .sort({ updatedAt: -1 })
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

  try {
    const thread = await Thread.findOne({ threadId }).lean();
    if (!thread) {
      return res.status(404).json({ error: "Couldn't get thread (custom)" });
    }
    res.json(thread.messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch thread id data (custom)" });
  }
};

// ------------------------------------------------------
// DELETE THREAD
// ------------------------------------------------------
export const destroyThread = async (req: Request, res: Response) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread) {
      return res.status(404).json({ error: "Couldn't find the thread (custom)" });
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
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res
      .status(400)
      .json({ error: "Required threadId and message (custom)" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    // If thread doesn't exist — create new one
    if (!thread) {
      thread = new Thread({
        threadId,
        title: message.slice(0, 40),
        messages: [
          {
            role: "user",
            content: message,
            timestamp: new Date(),
          },
        ],
      });
    } else {
      thread.messages.push({
        role: "user",
        content: message,
        timestamp: new Date(),
      });
    }

    // AI reply
    const assistantReply = await getGeminiResponse(message);

    thread.messages.push({
      role: "assistant",
      content: assistantReply ?? "Error generating reply (custom)",
      timestamp: new Date(),
    });

    await thread.save();

    res.json({
      reply: assistantReply,
      thread,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to generate response (custom)" });
  }
};
