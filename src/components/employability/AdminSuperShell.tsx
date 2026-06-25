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
    roleTester: "Rol / especialidad de prueba",
    profileTesterHelp: "Temporal hasta activar login y roles reales.",
    currentTestContext: "Contexto activo de prueba",
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
    roleTester: "Test role / specialty",
    profileTesterHelp: "Temporary until login and real roles are active.",
    currentTestContext: "Active test context",
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

type TestProfile = (typeof testProfiles)[number]["value"];

const testRoleOptions = {
  super_admin: [{ value: "super_admin", es: "Super Admin", en: "Super Admin" }],
  super_admin_support: [
    { value: "administrative_support", es: "Apoyo administrativo", en: "Administrative support" },
    { value: "collections_support", es: "Apoyo cobranza", en: "Collections support" },
    { value: "outplacement_operator", es: "Operativo de outplacement", en: "Outplacement operator" },
    { value: "coach_partner_support", es: "Apoyo coach partner", en: "Coach partner support" },
    { value: "temporary_delegate", es: "Supervisor delegado temporal", en: "Temporary delegated supervisor" },
  ],
  online: [
    { value: "online_prospect", es: "Prospecto online", en: "Online prospect" },
    { value: "online_paid", es: "Cliente Online Pagado", en: "Paid online client" },
  ],
  coach_partner: [
    { value: "coach_partner_principal", es: "Coach partner principal", en: "Main coach partner" },
    { value: "coach_partner_collaborator", es: "Coach partner colaborador", en: "Coach partner collaborator" },
  ],
  outplacement: [
    { value: "hr_admin", es: "Administrador de RH", en: "HR Administrator" },
    { value: "hr_admin_support", es: "Apoyo administrativo RH", en: "HR administrative support" },
    { value: "outplacement_coach", es: "Coach outplacement", en: "Outplacement coach" },
    { value: "campaign_approver", es: "Aprobador de campaña", en: "Campaign approver" },
  ],
  internal_coach: [
    { value: "employability_coach", es: "Coach empleabilidad", en: "Employability coach" },
    { value: "executive_coach", es: "Coach ejecutivo", en: "Executive coach" },
    { value: "interview_coach", es: "Coach entrevistas", en: "Interview coach" },
    { value: "strategic_cv_coach", es: "Coach CV estratégico", en: "Strategic resume coach" },
    { value: "linkedin_coach", es: "Coach LinkedIn", en: "LinkedIn coach" },
  ],
  visitor: [{ value: "visitor", es: "Visitante", en: "Visitor" }],
} as const satisfies Record<TestProfile, readonly { value: string; es: string; en: string }[]>;

const testProfileDescriptions = {
  super_admin: {
    es: "Control total de usuarios, licencias, créditos, permisos, avatares, pagos y reportes.",
    en: "Full control over users, licenses, credits, permissions, avatars, payments, and reports.",
  },
  super_admin_support: {
    es: "Acceso administrativo limitado según el rol de apoyo seleccionado.",
    en: "Administrative access limited by the selected support role.",
  },
  online: {
    es: "Vista de usuario final online con acceso operativo limitado.",
    en: "Online end-user view with limited operating access.",
  },
  coach_partner: {
    es: "Opera cursos, grupos y alumnos de su propia organización Coach Partner.",
    en: "Operates courses, groups, and students for their own Coach Partner organization.",
  },
  outplacement: {
    es: "Opera cursos, campañas, ex-empleados y reportes de su organización de outplacement.",
    en: "Operates courses, campaigns, former employees, and reports for their outplacement organization.",
  },
  internal_coach: {
    es: "Opera cursos, grupos, alumnos, reportes y feedback de coaching 1o1.",
    en: "Operates courses, groups, students, reports, and 1:1 coaching feedback.",
  },
  visitor: {
    es: "Sin permisos administrativos; solo contexto público para pruebas.",
    en: "No administrative permissions; public test context only.",
  },
} as const satisfies Record<TestProfile, { es: string; en: string }>;

const roleStorageKey = "empleate-ya-nav-role";

