"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Building2, Edit3, Search, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export type AdminUserKind = "online" | "super-admin-support" | "coach-partner" | "outplacement-rh" | "internal-coach";

type DemoUser = {
  kind: AdminUserKind;
  name: string;
  email: string;
  organization: string;
  role: string;
  phone: string;
  status: string;
  credits: number;
  owner: string;
  lastChange: string;
  notes: string;
};

const kindConfig = {
  es: {
    online: {
      title: "Usuarios online",
      description: "Alta y administracion de usuarios finales que compran creditos o usan pruebas limitadas por avatar.",
      profile: "Usuario online",
      organizationLabel: "Origen comercial",
      organizationPlaceholder: "Ej. Empleate YA / campana online / referido",
      roleLabel: "Tipo de usuario online",
      roles: ["Usuario final con creditos", "Usuario final prueba", "Usuario final referido", "Usuario final sin compra"],
      extraFields: ["Paquete de creditos", "Stripe customer ID", "Acepto privacidad"],
    },
    "super-admin-support": {
      title: "Usuarios de apoyo a Super Admin",
      description: "Alta de usuarios internos o delegados con permisos administrativos controlados por rol y bitacora.",
      profile: "Apoyo Super Admin",
      organizationLabel: "Area de Empleate YA",
      organizationPlaceholder: "Ej. Operaciones / cobranza / soporte",
      roleLabel: "Rol de apoyo",
      roles: ["Apoyo administrativo", "Apoyo cobranza", "Operativo outplacement", "Apoyo coach partner", "Supervisor delegado temporal"],
      extraFields: ["Fecha fin delegacion", "Permisos permitidos", "Supervisor responsable"],
    },
    "coach-partner": {
      title: "Coach Partner",
      description: "Alta de emprendedores o franquiciatarios que atenderan clientes propios con la metodologia de Empleate YA.",
      profile: "Coach Partner",
      organizationLabel: "Franquicia / organizacion partner",
      organizationPlaceholder: "Ej. Franquicia Demo Norte",
      roleLabel: "Rol partner",
      roles: ["Responsable franquicia", "Coach partner principal", "Coach partner colaborador"],
      extraFields: ["Licencia minima 6 meses", "Fecha inicio licencia", "Clientes autorizados"],
    },
    "outplacement-rh": {
      title: "Administrador RH y apoyos de outplacement",
      description: "Usuarios de empresas cliente que administran campanas de outplacement y apoyos con rol operativo definido.",
      profile: "Empresa outplacement",
      organizationLabel: "Empresa cliente",
      organizationPlaceholder: "Ej. Empresa Demo Outplacement",
      roleLabel: "Rol en empresa",
      roles: ["Administrador RH", "Apoyo administrativo RH", "Apoyo seguimiento outplacement", "Lectura ejecutiva", "Aprobador de campana"],
      extraFields: ["Campana asignada", "Permiso para ver avance", "Puede aprobar participantes"],
    },
    "internal-coach": {
      title: "Coach interno 1o1 de Empleate YA",
      description: "Alta de coaches internos para sesiones 1o1, cursos, notas, NPS y seguimiento de testimonios.",
      profile: "Coach interno 1o1",
      organizationLabel: "Unidad de servicio",
      organizationPlaceholder: "Ej. Coaching 1o1 / cursos online",
      roleLabel: "Especialidad del coach",
      roles: ["Coach empleabilidad", "Coach ejecutivo", "Coach entrevistas", "Coach CV estrategico", "Coach LinkedIn"],
      extraFields: ["Disponibilidad", "Modalidad", "NPS minimo esperado"],
    },
  },
  en: {
    online: {
      title: "Online users",
      description: "Create and manage final users who buy credits or use limited avatar trials.",
      profile: "Online user",
      organizationLabel: "Commercial origin",
      organizationPlaceholder: "Example: Empleate YA / online campaign / referral",
      roleLabel: "Online user type",
      roles: ["Final user with credits", "Trial final user", "Referred final user", "Final user without purchase"],
      extraFields: ["Credit package", "Stripe customer ID", "Privacy accepted"],
    },
    "super-admin-support": {
      title: "Super Admin support users",
      description: "Create internal or delegated users with controlled administrative permissions by role and audit log.",
      profile: "Super Admin Support",
      organizationLabel: "Empleate YA area",
      organizationPlaceholder: "Example: Operations / collections / support",
      roleLabel: "Support role",
      roles: ["Administrative support", "Collections support", "Outplacement operator", "Coach partner support", "Temporary delegated supervisor"],
      extraFields: ["Delegation end date", "Allowed permissions", "Responsible supervisor"],
    },
    "coach-partner": {
      title: "Coach Partner",
      description: "Create entrepreneurs or franchisees who will serve their own clients with the Empleate YA methodology.",
      profile: "Coach Partner",
      organizationLabel: "Franchise / partner organization",
      organizationPlaceholder: "Example: Demo North Franchise",
      roleLabel: "Partner role",
      roles: ["Franchise owner", "Main coach partner", "Coach partner collaborator"],
      extraFields: ["Minimum 6-month license", "License start date", "Authorized clients"],
    },
    "outplacement-rh": {
      title: "HR admin and outplacement support",
      description: "Company client users who manage outplacement campaigns and support roles with defined permissions.",
      profile: "Outplacement company",
      organizationLabel: "Client company",
      organizationPlaceholder: "Example: Demo Outplacement Company",
      roleLabel: "Company role",
      roles: ["HR Administrator", "HR administrative support", "Outplacement follow-up support", "Executive read-only", "Campaign approver"],
      extraFields: ["Assigned campaign", "Can view progress", "Can approve participants"],
    },
    "internal-coach": {
      title: "Internal 1:1 coach",
      description: "Create internal coaches for 1:1 sessions, courses, notes, NPS, and testimonial follow-up.",
      profile: "Internal 1:1 Coach",
      organizationLabel: "Service unit",
      organizationPlaceholder: "Example: 1:1 Coaching / online courses",
      roleLabel: "Coach specialty",
      roles: ["Employability coach", "Executive coach", "Interview coach", "Strategic resume coach", "LinkedIn coach"],
      extraFields: ["Availability", "Modality", "Minimum expected NPS"],
    },
  },
} as const;

