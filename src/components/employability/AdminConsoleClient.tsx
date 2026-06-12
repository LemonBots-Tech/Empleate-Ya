"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, FolderKanban, Search, ShieldCheck, UsersRound } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminControlNav } from "./AdminControlNav";

const copy = {
  es: {
    eyebrow: "Super admin",
    title: "Centro de control Empléate YA",
    description: "Vista operativa para identificar usuarios, organizaciones, campañas activas, responsables y solicitudes pendientes de aprobación.",
    search: "Buscar",
    searchPlaceholder: "Nombre, correo, campaña, organización o responsable...",
    ownerType: "Origen",
    status: "Estado",
    stage: "Etapa",
    all: "Todos",
    users: "Usuarios",
    organizations: "Organizaciones",
    campaigns: "Campañas",
    activeCampaignOwner: "Dueño de campaña activa",
    tableUsers: "Usuarios localizables",
    tableOrganizations: "Organizaciones y responsables",
    tableCampaigns: "Campañas para seguimiento/aprobación",
    role: "Rol",
    userOrigin: "Pertenece a",
    avatarAccess: "Acceso avatares",
    creditPurchase: "Compra créditos",
    organization: "Organización",
    orgType: "Tipo",
    owner: "Responsable",
    requester: "Solicitante",
    approver: "Aprueba",
    participants: "Participantes",
    license: "Licencia",
    credits: "Créditos",
    noResults: "No hay resultados con esos filtros.",
  },
  en: {
    eyebrow: "Super admin",
    title: "Empléate YA control center",
    description: "Operating view to identify users, organizations, active campaigns, owners, and approval requests.",
    search: "Search",
    searchPlaceholder: "Name, email, campaign, organization, or owner...",
    ownerType: "Origin",
    status: "Status",
    stage: "Stage",
    all: "All",
    users: "Users",
    organizations: "Organizations",
    campaigns: "Campaigns",
    activeCampaignOwner: "Active campaign owner",
    tableUsers: "Searchable users",
    tableOrganizations: "Organizations and owners",
    tableCampaigns: "Campaigns for follow-up/approval",
    role: "Role",
    userOrigin: "Belongs to",
    avatarAccess: "Avatar access",
    creditPurchase: "Credit purchase",
    organization: "Organization",
    orgType: "Type",
    owner: "Owner",
    requester: "Requester",
    approver: "Approver",
    participants: "Participants",
    license: "License",
    credits: "Credits",
    noResults: "No results match those filters.",
  },
} as const;

const users = [
  { name: "Leo Galvez", email: "leo.galvez.medina@gmail.com", role: "super_admin", status: "active", origin: "empleate_ya", organization: "Empléate YA", companyRole: "Fundador / Super admin", stage: "Discovery", credits: 1000, avatarAccess: "uso completo", creditPurchase: "compra registrada" },
  { name: "Ana Torres", email: "ana@empresa-demo.mx", role: "company_admin", status: "active", origin: "company", organization: "Empresa Demo Outplacement", companyRole: "Responsable RH", stage: "Cv estratégico", credits: 0, avatarAccess: "licencia empresa", creditPurchase: "incluido en licencia" },
  { name: "Carlos Ruiz", email: "carlos@empresa-demo.mx", role: "company_participant", status: "invited", origin: "company", organization: "Empresa Demo Outplacement", companyRole: "Ex-colaborador autorizado", stage: "ScoreX", credits: 0, avatarAccess: "licencia empresa", creditPurchase: "campaña autorizada" },
  { name: "Mariana Soto", email: "mariana@franquicia-demo.mx", role: "entrepreneur_owner", status: "active", origin: "entrepreneur", organization: "Franquicia Demo Norte", companyRole: "Responsable franquicia", stage: "LinkedIn", credits: 480, avatarAccess: "uso completo", creditPurchase: "compra registrada" },
  { name: "Jorge Luna", email: "jorge@cliente-franquicia.mx", role: "entrepreneur_client", status: "active", origin: "entrepreneur_client", organization: "Franquicia Demo Norte", companyRole: "Cliente del emprendedor", stage: "Optim", credits: 120, avatarAccess: "1 prueba por avatar", creditPurchase: "sin compra" },
] as const;

