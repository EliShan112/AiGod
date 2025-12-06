



"use client";

import Chat from "@/components/Chat";
import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";
import { IMessage, IThread, MyContext } from "@/contexts/MyContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(()=>uuidv4());
  const [allThreads, setAllThreads] = useState<IThread[]>([]);

  const provideValues = {
    allThreads,
    setAllThreads,

    prompt,
    setPrompt,

    messages,
    setMessages,

    currentThreadId,
    setCurrentThreadId,
  };

  return (
    <main className="flex bg-[#121212]">
      <MyContext.Provider value={provideValues}>
        <SideBar />

        <div className="flex-1 flex flex-col h-screen">
          <Navbar />
          <Chat />
        </div>
      </MyContext.Provider>
    </main>
  );
}

