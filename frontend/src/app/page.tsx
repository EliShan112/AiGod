"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

import Chat from "@/components/chats/Chat";
import Navbar from "@/components/Layouts/Navbar";
import SideBar from "@/components/sidebar/Sidebar";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useChatStore((s) => s.isLoading);
  const resetChat = useChatStore((s) => s.resetChat);
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useChatStore((s) => s.setIsSidebarOpen);

  const router = useRouter();

  // Optional reset on mount
  useEffect(() => {
    resetChat();
  }, [resetChat]);

  return (
    <main className="flex bg-[#212121] h-screen overflow-hidden">

      {/* 🔥 Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SideBar />

      <div className="flex-1 flex flex-col h-screen">
        <Navbar />
        <Chat />
      </div>
    </main>
  );
}