const copy = {
  es: {
    eyebrow: "Super Admin",
    filterTitle: "Filtros de busqueda",
    search: "Buscar",
    searchPlaceholder: "Nombre, correo, organizacion, rol o responsable...",
    status: "Estado",
    all: "Todos",
    formTitle: "Captura y mantenimiento",
    create: "Crear",
    edit: "Editar seleccionado",
    deleteLogical: "Borrado logico",
    selected: "Seleccionado",
    noSelected: "Selecciona un usuario existente para editar o borrar logicamente.",
    name: "Nombre completo",
    email: "Correo",
    phone: "Telefono",
    organization: "Organizacion",
    role: "Rol",
    statusLabel: "Estado",
    credits: "Creditos / bolsa inicial",
    owner: "Responsable interno",
    notes: "Notas internas",
    extra: "Datos especificos",
    results: "Usuarios encontrados",
    resultHelp: "Selecciona un registro para editarlo o marcarlo con borrado logico. La tabla mantiene scroll horizontal y vertical.",
    columns: ["Seleccion", "Usuario", "Tipo", "Organizacion", "Rol", "Telefono", "Creditos", "Estado", "Responsable", "Ultimo cambio", "Notas"],
    statuses: ["activo", "invitado", "pendiente", "bloqueado", "borrado_logico"],
  },
  en: {
    eyebrow: "Super Admin",
    filterTitle: "Search filters",
    search: "Search",
    searchPlaceholder: "Name, email, organization, role, or owner...",
    status: "Status",
    all: "All",
    formTitle: "Capture and maintenance",
    create: "Create",
    edit: "Edit selected",
    deleteLogical: "Logical delete",
    selected: "Selected",
    noSelected: "Select an existing user to edit or logically delete.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    organization: "Organization",
    role: "Role",
    statusLabel: "Status",
    credits: "Credits / initial pool",
    owner: "Internal owner",
    notes: "Internal notes",
    extra: "Specific data",
    results: "Found users",
    resultHelp: "Select a record to edit it or mark it with logical deletion. The table keeps horizontal and vertical scrolling.",
    columns: ["Select", "User", "Type", "Organization", "Role", "Phone", "Credits", "Status", "Owner", "Last change", "Notes"],
    statuses: ["active", "invited", "pending", "blocked", "logical_delete"],
  },
} as const;

