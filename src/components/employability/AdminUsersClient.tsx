"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Building2, Edit3, KeyRound, Search, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { skillRegistry, type SkillId } from "@/ai/skillRegistry";
import { adminSections } from "./AdminSuperShell";
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
      roles: ["Prospecto online", "Cliente Online Pagado"],
      extraFields: ["Stripe customer ID"],
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
      roles: ["Online prospect", "Paid online client"],
      extraFields: ["Stripe customer ID"],
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
    ownerHelp: "Solo el Super Admin puede modificar esta asignacion. Los nuevos usuarios se reparten aleatoriamente entre Super Admin y usuarios de apoyo.",
    orgHelp: "Para empresas de outplacement y coach partners, la organizacion viene del catalogo administrado por Super Admin o apoyos de Super Admin.",
    privacyAccepted: "Acepto privacidad",
    privacyReadonly: "Solo Super Admin puede modificar este registro.",
    permissions: "Permisos",
    permissionsTitle: "Permisos y limites de acceso",
    permissionsHelp: "Configura avatares, opciones del menu lateral y submenus disponibles para este perfil. El consumo real se descuenta contra la bolsa de creditos correspondiente.",
    avatars: "Avatares",
    adminMenu: "Menu lateral Super Admin",
    submenu: "Submenus de usuarios",
    onlineRule: "Regla online",
    onlineProspectRule: "Prospecto online: solo avatares basicos una vez por avatar. Cliente Online Pagado: acceso a todos los avatares, sujeto a saldo suficiente.",
    partnerPlan: "Plan Coach Partner",
    partnerCreditPool: "Bolsa maxima mensual de franquicia",
    partnerRule: "El responsable de franquicia concentra la bolsa. Apoyos del partner y alumnos descuentan de esa bolsa principal.",
    groups: "Grupos",
    students: "Alumnos por grupo",
    cycles: "Ciclos de uso",
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
    ownerHelp: "Only the Super Admin can modify this assignment. New users are distributed randomly among Super Admin and support users.",
    orgHelp: "For outplacement companies and coach partners, the organization comes from the organization catalog managed by Super Admin or Super Admin support users.",
    privacyAccepted: "Privacy accepted",
    privacyReadonly: "Only Super Admin can modify this record.",
    permissions: "Permissions",
    permissionsTitle: "Access permissions and limits",
    permissionsHelp: "Configure avatars, left-side menu options, and user submenus available for this profile. Actual usage is deducted from the corresponding credit pool.",
    avatars: "Avatars",
    adminMenu: "Super Admin side menu",
    submenu: "User submenus",
    onlineRule: "Online rule",
    onlineProspectRule: "Online prospect: basic avatars only, once per avatar. Paid online client: all avatars, subject to enough credit balance.",
    partnerPlan: "Coach Partner plan",
    partnerCreditPool: "Monthly franchise credit pool",
    partnerRule: "The franchise owner holds the main pool. Partner support users and students deduct from that main pool.",
    groups: "Groups",
    students: "Students per group",
    cycles: "Usage cycles",
    notes: "Internal notes",
    extra: "Specific data",
    results: "Found users",
    resultHelp: "Select a record to edit it or mark it with logical deletion. The table keeps horizontal and vertical scrolling.",
    columns: ["Select", "User", "Type", "Organization", "Role", "Phone", "Credits", "Status", "Owner", "Last change", "Notes"],
    statuses: ["active", "invited", "pending", "blocked", "logical_delete"],
  },
} as const;

const adminMenuLabels = {
  es: {
    overview: "Resumen",
    users: "Usuarios",
    organizations: "Organizaciones",
    campaigns: "Campanas",
    avatars: "Avatares",
    catalogs: "Catalogos",
    permissions: "Permisos",
    credits: "Creditos",
    payments: "Pagos",
    reports: "Reportes",
    coaching: "Coaching",
    testimonials: "Testimonios",
    audit: "Bitacora",
  },
  en: {
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
  },
} as const;

