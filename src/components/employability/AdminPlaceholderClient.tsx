"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type AdminModuleKey = "avatars" | "permissions" | "payments" | "reports" | "coaching" | "groups" | "testimonials" | "audit";

const copy = {
  es: {
    search: "Buscar",
    status: "Estado",
    all: "Todos",
    pending: "Pendiente",
    active: "Activo",
    blocked: "Bloqueado",
    ready: "Listo",
    owner: "Responsable",
    date: "Fecha",
    type: "Tipo",
    detail: "Detalle",
    action: "Accion",
    empty: "No hay datos con esos filtros.",
    modules: {
      avatars: {
        title: "Catalogo de avatares",
        description: "Administra agentes, etapa metodologica, costo en creditos, tipo de avatar, modelos IA, disponibilidad y estado.",
        columns: ["Avatar", "Etapa", "Tipo", "Creditos", "Disponibilidad", "Estado"],
      },
      permissions: {
        title: "Permisos y matriz de acceso",
        description: "Controla que usuarios, empresas, emprendedores, coaches y apoyos administrativos pueden ver, editar o ejecutar.",
        columns: ["Perfil", "Modulo", "Permiso", "Alcance", "Estado"],
      },
      payments: {
        title: "Pagos, licencias y cobranza",
        description: "Seguimiento de Stripe, comprobantes manuales, licencias mensuales, anuales, periodos de gracia y renovaciones.",
        columns: ["Cliente", "Plan", "Monto", "Vence", "Estado"],
      },
      reports: {
        title: "Reportes ejecutivos",
        description: "Reportes de consumo, usuarios activos, rentabilidad, campanas, partners, NPS, coaching y auditoria.",
        columns: ["Reporte", "Periodo", "Responsable", "Ultima ejecucion", "Estado"],
      },
      coaching: {
        title: "Trainee & Coaching",
        description: "Define plantillas de cursos, coaching o programas de outplacement que pertenecen a una empresa interna o externa. Cada plantilla incluye avatares y creditos por usuario; al asignarla a un grupo o campana se calcula el costo previsto antes de autorizar participantes.",
        columns: ["Plantilla / programa", "Empresa", "Uso", "Avatares", "Creditos por usuario", "Estado"],
      },
      groups: {
        title: "Grupos",
        description: "Crea grupos o campanas desde una plantilla Trainee & Coaching. En el previo se indica el numero esperado de alumnos o ex-empleados, se calcula la bolsa total y los creditos disponibles por participante; una vez autorizado, el responsable asigna participantes reales.",
        columns: ["Grupo / campana", "Organizacion", "Plantilla", "Previo participantes", "Bolsa creditos", "Creditos por persona", "Estado"],
      },
      testimonials: {
        title: "Testimonios y autorizaciones",
        description: "Controla testimonios, imagenes, PDF firmado, folio, ubicacion, vigencia, hash y publicacion en Home/FAQ.",
        columns: ["Testimonio", "Folio", "Vigencia", "Autorizacion", "Estado"],
      },
      audit: {
        title: "Bitacora y seguridad",
        description: "Registro inmutable de altas, bajas, cambios, pagos, creditos, ejecuciones de avatares y acciones administrativas.",
        columns: ["Fecha", "Usuario", "Accion", "Entidad", "Detalle"],
      },
    },
  },
  en: {
    search: "Search",
    status: "Status",
    all: "All",
    pending: "Pending",
    active: "Active",
    blocked: "Blocked",
    ready: "Ready",
    owner: "Owner",
    date: "Date",
    type: "Type",
    detail: "Detail",
    action: "Action",
    empty: "No data matches those filters.",
    modules: {
      avatars: {
        title: "Avatar catalog",
        description: "Manage agents, methodology stage, credit cost, avatar type, AI models, availability, and status.",
        columns: ["Avatar", "Stage", "Type", "Credits", "Availability", "Status"],
      },
      permissions: {
        title: "Permissions and access matrix",
        description: "Control what users, companies, entrepreneurs, coaches, and support admins can view, edit, or execute.",
        columns: ["Profile", "Module", "Permission", "Scope", "Status"],
      },
      payments: {
        title: "Payments, licenses, and collections",
        description: "Track Stripe, manual receipts, monthly and annual licenses, grace periods, and renewals.",
        columns: ["Client", "Plan", "Amount", "Due", "Status"],
      },
      reports: {
        title: "Executive reports",
        description: "Consumption, active users, profitability, campaigns, partners, NPS, coaching, and audit reports.",
        columns: ["Report", "Period", "Owner", "Last run", "Status"],
      },
      coaching: {
        title: "Trainee & Coaching",
        description: "Define course, coaching, or outplacement templates owned by an internal or external company. Each template includes avatars and credits per user; when assigned to a group or campaign, the expected cost is calculated before participants are authorized.",
        columns: ["Template / program", "Company", "Use", "Avatars", "Credits per user", "Status"],
      },
      groups: {
        title: "Groups",
        description: "Create groups or campaigns from a Trainee & Coaching template. The preview captures the expected number of students or former employees, calculates the total pool and credits per participant; once authorized, the owner assigns real participants.",
        columns: ["Group / campaign", "Organization", "Template", "Preview participants", "Credit pool", "Credits per person", "Status"],
      },
      testimonials: {
        title: "Testimonials and authorizations",
        description: "Control testimonials, images, signed PDF, folio, location, validity, hash, and Home/FAQ publication.",
        columns: ["Testimonial", "Folio", "Validity", "Authorization", "Status"],
      },
      audit: {
        title: "Audit log and security",
        description: "Immutable record of creates, deletes, changes, payments, credits, avatar runs, and admin actions.",
        columns: ["Date", "User", "Action", "Entity", "Detail"],
      },
    },
  },
} as const;

