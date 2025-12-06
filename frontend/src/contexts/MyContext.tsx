'use client'
import { createContext, Dispatch, SetStateAction } from "react";
export interface IMessage {
  role: "user" | "assistant";
  content: string;
}
export interface IThread {
  threadId: string;
  title: string;
  messages: IMessage[];
}
export interface IContext {
  isTyping: boolean;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  allThreads: IThread[];
  setAllThreads: Dispatch<SetStateAction<IThread[]>>;
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
  messages: IMessage[];
  setMessages: Dispatch<SetStateAction<IMessage[]>>;
  currentThreadId: string | null;
  setCurrentThreadId: Dispatch<SetStateAction<string | null>>;
}
export const MyContext = createContext<IContext>({
  isTyping: false,
  setIsTyping: () => {},
  allThreads: [],
  setAllThreads: () => {},
  prompt: "",
  setPrompt: () => {},
  messages: [],
  setMessages: () => {},
  currentThreadId: null,
  setCurrentThreadId: () => {},
});
