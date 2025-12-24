"use client";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faEllipsisH,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../ui/Button";
import { useEffect, useRef, useState } from "react";
import useClickOutside from "@/hooks/useClickOutside";
import MyProfile from "./MyProfile";
import api from "@/lib/api";
import { useChatStore } from "@/store/useChatStore";

interface ThreadResponse {
  threadId: string;
  title?: string;
  messages?: any[];
}

const SideBar = () => {

  const setMessages = useChatStore((s)=> s.setMessages);
  const allThreads = useChatStore((s)=> s.allThreads);
  const setAllThreads = useChatStore((s)=> s.setAllThreads);
  const setCurrentThreadId = useChatStore((s)=> s.setCurrentThreadId);
  const currentThreadId = useChatStore((s)=> s.currentThreadId);
  const setIsLoading = useChatStore((s)=> s.setIsLoading);
  const isSidebarOpen = useChatStore((s)=> s.isSidebarOpen);
  const setIsSidebarOpen = useChatStore((s)=> s.setIsSidebarOpen)

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const useDropDownRef = useRef<HTMLDivElement>(null);

  useClickOutside(useDropDownRef, () => {
    setMenuOpenId(null);
  });

  // Create new chat
  const createNewChat = () => {
    setCurrentThreadId(null);
    setMessages([]);
  };

  // Load the LIST of threads (Titles only)
  const loadThreads = async () => {
    try {
      const res = await api.get(`/api/thread`);
      setAllThreads(
        res.data.map((t: ThreadResponse) => ({
          threadId: t.threadId,
          title: t.title,
          messages: t.messages ?? [],
        }))
      );
    } catch (error) {
      console.error("Failed to load threads", error);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  //Fetch msg on click
  const fetchMsg = async (threadId: string) => {
    setCurrentThreadId(threadId);
    setMessages([]);

    // Check if we already have messages in memory
    const cachedThread = allThreads.find(t=> t.threadId === threadId);
    if(cachedThread && cachedThread.messages && cachedThread.messages.length > 0){
      setMessages(cachedThread.messages);
      return;
    }

    if(setIsLoading) setIsLoading(true);

    try {
      // Backend: getOneThread returns res.json(thread.messages) -> An Array
      const res = await api.get(`/api/thread/${threadId}`);
      setMessages(res.data);

      // Update the Sidebar list cache (so we don't fetch again if we click back)
      setAllThreads(prev => prev.map(t=>t.threadId === threadId ? {...t, messages: res.data} : t));
      
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }

  const deleteThread = async (threadId: string) => {
    // close menu immediately
    setMenuOpenId(null);

    //  Update
    setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));

    // reset the view
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
      setMessages([]);
    }

    // perform API call
    try {
      await api.delete(`/api/thread/${threadId}`);
    } catch (error) {
      console.error("Error deleting thread", error);
      // Revert state if API fails
      loadThreads();
    }
  };

  return (
    <section className={`
    fixed left-0 z-40 w-[260px] bg-[#171717] text-[#ECECEC]
    transform transition-transform duration-300 ease-in-out

    top-16 h-[calc(100vh-4rem)]
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}

    md:top-0 md:h-screen
    md:relative md:translate-x-0 md:flex

    flex flex-col p-2
  `}
  >
      {/* Top section */}
      <div className="flex items-center justify-between px-2 py-3 mb-4">
        <div
          className="flex items-center gap-2 font-medium hover:bg-[#212121] p-2 rounded-lg cursor-pointer transition-colors w-full"
          onClick={createNewChat}
        >
          <div className="p-1 rounded-full h-10  w-20 flex items-center justify-between">
            <Image src="/ChatGPT3.png" alt="gpt" width={60} height={60} />
          </div>
          <span>New chat</span>
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="ml-auto text-gray-400"
          />
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-2 text-xs font-medium text-gray-500 mb-2">Today</div>
        <ul className="space-y-1">
          {/* threads mapping */}
          {allThreads?.map((thread) => {
            const isActive = currentThreadId === thread.threadId;

            return (
              <li key={thread.threadId} className="group relative">
                <Button
                  onClick={() => {
                    fetchMsg(thread.threadId);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors
        ${isActive ? "bg-[#303030]" : "hover:bg-[#212121]"}
      `}
                >
                  <span className="flex-1 truncate text-left min-w-0">
                    {thread.title ?? "New Chat"}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(
                        menuOpenId === thread.threadId ? null : thread.threadId
                      );
                    }}
                    className={`shrink-0 flex items-center p-1 justify-center text-gray-400 hover:text-white transition-opacity ${
                      isActive || menuOpenId === thread.threadId
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }
        `}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </span>
                </Button>

                {/* Dropdown Menu */}
                {menuOpenId === thread.threadId && (
                  <div
                    ref={useDropDownRef}
                    className="absolute right-2 top-10 w-44 bg-[#2f2f2f] rounded-xl shadow-xl border border-[#424242] z-50 overflow-hidden py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      className="w-full text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2"
                      onClick={() => {
                        setMenuOpenId(null);
                        // Add rename logic here
                        console.log("Rename clicked");
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </Button>
                    <div className="h-px bg-[#424242] my-1 mx-2"></div>
                    <Button
                      className="w-full text-left px-4 py-2.5 hover:bg-[#424242] text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
                      onClick={() => deleteThread(thread.threadId)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete chat
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Profile Section */}
      <MyProfile />
    </section>
  );
};

export default SideBar;