const organizations = [
  { name: "Empléate YA", type: "empleate_ya", owner: "Leo Galvez", ownerEmail: "leo.galvez.medina@gmail.com", status: "active", license: "Plataforma propia", users: 3 },
  { name: "Empresa Demo Outplacement", type: "company", owner: "Ana Torres", ownerEmail: "ana@empresa-demo.mx", status: "active", license: "Outplacement anual + campañas", users: 24 },
  { name: "Franquicia Demo Norte", type: "entrepreneur", owner: "Mariana Soto", ownerEmail: "mariana@franquicia-demo.mx", status: "active", license: "Franquicia 6 meses mínimo", users: 12 },
] as const;

const campaigns = [
  { name: "Outplacement Junio 2026", organization: "Empresa Demo Outplacement", orgType: "company", requester: "Ana Torres", approver: "Leo Galvez", participants: 24, status: "pending_approval", stage: "Discovery", activeOwner: "Empresa Demo Outplacement" },
  { name: "Programa CV Estratégico", organization: "Franquicia Demo Norte", orgType: "entrepreneur", requester: "Mariana Soto", approver: "Leo Galvez", participants: 12, status: "pending_approval", stage: "Cv estratégico", activeOwner: "Franquicia Demo Norte" },
  { name: "ScoreX Online Mayo", organization: "Empléate YA", orgType: "empleate_ya", requester: "Leo Galvez", approver: "Leo Galvez", participants: 38, status: "active", stage: "ScoreX", activeOwner: "Empléate YA" },
] as const;

type AdminSection = "overview" | "users" | "organizations" | "campaigns";

