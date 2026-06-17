"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Building2, Edit3, Save, Search, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type OrganizationType = "coach_partner" | "outplacement_company";

type OrganizationRecord = {
  id: string;
  type: OrganizationType;
  name: string;
  legalName: string;
  taxId: string;
  status: string;
  legalRepresentative: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  plan: string;
  licenseStart: string;
  licenseEnd: string;
  contractTermMonths: number;
  gracePeriodDays: number;
  graceUntil: string;
  licenseVersion: number;
  monthlyGroups: number;
  studentsPerGroup: number;
  outplacementCampaigns: number;
  internalOwner: string;
  notes: string;
  lastChange: string;
};

type OrganizationAuditEvent = {
  id: string;
  organizationName: string;
  action: string;
  detail: string;
  actor: string;
  createdAt: string;
};

const copy = {
  es: {
    eyebrow: "Super Admin",
    title: "Organizaciones",
    description: "Administra organizaciones externas: empresas que contratan outplacement y empresas/franquicias Coach Partner.",
    rule: "Regla base: Empleate YA no se captura aqui. Los usuarios internos, online, apoyos Super Admin y coaches internos tienen Empleate YA por default en su pantalla de usuario. Primero crea la organizacion externa y despues sus administradores, apoyos, alumnos o ex-empleados.",
    filters: "Filtros",
    search: "Buscar",
    searchPlaceholder: "Nombre, RFC, contacto, ciudad, responsable...",
    type: "Tipo",
    status: "Estado",
    all: "Todos",
    found: "Organizaciones encontradas",
    listHelp: "Selecciona una organizacion para editarla o aplicar borrado logico. La lista conserva scroll horizontal y vertical.",
    formTitle: "Captura y mantenimiento de organizacion",
    selected: "Seleccionada",
    noSelected: "Crea una nueva organizacion o selecciona una existente para editar.",
    create: "Crear",
    edit: "Editar seleccionada",
    save: "Guardar organizacion",
    renew: "Renovacion",
    extendGrace: "Extender gracia",
    deleteLogical: "Borrado logico",
    saved: "Organizacion guardada en la tabla correspondiente.",
    renewed: "Renovacion creada como una licencia distinta para esta organizacion.",
    graceExtended: "Periodo de gracia extendido por Super Admin y registrado en bitacora.",
    deleted: "La organizacion paso a estado borrado_logico. No fue eliminada definitivamente.",
    identity: "Identidad",
    commercialName: "Nombre comercial",
    legalName: "Razon social",
    taxId: "RFC / Tax ID",
    contact: "Contacto principal",
    legalRepresentative: "Representante legal / responsable de cuenta",
    legalRepresentativeHelp: "Coach Partner: Coach Partner principal. Outplacement: Administrador RH creado para esa empresa.",
    contactName: "Nombre contacto",
    contactEmail: "Correo contacto",
    contactPhone: "Telefono contacto",
    location: "Ubicacion",
    country: "Pais",
    state: "Estado",
    city: "Ciudad",
    address: "Direccion",
    license: "Licencia, contrato y capacidad",
    plan: "Plan Coach Partner",
    outplacementService: "Servicio outplacement",
    planHelp: "Los planes solo aplican a Coach Partner. En outplacement se registra el servicio contratado, campanas autorizadas y ex-empleados.",
    licenseStart: "Inicio licencia",
    licenseEnd: "Fin licencia",
    contractTerm: "Duracion del contrato",
    gracePeriod: "Dias de gracia",
    graceUntil: "Gracia vigente hasta",
    licenseVersion: "Version licencia",
    groups: "Grupos mensuales",
    students: "Alumnos por grupo",
    campaigns: "Campanas outplacement",
    audit: "Bitacora de licencias",
    auditEmpty: "Aun no hay movimientos de licencia en esta sesion.",
    internalOwner: "Responsable interno",
    notes: "Notas internas",
    columns: ["Seleccion", "Organizacion", "Tipo", "Representante", "Contacto", "Ubicacion", "Plan", "Capacidad", "Responsable", "Estado", "Ultimo cambio"],
    types: {
      coach_partner: "Coach Partner",
      outplacement_company: "Empresa outplacement",
    },
    statuses: ["activo", "pendiente", "bloqueado", "borrado_logico"],
  },
  en: {
    eyebrow: "Super Admin",
    title: "Organizations",
    description: "Manage external organizations: companies hiring outplacement and Coach Partner companies/franchises.",
    rule: "Base rule: Empleate YA is not captured here. Internal users, online users, Super Admin support users, and internal coaches get Empleate YA by default in their user screen. Create the external organization first, then its admins, support users, students, or former employees.",
    filters: "Filters",
    search: "Search",
    searchPlaceholder: "Name, tax ID, contact, city, owner...",
    type: "Type",
    status: "Status",
    all: "All",
    found: "Found organizations",
    listHelp: "Select an organization to edit it or apply logical deletion. The list keeps horizontal and vertical scrolling.",
    formTitle: "Organization capture and maintenance",
    selected: "Selected",
    noSelected: "Create a new organization or select an existing one to edit.",
    create: "Create",
    edit: "Edit selected",
    save: "Save organization",
    renew: "Renewal",
    extendGrace: "Extend grace",
    deleteLogical: "Logical delete",
    saved: "Organization saved in the corresponding table.",
    renewed: "Renewal created as a separate license for this organization.",
    graceExtended: "Grace period extended by Super Admin and recorded in the audit log.",
    deleted: "The organization was moved to logical_delete. It was not permanently deleted.",
    identity: "Identity",
    commercialName: "Commercial name",
    legalName: "Legal name",
    taxId: "Tax ID",
    contact: "Main contact",
    legalRepresentative: "Legal representative / account owner",
    legalRepresentativeHelp: "Coach Partner: main Coach Partner. Outplacement: HR Administrator created for that company.",
    contactName: "Contact name",
    contactEmail: "Contact email",
    contactPhone: "Contact phone",
    location: "Location",
    country: "Country",
    state: "State",
    city: "City",
    address: "Address",
    license: "License, contract, and capacity",
    plan: "Coach Partner plan",
    outplacementService: "Outplacement service",
    planHelp: "Plans apply only to Coach Partner. For outplacement, register the contracted service, authorized campaigns, and former employees.",
    licenseStart: "License start",
    licenseEnd: "License end",
    contractTerm: "Contract duration",
    gracePeriod: "Grace days",
    graceUntil: "Grace valid until",
    licenseVersion: "License version",
    groups: "Monthly groups",
    students: "Students per group",
    campaigns: "Outplacement campaigns",
    audit: "License audit log",
    auditEmpty: "There are no license movements in this session yet.",
    internalOwner: "Internal owner",
    notes: "Internal notes",
    columns: ["Select", "Organization", "Type", "Representative", "Contact", "Location", "Plan", "Capacity", "Owner", "Status", "Last change"],
    types: {
      coach_partner: "Coach Partner",
      outplacement_company: "Outplacement company",
    },
    statuses: ["active", "pending", "blocked", "logical_delete"],
  },
} as const;

