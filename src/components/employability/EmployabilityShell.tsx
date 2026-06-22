"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { skillRegistry } from "@/ai/skillRegistry";
import { appLanguageOptions, useLanguage } from "@/lib/i18n/LanguageProvider";
import { ShellNavTabs } from "./ShellNavTabs";

type ShellRole = "visitor" | "online" | "super_admin" | "super_admin_support" | "outplacement" | "internal_coach" | "coach_partner";

type PublicUserLike = {
  email?: string;
  role?: string;
  userType?: string;
  profileType?: string;
};

type LocalizedNavItem = {
  key: string;
  href: string;
  es: string;
  en: string;
};

const navCatalog = {
  home: { key: "home", href: "/", es: "Inicio", en: "Home" },
  dashboard: { key: "dashboard", href: "/dashboard", es: "Dashboard", en: "Dashboard" },
  agents: { key: "agents", href: "/modules", es: "Agentes", en: "Agents" },
  coaching: { key: "coaching", href: "/coaching", es: "Coaching 1o1", en: "1:1 Coaching" },
  coachPartner: { key: "coachPartner", href: "/entrepreneurs", es: "Coach Partner", en: "Coach Partner" },
  outplacement: { key: "outplacement", href: "/business-services", es: "Outplacement para empresas", en: "Outplacement for companies" },
  vault: { key: "vault", href: "/vault", es: "Mi Bóveda", en: "My Vault" },
  projects: { key: "projects", href: "/projects", es: "Proyectos", en: "Projects" },
  credits: { key: "credits", href: "/credits", es: "Créditos", en: "Credits" },
  profile: { key: "profile", href: "/account", es: "Mi perfil", en: "My profile" },
  admin: { key: "admin", href: "/admin", es: "Administración", en: "Administration" },
} satisfies Record<string, LocalizedNavItem>;

const navByRole: Record<ShellRole, readonly (keyof typeof navCatalog | "agentMenu")[]> = {
  visitor: ["home", "agentMenu", "coaching", "coachPartner", "outplacement"],
  online: ["home", "dashboard", "projects", "vault", "credits", "profile"],
  super_admin: ["home", "dashboard", "agentMenu", "coaching", "coachPartner", "outplacement", "projects", "vault", "profile", "credits", "admin"],
  super_admin_support: ["home", "dashboard", "agentMenu", "coaching", "coachPartner", "outplacement", "projects", "vault", "profile", "credits", "admin"],
  outplacement: ["home", "agentMenu", "outplacement", "profile", "vault", "projects", "credits", "admin"],
  internal_coach: ["home", "dashboard", "agentMenu", "coaching", "vault", "profile", "projects", "credits", "admin"],
  coach_partner: ["home", "dashboard", "agentMenu", "coachPartner", "profile", "vault", "projects", "credits", "admin"],
};

const agentMenuCopy = {
  es: { label: "Agentes", open: "Abrir menú de agentes" },
  en: { label: "Agents", open: "Open agents menu" },
} as const;

const agentGroups = [
  { es: "Discovery", en: "Discovery", items: ["lumo", "boost_me", "clio", "recharge", "mr_ikigai"] },
  { es: "CV estratégico", en: "Strategic resume", items: ["scorex", "optim", "scorex_360"] },
  { es: "LinkedIn", en: "LinkedIn", items: ["mr_boost_linked", "tommy_lee_picture"] },
  { es: "Prospección", en: "Prospecting", items: ["new_job_challenge", "indiana_jobs"] },
  { es: "Persuasión", en: "Persuasion", items: ["mr_wow", "miss_quest"] },
] as const;

