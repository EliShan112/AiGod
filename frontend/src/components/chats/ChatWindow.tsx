"use client";

import { MyContext } from "@/contexts/MyContext";
import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";


const ChatWindow = () => {
  const { messages, isTyping } = useContext(MyContext);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if(isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isTyping]);
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 text-gray-300 space-y-4 bg-[#212121]"
    >
      {messages.length === 0 && (
        <p className="text-center text-white text-3xl ">
          Where should we begin?
        </p>
      )}

      <section className="max-w-[60%] m-auto flex flex-col flex-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl ${ 
              msg.role === "user"
                ? "ml-auto max-w-[50%] mt-4 bg-[#2a2a2a] text-white"
                : "mr-auto max-w-full mt-4 text-start text-gray-200"
            }`}
          >
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </section>

      <div ref={bottomRef}></div>
    </div>
  );
};

export default ChatWindow;