const internalOwners = ["Leo Galvez - Super Admin", "Valeria Nunez - Apoyo administrativo", "Ricardo Vega - Operativo outplacement", "Daniela Ponce - Apoyo cobranza"] as const;
const legalRepresentatives = ["Leo Galvez - Super Admin", "Mariana Soto - Coach Partner principal", "Ana Torres - Administrador RH", "Sofia Rivera - Coach interno 1o1"] as const;
const contractTermOptions = [3, 6, 9, 12, 18, 24] as const;
const coachPartnerPlans = ["Coach Starter", "Coach Pro", "Coach Business"] as const;
const outplacementServices = ["Outplacement por campana", "Outplacement anual + campanas", "Outplacement ejecutivo", "Outplacement masivo"] as const;

const initialOrganizations: OrganizationRecord[] = [
  {
    id: "org-coach-norte",
    type: "coach_partner",
    name: "Franquicia Demo Norte",
    legalName: "Franquicia Demo Norte S.A. de C.V.",
    taxId: "FDN260601AB1",
    status: "activo",
    legalRepresentative: "Mariana Soto - Coach Partner principal",
    contactName: "Mariana Soto",
    contactEmail: "mariana@franquicia-demo.mx",
    contactPhone: "+52 55 1000 0003",
    country: "Mexico",
    state: "Nuevo Leon",
    city: "Monterrey",
    address: "Zona Norte",
    plan: "Coach Starter",
    licenseStart: "2026-06-01",
    licenseEnd: "2026-12-01",
    contractTermMonths: 6,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    monthlyGroups: 4,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner con bolsa principal para grupos y alumnos.",
    lastChange: "15/06/2026 18:30",
  },
  {
    id: "org-outplacement-demo",
    type: "outplacement_company",
    name: "Empresa Demo Outplacement",
    legalName: "Empresa Demo Outplacement S.A. de C.V.",
    taxId: "EDO260601CD2",
    status: "activo",
    legalRepresentative: "Ana Torres - Administrador RH",
    contactName: "Ana Torres",
    contactEmail: "ana@empresa-demo.mx",
    contactPhone: "+52 55 1000 0004",
    country: "Mexico",
    state: "Jalisco",
    city: "Guadalajara",
    address: "Oficinas corporativas",
    plan: "Outplacement anual + campanas",
    licenseStart: "2026-06-01",
    licenseEnd: "2027-06-01",
    contractTermMonths: 12,
    gracePeriodDays: 15,
    graceUntil: "2026-06-15",
    licenseVersion: 1,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 3,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Empresa cliente con ex-empleados autorizados por campana.",
    lastChange: "15/06/2026 17:10",
  },
];

