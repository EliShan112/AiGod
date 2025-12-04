import express from "express";
import Thread from "../model/Thread.js";
import type { Request, Response } from "express";
import getGeminiResponse from "../utils/gemini.js";

const router = express.Router();

router.post("/test", async (req: Request, res: Response) => {
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
});

router.get("/thread", async (req: Request, res: Response) => {
  try {
    const threads = await Thread.find({}).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch threads (custom)" });
  }
});

router.get("/thread/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId });
    if (!thread) {
      return res.status(404).json({ error: "Couldn't get thread (custom)" });
    }
    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch thread id data (custom)" });
  }
});

router.delete("/thread/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread) {
      return res
        .status(404)
        .json({ error: "Couldn't find the thread (custom)" });
    }

    res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete thread (custom)" });
  }
});

router.post("/chat", async (req: Request, res: Response) => {

  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res
      .status(400)
      .json({ error: "Required threadId and message (custom)" });
  }

  try {

    let thread = await Thread.findOne({ threadId });

    if(!thread){
        thread = new Thread({
            threadId,
            title: message.slice(0,40),
            messages: [{role: 'user', content: message, timestamp: new Date()}]
        });
    } else{
        thread.messages.push({role: 'user', content: message, timestamp: new Date()});
    }

    //Ai reply
    const assistantReply = await getGeminiResponse(message);

    thread.messages.push({role: 'assistant', content: assistantReply ?? "Error generating reply (custom)", timestamp: new Date()})

    //saving in db
    await thread.save();
    
    //returning reply
    res.json({reply: assistantReply, thread}); 

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to generate response (custom)" });
  }
});

export default router;
