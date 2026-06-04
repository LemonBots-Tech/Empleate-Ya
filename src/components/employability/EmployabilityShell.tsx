import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  ["Inicio", "/"],
  ["Dashboard", "/dashboard"],
  ["Gateway", "/gateway"],
  ["Mi Bóveda", "/vault"],
  ["Proyectos", "/projects"],
  ["Créditos", "/credits"],
];

export function EmployabilityShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] text-[var(--brand-ink)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[color:var(--brand-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-[var(--brand-ink)]">Empléate <span className="text-[var(--brand-primary)]">YA</span></Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full px-3.5 py-2 font-semibold text-slate-600 transition hover:bg-white hover:text-[var(--brand-primary-strong)] hover:shadow-sm">{label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12">{children}</div>
    </main>
  );
}