export function AdminOrganizationsClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>(initialOrganizations);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [draftType, setDraftType] = useState<OrganizationType>("coach_partner");
  const [auditEvents, setAuditEvents] = useState<OrganizationAuditEvent[]>([]);

  const filteredOrganizations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations.filter((organization) => {
      const matchesText = !normalized || Object.values(organization).some((value) => String(value).toLowerCase().includes(normalized));
      const matchesType = typeFilter === "all" || organization.type === typeFilter;
      const matchesStatus = statusFilter === "all" || organization.status === statusFilter;
      return matchesText && matchesType && matchesStatus;
    });
  }, [organizations, query, statusFilter, typeFilter]);

  const selectedOrganization = filteredOrganizations.find((organization) => organization.id === selectedId);

  function createNew() {
    setSelectedId("");
    setDraftType("coach_partner");
    setNotice("");
  }

  function saveOrganization(formData: FormData) {
    const id = selectedOrganization?.id ?? `org-${Date.now()}`;
    const type = String(formData.get("type") || "coach_partner") as OrganizationType;
    const saved: OrganizationRecord = {
      id,
      type,
      name: String(formData.get("name") || "").trim() || "Organizacion sin nombre",
      legalName: String(formData.get("legalName") || "").trim(),
      taxId: String(formData.get("taxId") || "").trim(),
      status: String(formData.get("status") || t.statuses[0]),
      legalRepresentative: String(formData.get("legalRepresentative") || legalRepresentatives[0]),
      contactName: String(formData.get("contactName") || "").trim(),
      contactEmail: String(formData.get("contactEmail") || "").trim(),
      contactPhone: String(formData.get("contactPhone") || "").trim(),
      country: String(formData.get("country") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      plan: String(formData.get("plan") || "").trim(),
      licenseStart: String(formData.get("licenseStart") || ""),
      licenseEnd: String(formData.get("licenseEnd") || ""),
      contractTermMonths: Number(formData.get("contractTermMonths") || 6),
      gracePeriodDays: Number(formData.get("gracePeriodDays") || 0),
      graceUntil: String(formData.get("graceUntil") || ""),
      licenseVersion: Number(formData.get("licenseVersion") || selectedOrganization?.licenseVersion || 1),
      monthlyGroups: Number(formData.get("monthlyGroups") || 0),
      studentsPerGroup: Number(formData.get("studentsPerGroup") || 0),
      outplacementCampaigns: Number(formData.get("outplacementCampaigns") || 0),
      internalOwner: String(formData.get("internalOwner") || internalOwners[0]),
      notes: String(formData.get("notes") || "").trim(),
      lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
    };

    setOrganizations((current) => {
      const exists = current.some((organization) => organization.id === id);
      return exists ? current.map((organization) => organization.id === id ? saved : organization) : [saved, ...current];
    });
    setSelectedId(id);
    setDraftType(type);
    setNotice(t.saved);
  }

  function renewLicense() {
    if (!selectedOrganization) return;
    const nextStart = selectedOrganization.licenseEnd || todayInputValue();
    const nextEnd = addMonths(nextStart, selectedOrganization.contractTermMonths);
    const renewed: OrganizationRecord = {
      ...selectedOrganization,
      id: `${selectedOrganization.id}-renewal-${Date.now()}`,
      status: "pendiente",
      licenseStart: nextStart,
      licenseEnd: nextEnd,
      gracePeriodDays: 0,
      graceUntil: "",
      licenseVersion: selectedOrganization.licenseVersion + 1,
      lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
      notes: `${selectedOrganization.notes}\nRenovacion creada para nueva licencia.`,
    };
    setOrganizations((current) => [renewed, ...current]);
    setSelectedId(renewed.id);
    setDraftType(renewed.type);
    addAuditEvent(renewed.name, "license.renewal", `Nueva licencia v${renewed.licenseVersion}: ${renewed.licenseStart} - ${renewed.licenseEnd}`);
    setNotice(t.renewed);
  }

  function extendGracePeriod() {
    if (!selectedOrganization) return;
    const nextGraceDays = selectedOrganization.gracePeriodDays + 15;
    const nextGraceUntil = addDays(selectedOrganization.graceUntil || todayInputValue(), 15);
    setOrganizations((current) => current.map((organization) => organization.id === selectedOrganization.id ? {
      ...organization,
      gracePeriodDays: nextGraceDays,
      graceUntil: nextGraceUntil,
      lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
    } : organization));
    addAuditEvent(selectedOrganization.name, "license.grace.extend", `Extension de gracia: ${nextGraceDays} dias, vigente hasta ${nextGraceUntil}`);
    setNotice(t.graceExtended);
  }

  function addAuditEvent(organizationName: string, action: string, detail: string) {
    setAuditEvents((current) => [
      {
        id: `${Date.now()}-${action}`,
        organizationName,
        action,
        detail,
        actor: "Leo Galvez - Super Admin",
        createdAt: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
      },
      ...current,
    ]);
  }

  function logicalDelete() {
    if (!selectedOrganization) return;
    setOrganizations((current) => current.map((organization) => organization.id === selectedOrganization.id ? { ...organization, status: "borrado_logico", lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }) } : organization));
    setNotice(t.deleted);
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-5xl text-lg leading-8 text-slate-600">{t.description}</p>
        <p className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-bold leading-6 text-purple-900">{t.rule}</p>
      </header>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-black text-slate-950">{t.filters}</h2>
        <div className="grid gap-3 lg:grid-cols-[1fr_240px_220px]">
          <div>
            <Label>{t.search}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder={t.searchPlaceholder} />
            </div>
          </div>
          <Field label={t.type}>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">{t.all}</option>
              {Object.entries(t.types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </Select>
          </Field>
          <Field label={t.status}>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">{t.all}</option>
              {t.statuses.map((status) => <option key={status}>{status}</option>)}
            </Select>
          </Field>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">{t.found}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{t.listHelp}</p>
        </div>
        <div className="max-h-[190px] overflow-auto">
          <table className="w-full min-w-[1340px] text-left text-sm">
            <thead className="sticky top-0 z-10"><tr>{t.columns.map((column) => <Th key={column}>{column}</Th>)}</tr></thead>
            <tbody>
              {filteredOrganizations.map((organization) => (
                <tr key={organization.id} className={`border-b border-slate-100 last:border-0 ${selectedId === organization.id ? "bg-[var(--brand-primary-soft)]" : ""}`}>
                  <Td><input type="radio" name="selected-organization" checked={selectedId === organization.id} onChange={() => { setSelectedId(organization.id); setDraftType(organization.type); }} /></Td>
                  <Td><strong className="block text-slate-950">{organization.name}</strong><span className="text-xs text-slate-500">{organization.legalName || organization.taxId}</span></Td>
                  <Td><Pill>{t.types[organization.type]}</Pill></Td>
                  <Td>{organization.legalRepresentative}</Td>
                  <Td><strong className="block text-slate-700">{organization.contactName}</strong><span className="text-xs text-slate-500">{organization.contactEmail}</span></Td>
                  <Td>{organization.city}, {organization.state}</Td>
                  <Td>{organization.plan}<span className="block text-xs text-slate-500">v{organization.licenseVersion} · {organization.contractTermMonths} meses</span></Td>
                  <Td>{organization.type === "coach_partner" ? `${organization.monthlyGroups} x ${organization.studentsPerGroup}` : `${organization.outplacementCampaigns} campanas`}</Td>
                  <Td>{organization.internalOwner}</Td>
                  <Td><Pill>{organization.status}</Pill></Td>
                  <Td>{organization.lastChange}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">{notice}</div> : null}

      <form key={selectedOrganization?.id ?? "new-organization"} action={saveOrganization} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{t.formTitle}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedOrganization ? `${t.selected}: ${selectedOrganization.name}` : t.noSelected}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]" onClick={createNew}><UserPlus size={17} />{t.create}</Button>
            <Button type="button" disabled={!selectedOrganization} className="gap-2 bg-slate-950 text-white hover:bg-slate-800"><Edit3 size={17} />{t.edit}</Button>
            <Button type="submit" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"><Save size={17} />{t.save}</Button>
            <Button type="button" disabled={!selectedOrganization} className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={renewLicense}>{t.renew}</Button>
            <Button type="button" disabled={!selectedOrganization} className="gap-2 bg-amber-500 text-white hover:bg-amber-600" onClick={extendGracePeriod}>{t.extendGrace}</Button>
            <Button type="button" disabled={!selectedOrganization} className="gap-2 bg-red-600 text-white hover:bg-red-700" onClick={logicalDelete}><Trash2 size={17} />{t.deleteLogical}</Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <FormGroup title={t.identity} icon={<Building2 size={18} />}>
            <Field label={t.type}><Select name="type" value={draftType} onChange={(event) => setDraftType(event.target.value as OrganizationType)}>{Object.entries(t.types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></Field>
            <Field label={t.commercialName}><Input name="name" defaultValue={selectedOrganization?.name ?? ""} /></Field>
            <Field label={t.legalName}><Input name="legalName" defaultValue={selectedOrganization?.legalName ?? ""} /></Field>
            <Field label={t.taxId}><Input name="taxId" defaultValue={selectedOrganization?.taxId ?? ""} /></Field>
            <Field label={t.status}><Select name="status" defaultValue={selectedOrganization?.status ?? t.statuses[0]}>{t.statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
          </FormGroup>

          <FormGroup title={t.contact} icon={<Building2 size={18} />}>
            <Field label={t.contactName}><Input name="contactName" defaultValue={selectedOrganization?.contactName ?? ""} /></Field>
            <Field label={t.contactEmail}><Input name="contactEmail" type="email" defaultValue={selectedOrganization?.contactEmail ?? ""} /></Field>
            <Field label={t.contactPhone}><Input name="contactPhone" defaultValue={selectedOrganization?.contactPhone ?? ""} /></Field>
            <Field label={t.legalRepresentative}><Select name="legalRepresentative" defaultValue={selectedOrganization?.legalRepresentative ?? legalRepresentatives[0]}>{legalRepresentatives.map((representative) => <option key={representative}>{representative}</option>)}</Select></Field>
            <p className="text-xs font-semibold leading-5 text-slate-500">{t.legalRepresentativeHelp}</p>
            <Field label={t.internalOwner}><Select name="internalOwner" defaultValue={selectedOrganization?.internalOwner ?? internalOwners[0]}>{internalOwners.map((owner) => <option key={owner}>{owner}</option>)}</Select></Field>
          </FormGroup>

          <FormGroup title={t.location} icon={<Building2 size={18} />}>
            <Field label={t.country}><Input name="country" defaultValue={selectedOrganization?.country ?? "Mexico"} /></Field>
            <Field label={t.state}><Input name="state" defaultValue={selectedOrganization?.state ?? ""} /></Field>
            <Field label={t.city}><Input name="city" defaultValue={selectedOrganization?.city ?? ""} /></Field>
            <Field label={t.address}><Textarea name="address" defaultValue={selectedOrganization?.address ?? ""} /></Field>
          </FormGroup>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <FormGroup title={t.license} icon={<Building2 size={18} />}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={draftType === "coach_partner" ? t.plan : t.outplacementService}>
                <Select name="plan" defaultValue={selectedOrganization?.plan ?? (draftType === "coach_partner" ? coachPartnerPlans[0] : outplacementServices[0])}>
                  {(draftType === "coach_partner" ? coachPartnerPlans : outplacementServices).map((plan) => <option key={plan}>{plan}</option>)}
                </Select>
              </Field>
              <Field label={t.contractTerm}><Select name="contractTermMonths" defaultValue={String(selectedOrganization?.contractTermMonths ?? 6)}>{contractTermOptions.map((months) => <option key={months} value={months}>{months} meses</option>)}</Select></Field>
              <Field label={t.licenseStart}><Input name="licenseStart" type="date" defaultValue={selectedOrganization?.licenseStart ?? ""} /></Field>
              <Field label={t.licenseEnd}><Input name="licenseEnd" type="date" defaultValue={selectedOrganization?.licenseEnd ?? ""} /></Field>
              <Field label={t.gracePeriod}><Input name="gracePeriodDays" type="number" min={0} defaultValue={selectedOrganization?.gracePeriodDays ?? 0} /></Field>
              <Field label={t.graceUntil}><Input name="graceUntil" type="date" defaultValue={selectedOrganization?.graceUntil ?? ""} /></Field>
              <Field label={t.licenseVersion}><Input name="licenseVersion" type="number" min={1} defaultValue={selectedOrganization?.licenseVersion ?? 1} readOnly /></Field>
              {draftType === "coach_partner" ? (
                <>
                  <Field label={t.groups}><Input name="monthlyGroups" type="number" min={0} defaultValue={selectedOrganization?.monthlyGroups ?? 0} /></Field>
                  <Field label={t.students}><Input name="studentsPerGroup" type="number" min={0} defaultValue={selectedOrganization?.studentsPerGroup ?? 0} /></Field>
                  <input type="hidden" name="outplacementCampaigns" value={selectedOrganization?.outplacementCampaigns ?? 0} />
                </>
              ) : (
                <>
                  <Field label={t.campaigns}><Input name="outplacementCampaigns" type="number" min={0} defaultValue={selectedOrganization?.outplacementCampaigns ?? 0} /></Field>
                  <input type="hidden" name="monthlyGroups" value={selectedOrganization?.monthlyGroups ?? 0} />
                  <input type="hidden" name="studentsPerGroup" value={selectedOrganization?.studentsPerGroup ?? 0} />
                </>
              )}
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{t.planHelp}</p>
          </FormGroup>

          <FormGroup title={t.notes} icon={<Building2 size={18} />}>
            <Textarea name="notes" className="min-h-52" defaultValue={selectedOrganization?.notes ?? ""} />
          </FormGroup>
        </div>
        <LicenseAuditLog title={t.audit} empty={t.auditEmpty} events={auditEvents} />
      </form>
    </div>
  );
}

function FormGroup({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">{icon}{title}</h3>
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

function LicenseAuditLog({ title, empty, events }: { title: string; empty: string; events: OrganizationAuditEvent[] }) {
  return (
    <section className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      {events.length ? (
        <div className="mt-3 max-h-44 overflow-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr>
                <Th>Organizacion</Th>
                <Th>Accion</Th>
                <Th>Detalle</Th>
                <Th>Actor</Th>
                <Th>Fecha</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-slate-100 last:border-0">
                  <Td>{event.organizationName}</Td>
                  <Td><Pill>{event.action}</Pill></Td>
                  <Td>{event.detail}</Td>
                  <Td>{event.actor}</Td>
                  <Td>{event.createdAt}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-2 text-sm font-semibold text-slate-500">{empty}</p>
      )}
    </section>
  );
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
