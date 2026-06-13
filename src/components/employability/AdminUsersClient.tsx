"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Building2, Edit3, History, Plus, Search, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type UserAction = "create" | "edit" | "change";

const copy = {
  es: {
    eyebrow: "Super Admin",
    title: "Usuarios, organizaciones y perfiles",
    description: "Gestiona altas, ediciones y cambios de usuarios. Desde esta pantalla tambien puedes relacionar usuarios con empresas, emprendedores, coaches, apoyos y permisos de plataforma.",
    create: "Alta de usuario",
    edit: "Editar usuario",
    change: "Cambios y movimientos",
    actionHelp: "Selecciona una accion para preparar el registro operativo. En Supabase quedara guardado con bitacora, responsable y fecha.",
    identity: "Datos del usuario",
    organization: "Organizacion / empresa",
    permissions: "Perfil y permisos",
    name: "Nombre completo",
    email: "Correo",
    phone: "Telefono",
    organizationName: "Empresa u organizacion",
    organizationType: "Tipo de organizacion",
    companyRole: "Rol dentro de la empresa",
    profile: "Perfil de acceso",
    status: "Estado",
    credits: "Creditos iniciales",
    notes: "Notas internas",
    saveDraft: "Guardar borrador",
    createOrg: "Crear organizacion",
    search: "Buscar",
    searchPlaceholder: "Nombre, correo, organizacion, perfil o responsable...",
    origin: "Origen",
    all: "Todos",
    results: "Resultados de usuarios",
    resultHelp: "Lista demo de 5 elementos con scroll horizontal y vertical para revisar resultados amplios sin romper la pantalla.",
    profilesTitle: "Catalogo de perfiles operativos",
    organizationTypes: ["empleate_ya", "empresa", "emprendedor", "cliente_emprendedor", "usuario_online"],
    statuses: ["activo", "invitado", "pendiente", "bloqueado"],
    profiles: [
      "Usuario online",
      "Admin de RH",
      "Coach Partner",
      "Coach 1o1",
      "Coach Apoyos de RH",
      "Apoyos Super Admin",
      "Apoyos a Coach Partner",
    ],
    columns: ["Usuario", "Perfil", "Organizacion", "Rol empresa", "Origen", "Creditos", "Estado", "Ultimo cambio", "Responsable", "Notas"],
  },
  en: {
    eyebrow: "Super Admin",
    title: "Users, organizations, and profiles",
    description: "Manage user creation, edits, and changes. From this screen you can also connect users to companies, entrepreneurs, coaches, support roles, and platform permissions.",
    create: "Create user",
    edit: "Edit user",
    change: "Changes and movements",
    actionHelp: "Choose an action to prepare the operational record. In Supabase it will be stored with audit log, owner, and timestamp.",
    identity: "User data",
    organization: "Organization / company",
    permissions: "Profile and permissions",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    organizationName: "Company or organization",
    organizationType: "Organization type",
    companyRole: "Company role",
    profile: "Access profile",
    status: "Status",
    credits: "Initial credits",
    notes: "Internal notes",
    saveDraft: "Save draft",
    createOrg: "Create organization",
    search: "Search",
    searchPlaceholder: "Name, email, organization, profile, or owner...",
    origin: "Origin",
    all: "All",
    results: "User results",
    resultHelp: "Demo list of 5 items with horizontal and vertical scrolling to review wide results without breaking the layout.",
    profilesTitle: "Operational profile catalog",
    organizationTypes: ["empleate_ya", "company", "entrepreneur", "entrepreneur_client", "online_user"],
    statuses: ["active", "invited", "pending", "blocked"],
    profiles: [
      "Online user",
      "HR Admin",
      "Coach Partner",
      "1:1 Coach",
      "HR Support Coach",
      "Super Admin Support",
      "Coach Partner Support",
    ],
    columns: ["User", "Profile", "Organization", "Company role", "Origin", "Credits", "Status", "Last change", "Owner", "Notes"],
  },
} as const;

const actionIcons = {
  create: Plus,
  edit: Edit3,
  change: History,
} as const;

const demoUsers = [
  { name: "Laura Mendez", email: "laura@email.com", profile: "Usuario online", organization: "Empleate YA", companyRole: "Usuario final", origin: "usuario_online", credits: 220, status: "activo", lastChange: "12/06/2026 10:40", owner: "Leo Galvez", notes: "Compra individual Stripe. Puede ejecutar avatares segun saldo." },
  { name: "Ana Torres", email: "ana@empresa-demo.mx", profile: "Admin de RH", organization: "Empresa Demo Outplacement", companyRole: "Responsable RH", origin: "empresa", credits: 0, status: "activo", lastChange: "12/06/2026 09:15", owner: "Leo Galvez", notes: "Puede crear campanas y revisar avance de ex-colaboradores autorizados." },
  { name: "Mariana Soto", email: "mariana@franquicia-demo.mx", profile: "Coach Partner", organization: "Franquicia Demo Norte", companyRole: "Responsable franquicia", origin: "emprendedor", credits: 600, status: "activo", lastChange: "11/06/2026 17:20", owner: "Leo Galvez", notes: "Licencia minima 6 meses. Administra clientes propios." },
  { name: "Sofia Rivera", email: "sofia@empleateya.mx", profile: "Coach 1o1", organization: "Empleate YA", companyRole: "Coach ejecutivo", origin: "empleate_ya", credits: 0, status: "invitado", lastChange: "10/06/2026 13:02", owner: "Leo Galvez", notes: "Asignable a sesiones 1o1, NPS, notas y testimonios." },
  { name: "Pedro Salas", email: "pedro@partner-demo.mx", profile: "Apoyos a Coach Partner", organization: "Franquicia Demo Norte", companyRole: "Apoyo operativo", origin: "cliente_emprendedor", credits: 150, status: "pendiente", lastChange: "09/06/2026 16:12", owner: "Mariana Soto", notes: "Acceso limitado para seguimiento y soporte del coach partner." },
] as const;