const demoUsers: DemoUser[] = [
  { kind: "online", name: "Laura Mendez", email: "laura@email.com", organization: "Empleate YA", role: "Usuario final con creditos", phone: "+52 55 1000 0001", status: "activo", credits: 220, owner: "Leo Galvez", lastChange: "12/06/2026 10:40", notes: "Compra individual Stripe. Puede ejecutar avatares segun saldo." },
  { kind: "online", name: "Jorge Luna", email: "jorge@email.com", organization: "Campana ScoreX Online", role: "Usuario final prueba", phone: "+52 55 1000 0006", status: "pendiente", credits: 35, owner: "Sistema", lastChange: "12/06/2026 08:20", notes: "Prueba limitada. Requiere registro para consumir mas avatares." },
  { kind: "super-admin-support", name: "Daniela Ponce", email: "daniela@empleateya.mx", organization: "Cobranza", role: "Apoyo cobranza", phone: "+52 55 1000 0002", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "12/06/2026 10:10", notes: "Acceso a pagos, estados de cuenta y comentarios internos." },
  { kind: "super-admin-support", name: "Ricardo Vega", email: "ricardo@empleateya.mx", organization: "Operaciones", role: "Operativo outplacement", phone: "+52 55 1000 0007", status: "invitado", credits: 0, owner: "Leo Galvez", lastChange: "12/06/2026 07:52", notes: "Apoya altas masivas y seguimiento operativo de campanas." },
  { kind: "coach-partner", name: "Mariana Soto", email: "mariana@franquicia-demo.mx", organization: "Franquicia Demo Norte", role: "Responsable franquicia", phone: "+52 55 1000 0003", status: "activo", credits: 600, owner: "Leo Galvez", lastChange: "11/06/2026 17:20", notes: "Licencia minima 6 meses. Administra clientes propios." },
  { kind: "coach-partner", name: "Hector Ramos", email: "hector@partner-demo.mx", organization: "Franquicia Demo Bajio", role: "Coach partner colaborador", phone: "+52 55 1000 0008", status: "pendiente", credits: 300, owner: "Mariana Soto", lastChange: "11/06/2026 12:35", notes: "Pendiente completar curso online de metodologia." },
  { kind: "outplacement-rh", name: "Ana Torres", email: "ana@empresa-demo.mx", organization: "Empresa Demo Outplacement", role: "Administrador RH", phone: "+52 55 1000 0004", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "12/06/2026 09:15", notes: "Puede crear campanas y revisar avance de ex-colaboradores autorizados." },
  { kind: "outplacement-rh", name: "Carlos Ibarra", email: "carlos@empresa-demo.mx", organization: "Empresa Demo Outplacement", role: "Apoyo seguimiento outplacement", phone: "+52 55 1000 0009", status: "activo", credits: 0, owner: "Ana Torres", lastChange: "10/06/2026 18:02", notes: "Puede revisar avance pero no aprobar participantes." },
  { kind: "internal-coach", name: "Sofia Rivera", email: "sofia@empleateya.mx", organization: "Coaching 1o1", role: "Coach ejecutivo", phone: "+52 55 1000 0005", status: "invitado", credits: 0, owner: "Leo Galvez", lastChange: "10/06/2026 13:02", notes: "Asignable a sesiones 1o1, NPS, notas y testimonios." },
  { kind: "internal-coach", name: "Patricia Mora", email: "patricia@empleateya.mx", organization: "Cursos online", role: "Coach entrevistas", phone: "+52 55 1000 0010", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "09/06/2026 15:45", notes: "Disponible para cursos grupales y sesiones remotas." },
];

