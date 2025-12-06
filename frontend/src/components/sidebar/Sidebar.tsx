"use client";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faEllipsisH,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons"; // Added generic icons
import Button from "../ui/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { IThread, MyContext } from "@/contexts/MyContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import useClickOutside from "@/hooks/useClickOutside";

interface ThreadResponse {
  threadId: string;
  title?: string;
  messages?: any[];
}

const SideBar = () => {
  const {
    setMessages,
    allThreads,
    setAllThreads,
    setCurrentThreadId,
    currentThreadId, 
  } = useContext(MyContext);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const useDropDownRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(useDropDownRef, () => {
    setMenuOpenId(null);
  });

  const createNewChat = () => {
    const id = uuidv4();
    const newThread: IThread = {
      threadId: id,
      title: "New Chat",
      messages: [],
    };

    // Optional: You might want to save this to DB immediately here too
    setAllThreads((prev) => [newThread, ...prev]); // Add to top of list
    setCurrentThreadId(id);
    setMessages([]);
  };

  const loadThreads = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/thread`
      );
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

  const deleteThread = async (threadId: string) => {
    // 1. Close menu immediately
    setMenuOpenId(null);

    // 2. Optimistic Update: Remove from UI immediately for speed
    setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));

    // 3. If we deleted the active chat, reset the view
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
      setMessages([]);
    }

    // 4. Perform API call
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/thread/${threadId}`
      );
    } catch (error) {
      console.error("Error deleting thread", error);
      // Optional: Revert state if API fails
      loadThreads();
    }
  };

  return (
    <section className="sidebar bg-[#171717] text-[#ECECEC] flex flex-col h-screen w-[260px] p-2">
      {/* Top section */}
      <div className="flex items-center justify-between px-2 py-3 mb-2">
        <div
          className="flex items-center gap-2 font-medium hover:bg-[#212121] p-2 rounded-lg cursor-pointer transition-colors w-full"
          onClick={createNewChat}
        >
          <div className="p-1 rounded-full h-7 w-7 flex items-center justify-center">
            <Image src="/ChatGPT.png" alt="gpt" width={20} height={20} />
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
          {/* Note: Map uses threadId as key, not idx */}
          {allThreads?.map((thread) => {
            const isActive = currentThreadId === thread.threadId;

            return (
              <li key={thread.threadId} className="group relative">
                <Button
                  onClick={() => {
                    setCurrentThreadId(thread.threadId);
                    setMessages(thread.messages || []);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors
                    ${isActive ? "bg-[#303030]" : "hover:bg-[#212121]"}
                  `}
                >
                  <span className="truncate flex-1 text-left">
                    {thread.title ?? "New Chat"}
                  </span>

                  {/* Ellipsis triggers menu */}
                  {(isActive || menuOpenId === thread.threadId) && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle logic
                        setMenuOpenId(
                          menuOpenId === thread.threadId
                            ? null
                            : thread.threadId
                        );
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </span>
                  )}
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
                    <div className="h-[1px] bg-[#424242] my-1 mx-2"></div>
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
      <div className="mt-2 pt-2 border-t border-[#303030] px-2 py-3 flex items-center gap-3 hover:bg-[#212121] rounded-lg cursor-pointer transition-colors">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
          ES
        </div>
        <div className="text-sm font-medium">Eli Shan</div>
      </div>
    </section>
  );
};

export default SideBar;
