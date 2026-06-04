import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-tomato-500 focus:ring-2 focus:ring-tomato-100 sm:text-sm", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-tomato-500 focus:ring-2 focus:ring-tomato-100 sm:text-sm", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-tomato-500 focus:ring-2 focus:ring-tomato-100 sm:text-sm", className)} {...props} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-semibold text-gray-700">{children}</label>;
}
