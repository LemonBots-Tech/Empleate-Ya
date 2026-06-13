"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  BadgeDollarSign,
  BookOpenCheck,
  Bot,
  Building2,
  ClipboardCheck,
  CircleDollarSign,
  FileBarChart,
  FolderKanban,
  KeyRound,
  MessageSquareQuote,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export const adminSections = [
  { href: "/admin", key: "overview", icon: ShieldCheck, group: "core" },
  { href: "/admin/users", key: "users", icon: UsersRound, group: "core" },
  { href: "/admin/organizations", key: "organizations", icon: Building2, group: "core" },
  { href: "/admin/campaigns", key: "campaigns", icon: FolderKanban, group: "core" },
  { href: "/admin/avatars", key: "avatars", icon: Bot, group: "configuration" },
  { href: "/admin/catalogs", key: "catalogs", icon: Settings2, group: "configuration" },
  { href: "/admin/permissions", key: "permissions", icon: KeyRound, group: "configuration" },
  { href: "/admin/credits", key: "credits", icon: CircleDollarSign, group: "money" },
  { href: "/admin/payments", key: "payments", icon: BadgeDollarSign, group: "money" },
  { href: "/admin/reports", key: "reports", icon: FileBarChart, group: "operations" },
  { href: "/admin/coaching", key: "coaching", icon: BookOpenCheck, group: "operations" },
  { href: "/admin/testimonials", key: "testimonials", icon: MessageSquareQuote, group: "operations" },
  { href: "/admin/audit", key: "audit", icon: Activity, group: "security" },
] as const;

const copy = {
  es: {
    title: "Super Admin",
    subtitle: "Control total de usuarios, licencias, creditos, permisos, avatares, pagos y reportes.",
    core: "Operacion",
    configuration: "Configuracion",
    money: "Creditos y pagos",
    operations: "Seguimiento",
    security: "Seguridad",
    overview: "Resumen",
    users: "Usuarios",
    organizations: "Organizaciones",
    campaigns: "Campañas",
    avatars: "Avatares",
    catalogs: "Catalogos",
    permissions: "Permisos",
    credits: "Creditos",
    payments: "Pagos",
    reports: "Reportes",
    coaching: "Coaching",
    testimonials: "Testimonios",
    audit: "Bitacora",
    userSubsections: [
      ["Online", "/admin/users/online"],
      ["Apoyos Super Admin", "/admin/users/super-admin-support"],
      ["Coach Partner", "/admin/users/coach-partner"],
      ["Empresa outplacement", "/admin/users/outplacement-rh"],
      ["Coach interno 1o1", "/admin/users/internal-coach"],
    ],
  },
  en: {
    title: "Super Admin",
    subtitle: "Full control over users, licenses, credits, permissions, avatars, payments, and reports.",
    core: "Operations",
    configuration: "Configuration",
    money: "Credits and payments",
    operations: "Follow-up",
    security: "Security",
    overview: "Overview",
    users: "Users",
    organizations: "Organizations",
    campaigns: "Campaigns",
    avatars: "Avatars",
    catalogs: "Catalogs",
    permissions: "Permissions",
    credits: "Credits",
    payments: "Payments",
    reports: "Reports",
    coaching: "Coaching",
    testimonials: "Testimonials",
    audit: "Audit log",
    userSubsections: [
      ["Online", "/admin/users/online"],
      ["Super Admin Support", "/admin/users/super-admin-support"],
      ["Coach Partner", "/admin/users/coach-partner"],
      ["Outplacement company", "/admin/users/outplacement-rh"],
      ["Internal 1:1 Coach", "/admin/users/internal-coach"],
    ],
  },
} as const;

const groups = ["core", "configuration", "money", "operations", "security"] as const;

export function AdminSuperShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-200">{t.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{t.subtitle}</p>
          </div>
          <nav className="mt-4 space-y-5">
            {groups.map((group) => (
              <section key={group}>
                <p className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]">{t[group]}</p>
                <div className="mt-2 grid gap-1">
                  {adminSections.filter((item) => item.group === group).map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-black transition",
                            active || (item.key === "users" && pathname.startsWith("/admin/users")) ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-purple-500/20" : "text-slate-600 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]",
                          )}
                        >
                          <Icon size={17} />
                          {t[item.key]}
                        </Link>
                        {item.key === "users" && pathname.startsWith("/admin/users") ? (
                          <div className="ml-5 mt-2 grid gap-1 border-l border-slate-200 pl-3">
                            {t.userSubsections.map(([label, href]) => (
                              <Link
                                key={href}
                                href={href}
                                className={cn(
                                  "rounded-xl px-3 py-2 text-xs font-black transition",
                                  pathname === href ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                )}
                              >
                                {label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