const internalOwners = ["Leo Galvez - Super Admin", "Daniela Ponce - Apoyo cobranza", "Ricardo Vega - Operativo outplacement", "Valeria Nunez - Apoyo administrativo", "Monica Reyes - Supervisor delegado temporal"] as const;
const empleateYaOrganization = "Empleate YA";
const onlineBaselineCredits = 445;
const canCurrentUserEditPrivacyAcceptance = true;
const onlineBasicAvatarIds: SkillId[] = ["lumo", "recharge", "scorex", "mr_ikigai", "new_job_challenge", "mr_wow"];
const coachStarterAvatarIds: SkillId[] = ["scorex", "optim", "mr_wow", "tommy_lee_picture"];
const allAvatarIds = Object.keys(skillRegistry) as SkillId[];
const userSubmenuPermissions = [
  "/admin/users/online",
  "/admin/users/super-admin-support",
  "/admin/users/coach-partner",
  "/admin/users/outplacement-rh",
  "/admin/users/internal-coach",
] as const;

const coachPartnerPlans = {
  starter: { label: "Coach Starter", avatarIds: coachStarterAvatarIds, groups: 4, studentsPerGroup: 5, cycles: 3 },
  pro: { label: "Coach Pro", avatarIds: [...coachStarterAvatarIds, "mr_boost_linked", "miss_quest"] as SkillId[], groups: 8, studentsPerGroup: 8, cycles: 3 },
  business: { label: "Coach Business", avatarIds: allAvatarIds, groups: 12, studentsPerGroup: 10, cycles: 3 },
} as const;

const organizationCatalog = {
  "coach-partner": ["Franquicia Demo Norte", "Franquicia Demo Bajio", "Partner Ejecutivo CDMX", "Partner Carrera Global"],
  "outplacement-rh": ["Empresa Demo Outplacement", "Grupo Industrial Norte", "Servicios Financieros Delta", "Retail Nacional"],
} as const;

const demoUsers: DemoUser[] = [
  { kind: "online", name: "Laura Mendez", email: "laura@email.com", organization: empleateYaOrganization, role: "Cliente Online Pagado", phone: "+52 55 1000 0001", status: "activo", credits: onlineBaselineCredits, owner: "Leo Galvez", lastChange: "12/06/2026 10:40", notes: "Compra individual Stripe. Puede ejecutar avatares segun saldo." },
  { kind: "online", name: "Jorge Luna", email: "jorge@email.com", organization: empleateYaOrganization, role: "Prospecto online", phone: "+52 55 1000 0006", status: "pendiente", credits: onlineBaselineCredits, owner: "Sistema", lastChange: "12/06/2026 08:20", notes: "Prueba limitada. Requiere registro para consumir mas avatares." },
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
  const [showPermissions, setShowPermissions] = useState(false);
  const [coachPlanKey, setCoachPlanKey] = useState<keyof typeof coachPartnerPlans>("starter");

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
  const fixedEmpleateYaOrg = usesFixedEmpleateYaOrganization(userKind);

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

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">{t.results}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{t.resultHelp}</p>
        </div>
        <div className="max-h-[156px] overflow-auto">
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
            <Button className="gap-2 border border-[var(--brand-border)] bg-white text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]" onClick={() => setShowPermissions((current) => !current)}><KeyRound size={17} />{t.permissions}</Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <FormGroup title={t.name} icon={<UsersRound size={18} />}>
            <Field label={t.name}><Input placeholder="Ej. Laura Mendez" defaultValue={selectedUser?.name ?? ""} /></Field>
            <Field label={t.email}><Input placeholder="correo@ejemplo.com" defaultValue={selectedUser?.email ?? ""} type="email" /></Field>
            <Field label={t.phone}><Input placeholder="+52 55 0000 0000" defaultValue={selectedUser?.phone ?? ""} /></Field>
          </FormGroup>
          <FormGroup title={kind.organizationLabel} icon={<Building2 size={18} />}>
            <Field label={t.organization}>{fixedEmpleateYaOrg ? <Input value={empleateYaOrganization} readOnly /> : usesOrganizationCatalog(userKind) ? <Select defaultValue={selectedUser?.organization}>{organizationCatalog[userKind].map((item) => <option key={item}>{item}</option>)}</Select> : <Input placeholder={kind.organizationPlaceholder} defaultValue={selectedUser?.organization ?? ""} />}</Field>
            {usesOrganizationCatalog(userKind) ? <p className="text-xs font-semibold leading-5 text-slate-500">{t.orgHelp}</p> : null}
            <Field label={kind.roleLabel}><Select defaultValue={selectedUser?.role}>{kind.roles.map((item) => <option key={item}>{item}</option>)}</Select></Field>
            <Field label={t.owner}><Select defaultValue={selectedUser?.owner ? ownerOptionFor(selectedUser.owner) : internalOwners[0]}>{internalOwners.map((item) => <option key={item}>{item}</option>)}</Select></Field>
            <p className="text-xs font-semibold leading-5 text-slate-500">{t.ownerHelp}</p>
          </FormGroup>
          <FormGroup title={t.extra} icon={<ShieldCheck size={18} />}>
            <Field label={t.statusLabel}><Select defaultValue={selectedUser?.status}>{t.statuses.map((item) => <option key={item}>{item}</option>)}</Select></Field>
            <Field label={t.credits}><Input placeholder="0" type="number" defaultValue={selectedUser?.credits ?? (userKind === "online" ? onlineBaselineCredits : 0)} readOnly={userKind === "online"} /></Field>
            {kind.extraFields.map((field) => <Field key={field} label={field}><Input placeholder={field} /></Field>)}
            {userKind === "online" ? (
              <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-slate-700">
                <input type="checkbox" className="mt-1" defaultChecked disabled={!canCurrentUserEditPrivacyAcceptance} />
                <span>{t.privacyAccepted} <small className="block font-semibold text-slate-500">{t.privacyReadonly}</small></span>
              </label>
            ) : null}
          </FormGroup>
        </div>
        <div className="mt-5">
          <Label>{t.notes}</Label>
          <textarea className="min-h-28 w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]" defaultValue={selectedUser?.notes ?? ""} />
        </div>
        {showPermissions ? (
          <PermissionsPanel
            userKind={userKind}
            userRole={selectedUser?.role ?? kind.roles[0]}
            language={language}
            coachPlanKey={coachPlanKey}
            onCoachPlanChange={setCoachPlanKey}
          />
        ) : null}
      </section>
    </div>
  );
}

