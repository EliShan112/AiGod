"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore"; // Import store to reset on load (optional)

import Chat from "@/components/chats/Chat";
import Navbar from "@/components/Layouts/Navbar";
import SideBar from "@/components/sidebar/Sidebar";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useChatStore((s) => s.isLoading);
  const resetChat = useChatStore((s) => s.resetChat); 
  const router = useRouter();

  // 1. Auth Protection
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  // 2. (Optional) Cleanup: Reset chat when the user leaves the page or refreshes
  // This replaces your old `useState(() => uuidv4())` logic
  useEffect(() => {
    // When Home mounts, ensure we start fresh (or you can remove this to keep history)
    resetChat(); 
  }, []);

  // if (isLoading) return <div className="text-white">Loading...</div>;

  return (
    <main className="flex bg-[#212121] h-screen overflow-hidden">
      
      <SideBar />

      <div className="flex-1 flex flex-col h-screen">
        <Navbar />
        <Chat />
      </div>
    </main>
  );
}