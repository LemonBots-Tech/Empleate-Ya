import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        "bg-tomato-600 text-white shadow-soft hover:bg-tomato-700",
        className
      )}
      {...props}
    />
  );
}