export function AdminConsoleClient() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const t = copy[language];
  const [query, setQuery] = useState("");
  const [ownerType, setOwnerType] = useState("all");
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");

  const section: AdminSection = pathname.includes("/campaigns")
    ? "campaigns"
    : pathname.includes("/organizations")
      ? "organizations"
      : pathname.includes("/users")
        ? "users"
        : "overview";

  const normalizedQuery = query.trim().toLowerCase();
  const matchesText = (values: Array<string | number>) => !normalizedQuery || values.some((value) => String(value).toLowerCase().includes(normalizedQuery));

  const filteredUsers = users.filter((user) => {
    return matchesText([user.name, user.email, user.role, user.organization, user.companyRole, user.stage, user.avatarAccess, user.creditPurchase])
      && (ownerType === "all" || user.origin === ownerType)
      && (status === "all" || user.status === status)
      && (stage === "all" || user.stage === stage);
  });

  const filteredOrganizations = organizations.filter((organization) => {
    return matchesText([organization.name, organization.type, organization.owner, organization.ownerEmail, organization.license])
      && (ownerType === "all" || organization.type === ownerType)
      && (status === "all" || organization.status === status);
  });

  const filteredCampaigns = campaigns.filter((campaign) => {
    return matchesText([campaign.name, campaign.organization, campaign.orgType, campaign.requester, campaign.approver, campaign.stage, campaign.activeOwner])
      && (ownerType === "all" || campaign.orgType === ownerType)
      && (status === "all" || campaign.status === status)
      && (stage === "all" || campaign.stage === stage);
  });

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]"><ShieldCheck size={15} /> {t.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">{t.description}</p>
        </div>
      </header>

      <AdminControlNav />

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Label>{t.search}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder={t.searchPlaceholder} />
            </div>
          </div>
          <FilterSelect label={t.ownerType} value={ownerType} onChange={setOwnerType} options={["all", "empleate_ya", "company", "entrepreneur", "entrepreneur_client"]} allLabel={t.all} />
          <FilterSelect label={t.status} value={status} onChange={setStatus} options={["all", "active", "invited", "pending_approval"]} allLabel={t.all} />
          <FilterSelect label={t.stage} value={stage} onChange={setStage} options={["all", "Discovery", "Cv estratégico", "ScoreX", "Optim", "LinkedIn"]} allLabel={t.all} />
        </div>
      </section>

      {(section === "overview" || section === "campaigns") && (
        <TableCard title={t.tableCampaigns} icon={<ClipboardList size={20} />} empty={filteredCampaigns.length === 0 ? t.noResults : undefined}>
          <thead><tr><Th>{t.campaigns}</Th><Th>{t.activeCampaignOwner}</Th><Th>{t.orgType}</Th><Th>{t.requester}</Th><Th>{t.approver}</Th><Th>{t.participants}</Th><Th>{t.status}</Th></tr></thead>
          <tbody>{filteredCampaigns.map((campaign) => <tr key={campaign.name} className="border-b border-slate-100 last:border-0"><Td><strong className="block text-slate-950">{campaign.name}</strong><span className="text-xs text-slate-500">{campaign.stage}</span></Td><Td>{campaign.activeOwner}</Td><Td><Pill>{campaign.orgType}</Pill></Td><Td>{campaign.requester}</Td><Td>{campaign.approver}</Td><Td>{campaign.participants}</Td><Td><Pill>{campaign.status}</Pill></Td></tr>)}</tbody>
        </TableCard>
      )}

      {(section === "overview" || section === "users") && (
        <TableCard title={t.tableUsers} icon={<UsersRound size={20} />} empty={filteredUsers.length === 0 ? t.noResults : undefined}>
          <thead><tr><Th>{t.users}</Th><Th>{t.userOrigin}</Th><Th>{t.organization}</Th><Th>{t.role}</Th><Th>{t.avatarAccess}</Th><Th>{t.creditPurchase}</Th><Th>{t.credits}</Th><Th>{t.status}</Th></tr></thead>
          <tbody>{filteredUsers.map((user) => <tr key={user.email} className="border-b border-slate-100 last:border-0"><Td><strong className="block text-slate-950">{user.name}</strong><span className="text-xs text-slate-500">{user.email}</span></Td><Td><Pill>{user.origin}</Pill></Td><Td><strong className="block text-slate-700">{user.organization}</strong><span className="text-xs text-slate-500">{user.companyRole}</span></Td><Td>{user.role}</Td><Td><Pill>{user.avatarAccess}</Pill></Td><Td>{user.creditPurchase}</Td><Td>{user.credits}</Td><Td><Pill>{user.status}</Pill></Td></tr>)}</tbody>
        </TableCard>
      )}

      {(section === "overview" || section === "organizations") && (
        <TableCard title={t.tableOrganizations} icon={<Building2 size={20} />} empty={filteredOrganizations.length === 0 ? t.noResults : undefined}>
          <thead><tr><Th>{t.organizations}</Th><Th>{t.orgType}</Th><Th>{t.owner}</Th><Th>{t.license}</Th><Th>{t.users}</Th><Th>{t.status}</Th></tr></thead>
          <tbody>{filteredOrganizations.map((organization) => <tr key={organization.name} className="border-b border-slate-100 last:border-0"><Td><strong className="text-slate-950">{organization.name}</strong></Td><Td><Pill>{organization.type}</Pill></Td><Td><strong className="block text-slate-700">{organization.owner}</strong><span className="text-xs text-slate-500">{organization.ownerEmail}</span></Td><Td>{organization.license}</Td><Td>{organization.users}</Td><Td><Pill>{organization.status}</Pill></Td></tr>)}</tbody>
        </TableCard>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }: { label: string; value: string; onChange: (value: string) => void; options: string[]; allLabel: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option === "all" ? allLabel : option}</option>)}
      </Select>
    </div>
  );
}

function TableCard({ title, icon, children, empty }: { title: string; icon: React.ReactNode; children: React.ReactNode; empty?: string }) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-xl font-black text-slate-950">{icon}{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">{children}</table>
      </div>
      {empty ? <p className="px-5 py-6 text-sm font-semibold text-slate-500">{empty}</p> : null}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-slate-600">{children}</td>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--brand-primary)]">{children}</span>;
}
