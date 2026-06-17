"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, CircleDollarSign, ClipboardCheck, FolderKanban, ListChecks, Settings2, UsersRound, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "/admin/users", key: "users", icon: UsersRound },
  { href: "/admin/organizations", key: "organizations", icon: Building2 },
  { href: "/admin/campaigns", key: "campaigns", icon: FolderKanban },
  { href: "/admin/groups", key: "groups", icon: ClipboardCheck },
  { href: "/admin/coaching", key: "coaching", icon: BookOpenCheck },
  { href: "/admin/catalogs", key: "catalogs", icon: Settings2 },
  { href: "/admin/credits", key: "credits", icon: CircleDollarSign },
] as const;

const copy = {
  es: {
    title: "Centro de control",
    users: "Usuarios",
    organizations: "Organizaciones",
    campaigns: "Campañas",
    groups: "Grupos",
    coaching: "Trainee & Coaching",
    catalogs: "Catálogos",
    credits: "Créditos",
  },
  en: {
    title: "Control center",
    users: "Users",
    organizations: "Organizations",
    campaigns: "Campaigns",
    groups: "Groups",
    coaching: "Trainee & Coaching",
    catalogs: "Catalogs",
    credits: "Credits",
  },
} as const;

export function AdminControlNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <nav className="rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-2 px-3 pt-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]">
        <ListChecks size={15} />
        {t.title}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || (pathname === "/admin" && tab.key === "users");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition",
                active ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-purple-500/20" : "bg-slate-50 text-slate-600 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]",
              )}
            >
              <Icon size={17} />
              {t[tab.key]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