const groups = ["core", "programs", "configuration", "money", "security"] as const;
const programUserHrefs = ["/admin/users/students", "/admin/users/outplacement-employees"] as const;

export function AdminSuperShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = copy[language];
  const [testContext, setTestContext] = useTestContextFromStorage();
  const visibleSections = adminSections.filter((item) => menuAllowedForTestContext(testContext.profile, testContext.role, item.href));
  const currentProfileLabel = labelForProfile(testContext.profile, language);
  const currentRoleLabel = labelForRole(testContext.profile, testContext.role, language);

  return (
    <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-200">{t.currentTestContext}</p>
            <h2 className="mt-2 text-lg font-black leading-tight">{currentProfileLabel}</h2>
            <p className="mt-1 text-sm font-bold text-purple-100">{currentRoleLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{testProfileDescriptions[testContext.profile][language]}</p>
          </div>
          <ProfileTestSelector language={language} profileLabel={t.profileTester} roleLabel={t.roleTester} help={t.profileTesterHelp} value={testContext} onChange={setTestContext} />
          <nav className="mt-4 space-y-5">
            {groups.map((group) => (
              <section key={group} className={visibleSections.some((item) => item.group === group) ? "" : "hidden"}>
                <p className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]">{t[group]}</p>
                <div className="mt-2 grid gap-1">
                  {visibleSections.filter((item) => item.group === group).map((item) => {
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
                            {t.userSubsections.filter(([, href]) => userSubsectionAllowedForTestContext(testContext.profile, testContext.role, href)).map(([label, href]) => (
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

function ProfileTestSelector({
  language,
  profileLabel,
  roleLabel,
  help,
  value,
  onChange,
}: {
  language: "es" | "en";
  profileLabel: string;
  roleLabel: string;
  help: string;
  value: { profile: TestProfile; role: string };
  onChange: (value: { profile: TestProfile; role: string }) => void;
}) {
  const roleOptions = testRoleOptions[value.profile];

  function changeProfile(value: string) {
    const nextProfile = parseTestProfile(value);
    const nextRole = testRoleOptions[nextProfile][0].value;
    window.localStorage.setItem("empleate-ya-nav-profile", nextProfile);
    window.localStorage.setItem(roleStorageKey, nextRole);
    onChange({ profile: nextProfile, role: nextRole });
    window.location.reload();
  }

  function changeRole(nextRole: string) {
    window.localStorage.setItem(roleStorageKey, nextRole);
    onChange({ profile: value.profile, role: nextRole });
    window.location.reload();
  }

  return (
    <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-3">
      <label className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]" htmlFor="admin-profile-tester">{profileLabel}</label>
      <select
        id="admin-profile-tester"
        value={value.profile}
        onChange={(event) => changeProfile(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-purple-100 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-purple-100"
      >
        {testProfiles.map((profile) => <option key={profile.value} value={profile.value}>{profile[language]}</option>)}
      </select>
      <label className="mt-3 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]" htmlFor="admin-role-tester">{roleLabel}</label>
      <select
        id="admin-role-tester"
        value={value.role}
        onChange={(event) => changeRole(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-purple-100 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-purple-100"
      >
        {roleOptions.map((role) => <option key={role.value} value={role.value}>{role[language]}</option>)}
      </select>
      <p className="mt-2 text-xs font-semibold leading-5 text-purple-900">{help}</p>
    </div>
  );
}

function useTestContextFromStorage() {
  const [testContext, setTestContext] = useState<{ profile: TestProfile; role: string }>({ profile: "super_admin", role: "super_admin" });

  useEffect(() => {
    const profile = parseTestProfile(window.localStorage.getItem("empleate-ya-nav-profile"));
    const storedRole = window.localStorage.getItem(roleStorageKey);
    const role = roleIsValidForProfile(profile, storedRole) ? storedRole : testRoleOptions[profile][0].value;
    setTestContext({ profile, role });
  }, []);

  return [testContext, setTestContext] as const;
}

function parseTestProfile(value: string | null): TestProfile {
  return testProfiles.some((profile) => profile.value === value) ? (value as TestProfile) : "super_admin";
}

function roleIsValidForProfile(profile: TestProfile, role: string | null): role is string {
  return Boolean(role && testRoleOptions[profile].some((option) => option.value === role));
}

function labelForProfile(profile: TestProfile, language: "es" | "en") {
  return testProfiles.find((item) => item.value === profile)?.[language] ?? testProfiles[0][language];
}

function labelForRole(profile: TestProfile, role: string, language: "es" | "en") {
  return testRoleOptions[profile].find((item) => item.value === role)?.[language] ?? testRoleOptions[profile][0][language];
}

function menuAllowedForTestContext(profile: TestProfile, role: string, href: string) {
  if (profile === "super_admin") return true;
  if (profile === "visitor" || profile === "online") return href === "/admin";
  if (profile === "internal_coach") return ["/admin", "/admin/coaching", "/admin/groups", "/admin/users/students", "/admin/reports", "/admin/feedback"].includes(href);
  if (profile === "coach_partner") return ["/admin", "/admin/users", "/admin/coaching", "/admin/groups", "/admin/users/students", "/admin/reports"].includes(href);
  if (profile === "outplacement") return ["/admin", "/admin/users", "/admin/coaching", "/admin/campaigns", "/admin/users/outplacement-employees", "/admin/reports"].includes(href);
  if (profile === "super_admin_support") {
    if (role === "temporary_delegate") return temporaryDelegationIsActiveFromStorage() ? true : href === "/admin";
    if (role === "collections_support") return ["/admin", "/admin/credits", "/admin/payments", "/admin/reports"].includes(href);
    if (role === "outplacement_operator") return ["/admin", "/admin/users", "/admin/organizations", "/admin/coaching", "/admin/campaigns", "/admin/users/outplacement-employees", "/admin/reports"].includes(href);
    if (role === "coach_partner_support") return ["/admin", "/admin/users", "/admin/organizations", "/admin/coaching", "/admin/groups", "/admin/users/students", "/admin/reports"].includes(href);
    return ["/admin", "/admin/users", "/admin/organizations"].includes(href);
  }
  return false;
}

function userSubsectionAllowedForTestContext(profile: TestProfile, role: string, href: string) {
  if (profile === "super_admin") return true;
  if (profile === "coach_partner") return href === "/admin/users/coach-partner";
  if (profile === "outplacement") return href === "/admin/users/outplacement-rh";
  if (profile === "internal_coach") return false;
  if (profile === "super_admin_support") {
    if (role === "temporary_delegate") return temporaryDelegationIsActiveFromStorage();
    if (role === "administrative_support") return true;
    if (role === "outplacement_operator") return href === "/admin/users/outplacement-rh";
    if (role === "coach_partner_support") return href === "/admin/users/coach-partner";
    return href === "/admin/users/online";
  }
  return false;
}

function temporaryDelegationIsActiveFromStorage() {
  if (typeof window === "undefined") return false;
  try {
    const storedUsers = JSON.parse(window.localStorage.getItem("empleate-ya-admin-users-v3") ?? "[]") as Array<{ name?: string; role?: string; status?: string; extraData?: Record<string, unknown> }>;
    const monica = storedUsers.find((user) => user.name === "Monica Reyes" && user.role === "Supervisor delegado temporal");
    const candidate = monica ?? { status: "activo", extraData: { fecha_de_delegacion: "2026-06-01", fecha_fin_delegacion: "2026-12-31" } };
    const status = String(candidate.status ?? "").toLowerCase();
    if (status !== "activo" && status !== "active") return false;
    const start = dateFromExtra(candidate.extraData, ["fecha_de_delegacion", "delegation_start_date"]);
    const end = dateFromExtra(candidate.extraData, ["fecha_fin_delegacion", "delegation_end_date"]);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return (!start || today >= start) && (!end || today <= end);
  } catch {
    return false;
  }
}

function dateFromExtra(extraData: Record<string, unknown> | undefined, keys: string[]) {
  const value = keys.map((key) => extraData?.[key]).find((item) => typeof item === "string" && item.length > 0);
  if (typeof value !== "string") return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