export function EmployabilityShell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
  const [role, setRole] = useState<ShellRole>("super_admin");

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      const simulatedRole = typeof window !== "undefined" ? window.localStorage.getItem("empleate-ya-nav-profile") : null;
      if (isShellRole(simulatedRole)) {
        setRole(simulatedRole);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json() as { user?: PublicUserLike | null };
        if (!cancelled) setRole(roleFromUser(data.user));
      } catch {
        if (!cancelled) setRole("super_admin");
      }
    }

    void loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  const navTokens = navByRole[role];

  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] text-[var(--brand-ink)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[color:var(--brand-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-[var(--brand-ink)]">Empléate <span className="text-[var(--brand-primary)]">YA</span></Link>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex max-w-full flex-wrap gap-1 rounded-[1.25rem] border border-slate-200 bg-white/80 p-1 text-sm shadow-sm md:rounded-full">
              {navTokens.map((token) => token === "agentMenu" ? (
                <AgentGroupsMenu key={token} language={language} />
              ) : (
                <ShellNavTabs key={token} items={[[navCatalog[token][language], navCatalog[token].href]]} bare />
              ))}
            </div>
            <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm">
              {appLanguageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={`flex items-center justify-center gap-1 rounded-full px-3 py-2 font-black transition ${language === option.value ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-slate-600 hover:bg-[var(--brand-primary-soft)]"}`}
                  aria-label={option.label}
                  aria-pressed={language === option.value}
                >
                  <span aria-hidden="true" className={`${option.flagClass} rounded-[3px] shadow-sm`} />
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12">{children}</div>
    </main>
  );
}

function AgentGroupsMenu({ language }: { language: "es" | "en" }) {
  const pathname = usePathname();
  const t = agentMenuCopy[language];
  const active = pathname.startsWith("/modules") || pathname.startsWith("/scorex") || pathname.startsWith("/optim");

  return (
    <details className="group relative shrink-0">
      <summary
        aria-label={t.open}
        className={[
          "flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 font-semibold transition marker:hidden [&::-webkit-details-marker]:hidden",
          active
            ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-shadow)]"
            : "text-slate-600 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-strong)]",
        ].join(" ")}
      >
        {t.label}
        <ChevronDown size={15} className="transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(92vw,720px)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]">
        <div className="grid gap-3 md:grid-cols-2">
          {agentGroups.map((group) => {
            const availableItems = group.items
              .map((id) => skillRegistry[id as keyof typeof skillRegistry])
              .filter(Boolean);

            if (!availableItems.length) return null;

            return (
              <section key={group.es} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]">{group[language]}</p>
                <div className="mt-2 grid gap-1">
                  {availableItems.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/modules/${skill.id}`}
                      className="rounded-xl px-2 py-2 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-[var(--brand-primary-strong)] hover:shadow-sm"
                    >
                      {skill.name}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function roleFromUser(user: PublicUserLike | null | undefined): ShellRole {
  // Temporary development default: until Supabase login and business roles are active,
  // the working shell behaves as Super Admin so all admin flows remain testable.
  if (!user) return "super_admin";
  const rawRole = `${user.role ?? ""} ${user.userType ?? ""} ${user.profileType ?? ""}`.toLowerCase();
  const email = user.email?.toLowerCase() ?? "";

  if (email === "leo.galvez.medina@gmail.com" || email === "lgalvez@nielsen-technology.com" || email === "demo@empleateya.local" || rawRole.includes("super admin")) return "super_admin";
  if (rawRole.includes("apoyo") || rawRole.includes("support")) return "super_admin_support";
  if (rawRole.includes("outplacement") || rawRole.includes("administrador rh") || rawRole.includes("admin rh")) return "outplacement";
  if (rawRole.includes("coach interno") || rawRole.includes("internal coach") || rawRole.includes("coach 1o1")) return "internal_coach";
  if (rawRole.includes("coach partner")) return "coach_partner";

  return "online";
}

function isShellRole(value: string | null): value is ShellRole {
  return value === "visitor" || value === "online" || value === "super_admin" || value === "super_admin_support" || value === "outplacement" || value === "internal_coach" || value === "coach_partner";
}