function PermissionsPanel({
  userKind,
  userRole,
  language,
  coachPlanKey,
  onCoachPlanChange,
}: {
  userKind: AdminUserKind;
  userRole: string;
  language: "es" | "en";
  coachPlanKey: keyof typeof coachPartnerPlans;
  onCoachPlanChange: (value: keyof typeof coachPartnerPlans) => void;
}) {
  const t = copy[language];
  const userIsPaidOnline = userRole === "Cliente Online Pagado" || userRole === "Paid online client";
  const allowedAvatarIds = allowedAvatarsFor(userKind, userRole, coachPlanKey);
  const partnerPlan = coachPartnerPlans[coachPlanKey];
  const partnerCreditPool = calculateCoachPartnerPool(partnerPlan.avatarIds, partnerPlan.groups, partnerPlan.studentsPerGroup, partnerPlan.cycles);

  return (
    <section className="mt-6 rounded-[1.5rem] border border-purple-200 bg-purple-50/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-black text-slate-950"><KeyRound size={20} />{t.permissionsTitle}</h3>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-600">{t.permissionsHelp}</p>
        </div>
        {userKind === "coach-partner" ? (
          <div className="w-full rounded-2xl bg-white p-3 shadow-sm lg:w-80">
            <Label>{t.partnerPlan}</Label>
            <Select value={coachPlanKey} onChange={(event) => onCoachPlanChange(event.target.value as keyof typeof coachPartnerPlans)}>
              {Object.entries(coachPartnerPlans).map(([key, plan]) => <option key={key} value={key}>{plan.label}</option>)}
            </Select>
            <div className="mt-3 rounded-xl bg-slate-950 p-3 text-sm font-bold text-white">
              <p>{t.partnerCreditPool}: {partnerCreditPool.toLocaleString(language === "es" ? "es-MX" : "en-US")}</p>
              <p className="mt-1 text-xs text-slate-300">{t.groups}: {partnerPlan.groups} · {t.students}: {partnerPlan.studentsPerGroup} · {t.cycles}: {partnerPlan.cycles}</p>
            </div>
          </div>
        ) : null}
      </div>

      {userKind === "online" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
          {t.onlineRule}: {userIsPaidOnline ? (language === "es" ? "Cliente con acceso completo por saldo." : "Paid client with full access by balance.") : t.onlineProspectRule}
        </div>
      ) : null}
      {userKind === "coach-partner" ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-900">{t.partnerRule}</div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
        <ChecklistCard title={t.avatars}>
          <div className="grid max-h-80 gap-2 overflow-auto pr-1">
            {allAvatarIds.map((avatarId) => {
              const skill = skillRegistry[avatarId];
              const checked = allowedAvatarIds.includes(avatarId);
              return (
                <PermissionCheck
                  key={avatarId}
                  checked={checked}
                  title={skill.name}
                  detail={`${skill.baseCredits} ${language === "es" ? "creditos" : "credits"}`}
                />
              );
            })}
          </div>
        </ChecklistCard>
        <ChecklistCard title={t.adminMenu}>
          <div className="grid max-h-80 gap-2 overflow-auto pr-1">
            {adminSections.map((section) => (
              <PermissionCheck
                key={section.href}
                checked={menuAllowedFor(userKind, section.href)}
                title={adminMenuLabels[language][section.key]}
                detail={section.href}
              />
            ))}
          </div>
        </ChecklistCard>
        <ChecklistCard title={t.submenu}>
          <div className="grid max-h-80 gap-2 overflow-auto pr-1">
            {userSubmenuPermissions.map((href) => (
              <PermissionCheck
                key={href}
                checked={userSubmenuAllowedFor(userKind, href)}
                title={href.split("/").at(-1)?.replaceAll("-", " ") ?? href}
                detail={href}
              />
            ))}
          </div>
        </ChecklistCard>
      </div>
    </section>
  );
}

