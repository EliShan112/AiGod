import { create } from "zustand";

// 1. Data Interfaces
export interface IMessage {
  role: "user" | "assistant" | "model"; // Added 'model' just in case
  content: string;
}

export interface IThread {
  threadId: string;
  title: string;
  messages: IMessage[];
}

// 2. Store Interface (State + Actions)
interface ChatState {
  // --- STATE ---
  isTyping: boolean;
  isLoading: boolean;
  prompt: string;
  currentThreadId: string | null;
  messages: IMessage[];
  allThreads: IThread[];
  isSidebarOpen: boolean;

  // --- BASIC ACTIONS (Setters) ---
  setIsTyping: (isTyping: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setPrompt: (prompt: string) => void;
  setCurrentThreadId: (id: string | null) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  
  // We allow passing a direct array OR a function (to mimic React's setState)
  setMessages: (messages: IMessage[] | ((prev: IMessage[]) => IMessage[])) => void;
  setAllThreads: (threads: IThread[] | ((prev: IThread[]) => IThread[])) => void;

  // --- HELPER ACTIONS (The "Zustand Way") ---
  // These make your components much cleaner
  addMessage: (msg: IMessage) => void;
  updateLastMessage: (content: string) => void;
  resetChat: () => void;
  toggleSidebar: () => void;
}

// 3. Store Implementation
export const useChatStore = create<ChatState>((set) => ({
  // Initial State
  isSidebarOpen: false,
  isTyping: false,
  isLoading: false,
  prompt: "",
  currentThreadId: null,
  messages: [],
  allThreads: [],

  // Setters
  setIsTyping: (isTyping) => set({ isTyping }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setPrompt: (prompt) => set({ prompt }),
  setCurrentThreadId: (currentThreadId) => set({ currentThreadId }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  // flexible setMessages (handles value or function)
  setMessages: (updater) => set((state) => ({
    messages: typeof updater === 'function' ? updater(state.messages) : updater
  })),

  // flexible setAllThreads (handles value or function)
  setAllThreads: (updater) => set((state) => ({
    allThreads: typeof updater === 'function' ? updater(state.allThreads) : updater
  })),

  // Helpers
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, msg] 
  })),

  updateLastMessage: (content) => set((state) => {
    const msgs = [...state.messages];
    if (msgs.length === 0) return {}; // Do nothing if empty
    
    // Update the very last message content
    msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
    return { messages: msgs };
  }),

  resetChat: () => set({ 
    messages: [], 
    currentThreadId: null, 
    prompt: "" 
  }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));