const rows: Record<AdminModuleKey, string[][]> = {
  avatars: [
    ["ScoreX", "CV estrategico", "Basico", "35", "Online / Empresa / Partner", "active"],
    ["Optim", "CV estrategico", "Estrella", "180", "Compra de creditos", "active"],
    ["Miss Quest", "Entrevistas", "Estrella", "120", "Compra de creditos", "active"],
  ],
  permissions: [
    ["Super Admin", "Todos", "Total", "Global", "active"],
    ["Apoyo cobranza", "Pagos", "Ver / comentar", "Empleate YA", "pending"],
    ["Empresa RH", "Campanas", "Ver progreso autorizado", "Su organizacion", "active"],
  ],
  payments: [
    ["Franquicia Demo Norte", "Licencia franquicia 6 meses", "$18,000 MXN", "30/06/2026", "pending"],
    ["Empresa Demo Outplacement", "Licencia anual + campanas", "$95,000 MXN", "15/07/2026", "active"],
    ["Usuario Online", "Paquete 500 creditos", "$500 MXN", "Pagado", "active"],
  ],
  reports: [
    ["Consumo de creditos", "Mes actual", "Super Admin", "Hoy", "ready"],
    ["Rentabilidad por avatar", "Semanal", "Super Admin", "Ayer", "ready"],
    ["Campanas outplacement", "Mensual", "Operaciones", "Pendiente", "pending"],
  ],
  coaching: [
    ["CV estrategico base", "Franquicia Demo Norte", "Grupo Coach Partner", "ScoreX, Optim, Mr. Wow", "255", "active"],
    ["Outplacement completo", "Empresa Demo Outplacement", "Campana empresa", "Todos los basicos + Optim", "1,545", "active"],
    ["Coaching 1o1 ejecutivo", "Empleate YA", "Grupo interno", "ScoreX, Optim, Mr. Linked, Miss Quest", "515", "pending"],
  ],
  groups: [
    ["Grupo CV Estrategico Norte", "Franquicia Demo Norte", "CV estrategico base", "20 alumnos", "5,100", "255", "active"],
    ["Coaching 1o1 Ejecutivo", "Empleate YA", "Coaching 1o1 ejecutivo", "4 alumnos", "Ilimitada", "515", "active"],
    ["Outplacement Junio 2026", "Empresa Demo Outplacement", "Outplacement completo", "18 ex-empleados", "27,810", "1,545", "pending"],
  ],
  testimonials: [
    ["Candidata area salud", "TES-2026-001", "31/12/2026", "PDF validado", "active"],
    ["Lider comercial", "TES-2026-002", "31/12/2026", "Pendiente hash", "pending"],
    ["Profesional senior", "TES-2026-003", "31/12/2026", "PDF validado", "active"],
  ],
  audit: [
    ["12/06/2026 10:18", "Leo Galvez", "credits.grant", "credit_wallet", "Credito extraordinario autorizado"],
    ["12/06/2026 10:02", "Demo", "avatar.run", "scorex", "Consumo registrado"],
    ["12/06/2026 09:41", "Sistema", "payment.webhook", "stripe", "Pago confirmado"],
  ],
};

export function AdminPlaceholderClient({ moduleKey }: { moduleKey: AdminModuleKey }) {
  const { language } = useLanguage();
  const t = copy[language];
  const moduleCopy = t.modules[moduleKey];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filteredRows = useMemo(() => rows[moduleKey].filter((row) => {
    const matchesQuery = !query.trim() || row.join(" ").toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "all" || row[row.length - 1] === status;
    return matchesQuery && matchesStatus;
  }), [moduleKey, query, status]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">Super admin</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{moduleCopy.title}</h1>
        <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-600">{moduleCopy.description}</p>
      </header>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div>
            <Label>{t.search}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" />
            </div>
          </div>
          <div>
            <Label>{t.status}</Label>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">{t.all}</option>
              <option value="active">{t.active}</option>
              <option value="pending">{t.pending}</option>
              <option value="ready">{t.ready}</option>
              <option value="blocked">{t.blocked}</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr>{moduleCopy.columns.map((column) => <Th key={column}>{column}</Th>)}</tr>
            </thead>
            <tbody>
              {filteredRows.length ? filteredRows.map((row) => (
                <tr key={row.join("-")} className="border-b border-slate-100 last:border-0">
                  {row.map((cell, index) => <Td key={`${cell}-${index}`} strong={index === 0}>{cell}</Td>)}
                </tr>
              )) : (
                <tr><Td>{t.empty}</Td>{moduleCopy.columns.slice(1).map((column) => <Td key={column}>-</Td>)}</tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">{children}</th>;
}

function Td({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return <td className="px-4 py-3 align-top text-slate-600">{strong ? <strong className="text-slate-950">{children}</strong> : children}</td>;
}
