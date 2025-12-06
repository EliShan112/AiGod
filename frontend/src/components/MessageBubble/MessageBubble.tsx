export default function MessageBubble({ role, content }: any) {
  const isUser = role === "user";

  return (
    <div className={`w-full my-2 flex ${isUser ? "justify-end" : ""}`}>
      <div
        className={`max-w-[75%] p-3 rounded-lg ${
          isUser ? "bg-[#3a3a3a]" : "bg-[#1e1e1e]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
