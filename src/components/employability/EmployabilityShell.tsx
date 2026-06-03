import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Gateway", "/gateway"],
  ["Mi Bóveda", "/vault"],
  ["Proyectos", "/projects"],
  ["Créditos", "/credits"],
  ["Config", "/account"],
];

export function EmployabilityShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            Empléate YA <span className="text-amber-300">AI</span>
          </Link>

          <nav className="flex flex-wrap gap-2 text-sm">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-white/10 px-3 py-2 text-slate-200 hover:border-amber-300 hover:text-amber-200"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </main>
  );
}
