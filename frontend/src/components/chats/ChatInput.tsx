"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { IMessage, MyContext } from "@/contexts/MyContext";
import axios from "axios";

const ChatInput = () => {
  const {
    prompt,
    setPrompt,
    isTyping,
    setIsTyping,
    setMessages,
    currentThreadId,
    setAllThreads,
    setCurrentThreadId
  } = useContext(MyContext);

  const getReply = async () => {
    if (!prompt.trim() || isTyping) return;

    const userText = prompt;
    setPrompt(""); // clear input ASAP

    // 1️⃣ Add user message to UI
    const userMsg: IMessage = { role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);

    setIsTyping(true);

    // 2️⃣ Add placeholder assistant message for typing effect
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      // 3️⃣ Backend request (FULL THREAD is returned)
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        {
          threadId: currentThreadId,
          message: userText,
        }
      );

      const fullThread = res.data.thread;
      const assistantReply = res.data.reply;

      // 4️⃣ Update currentThreadId (backend may create new thread)
      setCurrentThreadId(fullThread.threadId);

      // 5️⃣ Typing effect
      const words = assistantReply.split(" ");

      for (let i = 1; i <= words.length; i++) {
        await new Promise(r => setTimeout(r, 15));
        const partial = words.slice(0, i).join(" ");

        // Update only the last assistant message
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: partial,
          };
          return msgs;
        });
      }

      // 6️⃣ After typing: replace placeholder with REAL messages from backend
      setMessages(fullThread.messages);

      // 7️⃣ Update allThreads list
      setAllThreads(prev => {
        const exists = prev.some(t => t.threadId === fullThread.threadId);

        if (exists) {
          return prev.map(t =>
            t.threadId === fullThread.threadId ? fullThread : t
          );
        } else {
          return [fullThread, ...prev]; // new thread case
        }
      });

    } catch (err) {
      console.error("Chat API Error:", err);

      // Replace partial/placeholder with error message
      setMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return msgs;
      });

    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-1">
      <div className="relative w-[60%] m-auto">
        <input
          type="text"
          disabled={isTyping}
          className={`w-full p-4 bg-[#303030] rounded-full outline-none text-gray-200 pr-16 pl-6 ${
            isTyping ? "opacity-50 cursor-not-allowed" : ""
          }`}
          placeholder={isTyping ? "Thinking..." : "Ask anything"}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && getReply()}
        />

        <button
          className="absolute right-8 border-l-2 border-gray-600 pl-3 top-1/2 -translate-y-1/2 disabled:opacity-50"
          disabled={isTyping || !prompt.trim()}
          onClick={getReply}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            className="text-gray-300 hover:text-white"
          />
        </button>
      </div>

      <p className="mt-3 text-sm text-center text-gray-500">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  );
};

export default ChatInput;
