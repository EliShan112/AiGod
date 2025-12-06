"use client";

export default function Button({ children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="bg-[#2f2f2f] px-4 py-2 rounded-lg hover:bg-[#3a3a3a] transition"
    >
      {children}
    </button>
  );
}
