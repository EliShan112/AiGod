'use client';
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

const Chat = () => {
  return (
    <div className="flex-1 flex flex-col text-center bg-[#212121] overflow-y-auto">
      <ChatWindow />
      <ChatInput />
    </div>
  );
};

export default Chat;
