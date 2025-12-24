"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useChatStore } from "@/store/useChatStore";
import api from "@/lib/api";

const ChatInput = () => {
  // Select specific state to prevent unnecessary re-renders
  const prompt = useChatStore((s) => s.prompt);
  const isTyping = useChatStore((s) => s.isTyping);
  
  // Actions
  const setPrompt = useChatStore((s) => s.setPrompt);
  const setIsTyping = useChatStore((s) => s.setIsTyping);
  const setIsLoading = useChatStore((s) => s.setIsLoading);
  
  const currentThreadId = useChatStore((s) => s.currentThreadId);
  const setCurrentThreadId = useChatStore((s) => s.setCurrentThreadId);
  
  // ✅ CLEANER: Use the helpers instead of manual array spread
  const addMessage = useChatStore((s) => s.addMessage);
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);
  const setMessages = useChatStore((s) => s.setMessages);
  const setAllThreads = useChatStore((s) => s.setAllThreads);

  const getReply = async () => {
    if (!prompt.trim() || isTyping) return;

    const userText = prompt;
    setPrompt(""); // Clear input immediately

    // 1. Optimistic UI: Add user message
    // ✅ cleaner than setMessages(prev => [...prev, msg])
    addMessage({ role: "user", content: userText }); 
    
    setIsTyping(true);
    
    // 2. Add placeholder for Assistant
    addMessage({ role: "assistant", content: "" });

    try {
      setIsLoading(true); // Shows spinner in ChatWindow (not Home)

      const res = await api.post(`/api/chat`, {
        threadId: currentThreadId,
        message: userText,
      });

      const fullThread = res.data.thread;
      const assistantReply = res.data.reply;

      // 3. Update ID if new chat
      if (currentThreadId !== fullThread.threadId) {
        setCurrentThreadId(fullThread.threadId);
      }

      // 4. Typing Effect
      const words = assistantReply.split(" ");
      for (let i = 1; i <= words.length; i++) {
        await new Promise((r) => setTimeout(r, 15));
        const partial = words.slice(0, i).join(" ");

        // ✅ CLEANER: Just update text, no need to copy arrays manually
        updateLastMessage(partial);
      }

      // 5. Final Sync (Ensure we have exact DB state)
      setMessages(fullThread.messages);

      // 6. Update Sidebar List
      setAllThreads((prev) => {
        const exists = prev.some((t) => t.threadId === fullThread.threadId);
        if (exists) {
            // Update existing
            return prev.map((t) => t.threadId === fullThread.threadId ? fullThread : t);
        }
        // Add new to top
        return [fullThread, ...prev];
      });

    } catch (err) {
      console.error("Chat API Error:", err);
      updateLastMessage("Sorry, something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* ✅ RESPONSIVE FIX: w-full on mobile, max-w-3xl on desktop */}
      <div className="relative w-full max-w-3xl m-auto">
        <input
          type="text"
          disabled={isTyping}
          className={`w-full p-4 bg-[#303030] rounded-full outline-none text-gray-200 pr-16 pl-6 shadow-lg transition-all ${
            isTyping ? "opacity-50 cursor-not-allowed" : "focus:ring-2 focus:ring-gray-500"
          }`}
          placeholder={isTyping ? "Thinking..." : "Ask anything..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && getReply()}
        />

        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#424242] rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#525252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isTyping || !prompt.trim()}
          onClick={getReply}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            className="text-gray-300 text-sm"
          />
        </button>
      </div>

      <p className="mt-3 text-xs text-center text-gray-500">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  );
};

export default ChatInput;