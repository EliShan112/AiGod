"use client";
import Chat from "@/components/chats/Chat";
import Navbar from "@/components/Layouts/Navbar";
import SideBar from "@/components/sidebar/Sidebar";
import { IMessage, IThread, MyContext } from "@/contexts/MyContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";



export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(()=>uuidv4());
  const [allThreads, setAllThreads] = useState<IThread[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const provideValues = {
    allThreads,
    setAllThreads,

    isTyping,
    setIsTyping,

    prompt,
    setPrompt,

    messages,
    setMessages,

    currentThreadId,
    setCurrentThreadId,
  };



  return (
    <main className="flex bg-[#212121] h-screen overflow-hidden">

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