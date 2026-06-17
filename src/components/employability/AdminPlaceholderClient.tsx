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
        title: "Coaching 1o1 y cursos",
        description: "Administra coaches internos, cursos, alumnos, grupos, sesiones, NPS, notas y testimonios autorizados.",
        columns: ["Curso / Grupo", "Coach", "Alumnos", "NPS", "Estado"],
      },
      groups: {
        title: "Grupos",
        description: "Administra grupos de Coach Partner y coaching 1o1: organizacion, coach responsable, alumnos asignados, capacidad, bolsa de creditos y estado.",
        columns: ["Grupo", "Organizacion", "Coach", "Alumnos", "Capacidad", "Bolsa creditos", "Estado"],
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
        title: "1:1 coaching and courses",
        description: "Manage internal coaches, courses, students, groups, sessions, NPS, notes, and authorized testimonials.",
        columns: ["Course / Group", "Coach", "Students", "NPS", "Status"],
      },
      groups: {
        title: "Groups",
        description: "Manage Coach Partner and 1:1 coaching groups: organization, responsible coach, assigned students, capacity, credit pool, and status.",
        columns: ["Group", "Organization", "Coach", "Students", "Capacity", "Credit pool", "Status"],
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
    ["Curso CV Estrategico", "Coach interno", "18", "72", "active"],
    ["Coaching 1o1 Ejecutivo", "Pendiente asignar", "4", "-", "pending"],
    ["Grupo Entrevistas", "Miss Quest Coach", "11", "86", "active"],
  ],
  groups: [
    ["Grupo CV Estrategico Norte", "Franquicia Demo Norte", "Mariana Soto", "5", "20", "30,900", "active"],
    ["Coaching 1o1 Ejecutivo", "Empleate YA", "Sofia Rivera", "4", "8", "Ilimitada", "active"],
    ["Grupo Entrevistas Bajio", "Franquicia Demo Bajio", "Hector Ramos", "0", "10", "15,450", "pending"],
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
