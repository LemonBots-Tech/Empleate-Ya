"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = readonly [label: string, href: string];

export function ShellNavTabs({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white/80 p-1 text-sm shadow-sm">
      {items.map(([label, href]) => {
        const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
              "whitespace-nowrap rounded-full px-3.5 py-2 font-semibold transition",
              active
                ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-shadow)]"
                : "text-slate-600 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-strong)]",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
