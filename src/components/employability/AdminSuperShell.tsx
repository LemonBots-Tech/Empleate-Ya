"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
  MessageSquareQuote,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export const adminSections = [
  { href: "/admin", key: "overview", icon: ShieldCheck, group: "core" },
  { href: "/admin/users", key: "users", icon: UsersRound, group: "core" },
  { href: "/admin/organizations", key: "organizations", icon: Building2, group: "core" },
  { href: "/admin/coaching", key: "coaching", icon: BookOpenCheck, group: "programs" },
  { href: "/admin/groups", key: "groups", icon: ClipboardCheck, group: "programs" },
  { href: "/admin/campaigns", key: "campaigns", icon: FolderKanban, group: "programs" },
  { href: "/admin/users/students", key: "students", icon: UsersRound, group: "programs" },
  { href: "/admin/users/outplacement-employees", key: "outplacementEmployees", icon: UsersRound, group: "programs" },
  { href: "/admin/reports", key: "reports", icon: FileBarChart, group: "programs" },
  { href: "/admin/avatars", key: "avatars", icon: Bot, group: "configuration" },
  { href: "/admin/feedback", key: "feedback", icon: MessageSquareQuote, group: "configuration" },
  { href: "/admin/testimonials", key: "testimonials", icon: MessageSquareQuote, group: "configuration" },
  { href: "/admin/credits", key: "credits", icon: CircleDollarSign, group: "money" },
  { href: "/admin/payments", key: "payments", icon: BadgeDollarSign, group: "money" },
  { href: "/admin/audit", key: "audit", icon: Activity, group: "security" },
] as const;

const copy = {
  es: {
    title: "Super Admin",
    subtitle: "Control total de usuarios, licencias, creditos, permisos, avatares, pagos y reportes.",
    core: "Operacion",
    programs: "Programas de capacitacion / outplacement",
    configuration: "Configuracion",
    money: "Creditos y pagos",
    security: "Seguridad",
    overview: "Resumen",
    users: "Usuarios",
    organizations: "Organizaciones",
    campaigns: "Campañas",
    groups: "Grupos",
    students: "Alumnos",
    outplacementEmployees: "Ex-empleados outplacement",
    avatars: "Avatares",
    credits: "Creditos",
    payments: "Pagos",
    reports: "Reportes",
    feedback: "Feedback",
    coaching: "Cursos de Coaching & Outplacement",
    testimonials: "Testimonios",
    audit: "Bitacora",
    profileTester: "Perfil de prueba",
    profileTesterHelp: "Temporal hasta activar login y roles reales.",
    userSubsections: [
      ["Online", "/admin/users/online"],
      ["Apoyos Super Admin", "/admin/users/super-admin-support"],
      ["Coach interno 1o1", "/admin/users/internal-coach"],
      ["Coach Partner", "/admin/users/coach-partner"],
      ["Outplacement", "/admin/users/outplacement-rh"],
    ],
  },
  en: {
    title: "Super Admin",
    subtitle: "Full control over users, licenses, credits, permissions, avatars, payments, and reports.",
    core: "Operations",
    programs: "Training / outplacement programs",
    configuration: "Configuration",
    money: "Credits and payments",
    security: "Security",
    overview: "Overview",
    users: "Users",
    organizations: "Organizations",
    campaigns: "Campaigns",
    groups: "Groups",
    students: "Students",
    outplacementEmployees: "Outplacement former employees",
    avatars: "Avatars",
    credits: "Credits",
    payments: "Payments",
    reports: "Reports",
    feedback: "Feedback",
    coaching: "Coaching & Outplacement Courses",
    testimonials: "Testimonials",
    audit: "Audit log",
    profileTester: "Test profile",
    profileTesterHelp: "Temporary until login and real roles are active.",
    userSubsections: [
      ["Online", "/admin/users/online"],
      ["Super Admin Support", "/admin/users/super-admin-support"],
      ["Internal 1:1 Coach", "/admin/users/internal-coach"],
      ["Coach Partner", "/admin/users/coach-partner"],
      ["Outplacement", "/admin/users/outplacement-rh"],
    ],
  },
} as const;

const testProfiles = [
  { value: "super_admin", es: "Super Admin", en: "Super Admin" },
  { value: "super_admin_support", es: "Apoyo Super Admin", en: "Super Admin Support" },
  { value: "online", es: "Usuario Online", en: "Online user" },
  { value: "coach_partner", es: "Coach Partner", en: "Coach Partner" },
  { value: "outplacement", es: "Outplacement RH", en: "Outplacement HR" },
  { value: "internal_coach", es: "Coach interno 1o1", en: "Internal 1:1 Coach" },
  { value: "visitor", es: "Visitante", en: "Visitor" },
] as const;

const groups = ["core", "programs", "configuration", "money", "security"] as const;
const programUserHrefs = ["/admin/users/students", "/admin/users/outplacement-employees"] as const;

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
          <ProfileTestSelector language={language} label={t.profileTester} help={t.profileTesterHelp} />
          <nav className="mt-4 space-y-5">
            {groups.map((group) => (
              <section key={group}>
                <p className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]">{t[group]}</p>
                <div className="mt-2 grid gap-1">
                  {adminSections.filter((item) => item.group === group).map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    const userHubActive = item.key === "users" && pathname.startsWith("/admin/users") && !programUserHrefs.includes(pathname as (typeof programUserHrefs)[number]);
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-black transition",
                            active || userHubActive ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-purple-500/20" : "text-slate-600 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]",
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

function ProfileTestSelector({ language, label, help }: { language: "es" | "en"; label: string; help: string }) {
  const [selectedProfile, setSelectedProfile] = useStateFromStorage();

  function changeProfile(value: string) {
    window.localStorage.setItem("empleate-ya-nav-profile", value);
    setSelectedProfile(value);
    window.location.reload();
  }

  return (
    <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-3">
      <label className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]" htmlFor="admin-profile-tester">{label}</label>
      <select
        id="admin-profile-tester"
        value={selectedProfile}
        onChange={(event) => changeProfile(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-purple-100 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-purple-100"
      >
        {testProfiles.map((profile) => <option key={profile.value} value={profile.value}>{profile[language]}</option>)}
      </select>
      <p className="mt-2 text-xs font-semibold leading-5 text-purple-900">{help}</p>
    </div>
  );
}

function useStateFromStorage() {
  const [selectedProfile, setSelectedProfile] = useState("super_admin");

  useEffect(() => {
    setSelectedProfile(window.localStorage.getItem("empleate-ya-nav-profile") ?? "super_admin");
  }, []);

  return [selectedProfile, setSelectedProfile] as const;
}
