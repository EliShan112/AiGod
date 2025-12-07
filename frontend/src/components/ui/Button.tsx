'use client';
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export default function Button({
  children,
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95";

  const variants = {
    default: "text-white cursor-pointer ",
    outline: "border border-gray-300 hover:bg-gray-100",
    secondary: "bg-gray-200 hover:bg-gray-300",
    ghost: "hover:bg-gray-100",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