export function AdminUsersClient({ userKind = "online" }: { userKind?: AdminUserKind }) {
  const { language } = useLanguage();
  const t = copy[language];
  const kind = kindConfig[language][userKind];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState("");

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return demoUsers.filter((user) => {
      const matchesKind = user.kind === userKind;
      const matchesStatus = status === "all" || user.status === status;
      const matchesText = !normalized || Object.values(user).some((value) => String(value).toLowerCase().includes(normalized));
      return matchesKind && matchesStatus && matchesText;
    });
  }, [query, status, userKind]);

  const selectedUser = filteredUsers.find((user) => user.email === selectedEmail);

  return (
    <div className="space-y-7">
      <header>
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]"><ShieldCheck size={15} /> {t.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{kind.title}</h1>
        <p className="mt-4 max-w-5xl text-lg leading-8 text-slate-600">{kind.description}</p>
      </header>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-black text-slate-950">{t.filterTitle}</h2>
        <div className="grid gap-3 lg:grid-cols-[1.5fr_260px]">
          <div>
            <Label>{t.search}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder={t.searchPlaceholder} />
            </div>
          </div>
          <Field label={t.status}><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t.all}</option>{t.statuses.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{t.formTitle}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedUser ? `${t.selected}: ${selectedUser.name}` : t.noSelected}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]"><UserPlus size={17} />{t.create}</Button>
            <Button disabled={!selectedUser} className="gap-2 bg-slate-950 text-white hover:bg-slate-800"><Edit3 size={17} />{t.edit}</Button>
            <Button disabled={!selectedUser} className="gap-2 bg-red-600 text-white hover:bg-red-700"><Trash2 size={17} />{t.deleteLogical}</Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <FormGroup title={t.name} icon={<UsersRound size={18} />}>
            <Field label={t.name}><Input placeholder="Ej. Laura Mendez" defaultValue={selectedUser?.name ?? ""} /></Field>
            <Field label={t.email}><Input placeholder="correo@ejemplo.com" defaultValue={selectedUser?.email ?? ""} type="email" /></Field>
            <Field label={t.phone}><Input placeholder="+52 55 0000 0000" defaultValue={selectedUser?.phone ?? ""} /></Field>
          </FormGroup>
          <FormGroup title={kind.organizationLabel} icon={<Building2 size={18} />}>
            <Field label={t.organization}><Input placeholder={kind.organizationPlaceholder} defaultValue={selectedUser?.organization ?? ""} /></Field>
            <Field label={kind.roleLabel}><Select defaultValue={selectedUser?.role}>{kind.roles.map((item) => <option key={item}>{item}</option>)}</Select></Field>
            <Field label={t.owner}><Input placeholder="Leo Galvez" defaultValue={selectedUser?.owner ?? ""} /></Field>
          </FormGroup>
          <FormGroup title={t.extra} icon={<ShieldCheck size={18} />}>
            <Field label={t.statusLabel}><Select defaultValue={selectedUser?.status}>{t.statuses.map((item) => <option key={item}>{item}</option>)}</Select></Field>
            <Field label={t.credits}><Input placeholder="0" type="number" defaultValue={selectedUser?.credits ?? 0} /></Field>
            {kind.extraFields.map((field) => <Field key={field} label={field}><Input placeholder={field} /></Field>)}
          </FormGroup>
        </div>
        <div className="mt-5">
          <Label>{t.notes}</Label>
          <textarea className="min-h-28 w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]" defaultValue={selectedUser?.notes ?? ""} />
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
                <tr key={user.email} className={`border-b border-slate-100 last:border-0 ${selectedEmail === user.email ? "bg-[var(--brand-primary-soft)]" : ""}`}>
                  <Td><input type="radio" name="selected-user" checked={selectedEmail === user.email} onChange={() => setSelectedEmail(user.email)} /></Td>
                  <Td><strong className="block text-slate-950">{user.name}</strong><span className="text-xs text-slate-500">{user.email}</span></Td>
                  <Td><Pill>{kind.profile}</Pill></Td>
                  <Td>{user.organization}</Td>
                  <Td>{user.role}</Td>
                  <Td>{user.phone}</Td>
                  <Td>{user.credits}</Td>
                  <Td><Pill>{user.status}</Pill></Td>
                  <Td>{user.owner}</Td>
                  <Td>{user.lastChange}</Td>
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