export function AdminUsersClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [action, setAction] = useState<UserAction>("create");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("all");
  const [profile, setProfile] = useState("all");

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return demoUsers.filter((user) => {
      const matchesText = !normalized || Object.values(user).some((value) => String(value).toLowerCase().includes(normalized));
      const matchesOrigin = origin === "all" || user.origin === origin;
      const matchesProfile = profile === "all" || user.profile === profile;
      return matchesText && matchesOrigin && matchesProfile;
    });
  }, [origin, profile, query]);

  return (
    <div className="space-y-7">
      <header>
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]"><ShieldCheck size={15} /> {t.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-5xl text-lg leading-8 text-slate-600">{t.description}</p>
      </header>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-3">
          {(["create", "edit", "change"] as const).map((item) => {
            const Icon = actionIcons[item];
            const active = action === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setAction(item)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left font-black transition ${active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-lg shadow-purple-500/20" : "border-slate-200 bg-white text-slate-700 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]"}`}
              >
                <Icon size={19} />
                {t[item]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{t.actionHelp}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-3">
            <FormGroup title={t.identity} icon={<UsersRound size={18} />}>
              <Field label={t.name}><Input placeholder="Ej. Laura Mendez" /></Field>
              <Field label={t.email}><Input placeholder="correo@ejemplo.com" type="email" /></Field>
              <Field label={t.phone}><Input placeholder="+52 55 0000 0000" /></Field>
            </FormGroup>
            <FormGroup title={t.organization} icon={<Building2 size={18} />}>
              <Field label={t.organizationName}><Input placeholder="Ej. Empresa Demo" /></Field>
              <Field label={t.organizationType}><Select>{t.organizationTypes.map((item) => <option key={item}>{item}</option>)}</Select></Field>
              <Field label={t.companyRole}><Input placeholder="Ej. Responsable RH" /></Field>
            </FormGroup>
            <FormGroup title={t.permissions} icon={<UserCog size={18} />}>
              <Field label={t.profile}><Select>{t.profiles.map((item) => <option key={item}>{item}</option>)}</Select></Field>
              <Field label={t.status}><Select>{t.statuses.map((item) => <option key={item}>{item}</option>)}</Select></Field>
              <Field label={t.credits}><Input placeholder="0" type="number" /></Field>
            </FormGroup>
          </div>
          <div className="mt-5">
            <Label>{t.notes}</Label>
            <textarea className="min-h-28 w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]" placeholder="Notas de alta, cambio solicitado, permisos especiales o motivo de ajuste..." />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]">{t.saveDraft}</Button>
            <Button className="border border-slate-200 bg-white text-slate-700 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]">{t.createOrg}</Button>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">{t.profilesTitle}</h2>
          <div className="mt-4 space-y-2">
            {t.profiles.map((item) => (
              <div key={item} className="rounded-2xl bg-[var(--brand-primary-soft)] px-4 py-3 text-sm font-black text-[var(--brand-primary-strong)]">{item}</div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Label>{t.search}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder={t.searchPlaceholder} />
            </div>
          </div>
          <Field label={t.origin}><Select value={origin} onChange={(event) => setOrigin(event.target.value)}><option value="all">{t.all}</option>{t.organizationTypes.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
          <Field label={t.profile}><Select value={profile} onChange={(event) => setProfile(event.target.value)}><option value="all">{t.all}</option>{t.profiles.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">{t.results}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{t.resultHelp}</p>
        </div>
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full min-w-[1280px] text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr>{t.columns.map((column) => <Th key={column}>{column}</Th>)}</tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.email} className="border-b border-slate-100 last:border-0">
                  <Td><strong className="block text-slate-950">{user.name}</strong><span className="text-xs text-slate-500">{user.email}</span></Td>
                  <Td><Pill>{user.profile}</Pill></Td>
                  <Td>{user.organization}</Td>
                  <Td>{user.companyRole}</Td>
                  <Td>{user.origin}</Td>
                  <Td>{user.credits}</Td>
                  <Td><Pill>{user.status}</Pill></Td>
                  <Td>{user.lastChange}</Td>
                  <Td>{user.owner}</Td>
                  <Td>{user.notes}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FormGroup({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">{icon}{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-3 align-top text-slate-600">{children}</td>;
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex whitespace-nowrap rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--brand-primary)]">{children}</span>;
}