function allowedAvatarsFor(userKind: AdminUserKind, userRole: string, coachPlanKey: keyof typeof coachPartnerPlans) {
  if (userKind === "online") {
    return userRole === "Cliente Online Pagado" || userRole === "Paid online client" ? allAvatarIds : onlineBasicAvatarIds;
  }
  if (userKind === "coach-partner") return coachPartnerPlans[coachPlanKey].avatarIds;
  return allAvatarIds;
}

function calculateCoachPartnerPool(avatarIds: readonly SkillId[], groups: number, studentsPerGroup: number, cycles: number) {
  const creditsPerStudentCycle = avatarIds.reduce((total, avatarId) => total + skillRegistry[avatarId].baseCredits, 0);
  return creditsPerStudentCycle * groups * studentsPerGroup * cycles;
}

function menuAllowedFor(userKind: AdminUserKind, href: string) {
  if (userKind === "online") return false;
  if (userKind === "coach-partner") return ["/admin/users", "/admin/campaigns", "/admin/credits", "/admin/reports", "/admin/coaching"].includes(href);
  if (userKind === "outplacement-rh") return ["/admin/users", "/admin/organizations", "/admin/campaigns", "/admin/reports"].includes(href);
  if (userKind === "internal-coach") return ["/admin/users", "/admin/coaching", "/admin/testimonials", "/admin/reports"].includes(href);
  return true;
}

function userSubmenuAllowedFor(userKind: AdminUserKind, href: string) {
  if (userKind === "super-admin-support") return true;
  if (userKind === "coach-partner") return href === "/admin/users/coach-partner" || href === "/admin/users/online";
  if (userKind === "outplacement-rh") return href === "/admin/users/outplacement-rh" || href === "/admin/users/online";
  if (userKind === "internal-coach") return href === "/admin/users/internal-coach" || href === "/admin/users/online";
  return href === "/admin/users/online";
}

function usesOrganizationCatalog(userKind: AdminUserKind): userKind is "coach-partner" | "outplacement-rh" {
  return userKind === "coach-partner" || userKind === "outplacement-rh";
}

function usesFixedEmpleateYaOrganization(userKind: AdminUserKind) {
  return userKind === "online" || userKind === "super-admin-support" || userKind === "internal-coach";
}

function ownerOptionFor(owner: string) {
  return internalOwners.find((item) => item.startsWith(owner)) ?? internalOwners[0];
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

function ChecklistCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-lg font-black text-slate-950">{title}</h4>
      {children}
    </section>
  );
}

function PermissionCheck({ checked, title, detail }: { checked: boolean; title: string; detail: string }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
      <input type="checkbox" className="mt-1" defaultChecked={checked} />
      <span className="min-w-0">
        <span className="block font-black text-slate-900">{title}</span>
        <small className="block truncate font-semibold text-slate-500">{detail}</small>
      </span>
    </label>
  );
}
