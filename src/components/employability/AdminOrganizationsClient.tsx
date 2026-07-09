"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  contractValue: number;
  gracePeriodDays: number;
  graceUntil: string;
  licenseVersion: number;
  credits: number;
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

type OrganizationSearchMode = "capture" | "edit" | "delete";
type DemoAdminRole = "Super Admin" | "Apoyo administrativo" | "Operativo outplacement" | "Supervisor delegado temporal";

const copy = {
  es: {
    eyebrow: "Super Admin",
    title: "Organizaciones",
    description: "Administra organizaciones externas: empresas que contratan Outplacement y Coach Partner.",
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
    edit: "Busqueda de organizacion",
    save: "Guardar organizacion",
    renew: "Renovacion",
    deleteRenewal: "Borrar renovacion",
    extendGrace: "Extender gracia",
    deleteLogical: "Borrar organizacion completa",
    confirmDelete: "Confirmar borrado logico",
    searchModeEditHelp: "Busca y selecciona una organizacion. Al elegirla regresaras a captura para editar y guardar cambios.",
    searchModeDeleteHelp: "Busca y selecciona una organizacion. Al elegirla regresaras a captura para confirmar el borrado logico.",
    selectedForEdit: "Organizacion seleccionada. Edita lo necesario y presiona Guardar organizacion.",
    selectedForDelete: "Organizacion seleccionada. Revisa el registro y confirma el borrado logico si corresponde.",
    saved: "Organizacion guardada en la tabla correspondiente.",
    renewed: "Renovacion creada como una licencia distinta para esta organizacion.",
    renewalBlocked: "No se puede renovar: la licencia seleccionada sigue vigente o dentro del periodo de gracia.",
    renewalDeleted: "Renovacion marcada como cancelada por Super Admin y registrada en bitacora.",
    graceExtended: "Periodo de gracia extendido por Super Admin y registrado en bitacora.",
    deleted: "La organizacion paso a estado borrado lógico. No fue eliminada definitivamente.",
    hardDeleteBlocked: "No se puede borrar completa: la organizacion tiene renovaciones, historial de licencia o licencia vigente/gracia. Usa borrado logico para conservar trazabilidad.",
    hardDeleted: "Organizacion eliminada por completo porque no tenia historial ni licencia vigente.",
    requiredFields: "Captura todos los campos obligatorios de identidad, contacto principal y ubicacion.",
    duplicateCoachPartner: "Ya existe una organizacion Coach Partner con la misma identidad. No puede duplicarse.",
    groupsRequired: "Los grupos mensuales de Coach Partner deben ser mayores que 0.",
    unauthorizedCreate: "Tu rol no tiene permiso para crear organizaciones.",
    identity: "Identidad",
    commercialName: "Nombre comercial",
    legalName: "Razon social",
    taxId: "RFC / Tax ID",
    contact: "Contacto principal",
    legalRepresentative: "Representante legal",
    legalRepresentativeHelp: "Nombre de la persona que firma o representa legalmente el contrato. No tiene que ser usuario del sistema.",
    contactName: "Nombre contacto",
    contactEmail: "Correo contacto",
    contactPhone: "Telefono contacto",
    location: "Ubicacion",
    country: "Pais",
    state: "Estado",
    city: "Ciudad",
    address: "Direccion",
    license: "Licencia, contrato y capacidad",
    currentLicense: "Licencia vigente",
    licenseStatus: "Estatus licencia",
    plan: "Plan Coach Partner",
    outplacementService: "Servicio outplacement",
    planHelp: "Los planes solo aplican a Coach Partner. En Outplacement se registra el servicio contratado; los creditos son variables segun campana, agentes y duracion.",
    serviceDuration: "Duracion del servicio",
    contractValue: "Valor del contrato",
    contractValueHelp: "Monto comercial capturado para tener visible cuanto vale este cliente.",
    licenseStart: "Inicio licencia",
    licenseEnd: "Fin licencia",
    contractTerm: "Duracion del contrato",
    gracePeriod: "Dias de gracia",
    graceUntil: "Gracia vigente hasta",
    licenseVersion: "Version licencia",
    groups: "Grupos mensuales",
    students: "Alumnos por grupo",
    campaigns: "Campañas de outplacement",
    credits: "Creditos del contrato",
    creditsHelp: "Coach Partner: se calculan automaticamente por plan. Outplacement: variable dependiendo de la campana que se cree.",
    capacity: "Capacidad",
    studentCredits: "Creditos por alumno",
    maxStudents: "Alumnos maximos",
    audit: "Bitacora de licencias",
    auditEmpty: "Aun no hay movimientos de licencia en esta sesion.",
    internalOwner: "Responsable interno",
    notes: "Notas internas",
    columns: ["Seleccion", "Organizacion", "Tipo", "Representante", "Contacto", "Ubicacion", "Licencia vigente", "Plan", "Valor contrato", "Creditos", "Capacidad", "Responsable", "Estado", "Ultimo cambio"],
    types: {
      coach_partner: "Coach Partner",
      outplacement_company: "Outplacement",
    },
    statuses: ["activo", "pendiente", "bloqueado", "borrado_logico"],
  },
  en: {
    eyebrow: "Super Admin",
    title: "Organizations",
    description: "Manage external organizations: companies hiring Outplacement and Coach Partner.",
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
    edit: "Organization search",
    save: "Save organization",
    renew: "Renewal",
    deleteRenewal: "Delete renewal",
    extendGrace: "Extend grace",
    deleteLogical: "Delete full organization",
    confirmDelete: "Confirm logical delete",
    searchModeEditHelp: "Search and select an organization. After selecting, you will return to capture to edit and save changes.",
    searchModeDeleteHelp: "Search and select an organization. After selecting, you will return to capture to confirm logical deletion.",
    selectedForEdit: "Organization selected. Edit what is needed and press Save organization.",
    selectedForDelete: "Organization selected. Review the record and confirm logical deletion if appropriate.",
    saved: "Organization saved in the corresponding table.",
    renewed: "Renewal created as a separate license for this organization.",
    renewalBlocked: "Cannot renew: the selected license is still active or inside its grace period.",
    renewalDeleted: "Renewal marked as cancelled by Super Admin and recorded in the audit log.",
    graceExtended: "Grace period extended by Super Admin and recorded in the audit log.",
    deleted: "The organization was moved to logical_delete. It was not permanently deleted.",
    hardDeleteBlocked: "Full delete is not allowed: the organization has renewals, license history, or an active/grace license. Use logical delete to keep traceability.",
    hardDeleted: "Organization fully deleted because it had no history and no active license.",
    requiredFields: "Capture every required identity, main contact, and location field.",
    duplicateCoachPartner: "A Coach Partner organization with the same identity already exists. It cannot be duplicated.",
    groupsRequired: "Monthly Coach Partner groups must be greater than 0.",
    unauthorizedCreate: "Your role is not allowed to create organizations.",
    identity: "Identity",
    commercialName: "Commercial name",
    legalName: "Legal name",
    taxId: "Tax ID",
    contact: "Main contact",
    legalRepresentative: "Legal representative",
    legalRepresentativeHelp: "Name of the person who signs or legally represents the contract. This person does not need to be a system user.",
    contactName: "Contact name",
    contactEmail: "Contact email",
    contactPhone: "Contact phone",
    location: "Location",
    country: "Country",
    state: "State",
    city: "City",
    address: "Address",
    license: "License, contract, and capacity",
    currentLicense: "Current license",
    licenseStatus: "License status",
    plan: "Coach Partner plan",
    outplacementService: "Outplacement service",
    planHelp: "Plans apply only to Coach Partner. For Outplacement, register the contracted service; credits are variable by campaign, agents, and duration.",
    serviceDuration: "Service duration",
    contractValue: "Contract value",
    contractValueHelp: "Commercial amount captured to keep the client value visible.",
    licenseStart: "License start",
    licenseEnd: "License end",
    contractTerm: "Contract duration",
    gracePeriod: "Grace days",
    graceUntil: "Grace valid until",
    licenseVersion: "License version",
    groups: "Monthly groups",
    students: "Students per group",
    campaigns: "Outplacement campaigns",
    credits: "Contract credits",
    creditsHelp: "Coach Partner: calculated automatically by plan. Outplacement: variable depending on the campaign created.",
    capacity: "Capacity",
    studentCredits: "Student credits",
    maxStudents: "Maximum students",
    audit: "License audit log",
    auditEmpty: "There are no license movements in this session yet.",
    internalOwner: "Internal owner",
    notes: "Internal notes",
    columns: ["Select", "Organization", "Type", "Representative", "Contact", "Location", "Current license", "Plan", "Contract value", "Credits", "Capacity", "Owner", "Status", "Last change"],
    types: {
      coach_partner: "Coach Partner",
      outplacement_company: "Outplacement",
    },
    statuses: ["active", "pending", "blocked", "logical_delete"],
  },
} as const;

const internalOwners = ["Leo Galvez - Super Admin", "Valeria Nunez - Apoyo administrativo", "Ricardo Vega - Operativo outplacement", "Daniela Ponce - Apoyo cobranza"] as const;
const contractTermOptions = [3, 6, 9, 12, 18, 24] as const;
const coachPartnerPlans = ["Coach Starter", "Coach Pro", "Coach Business"] as const;
const statusOptions = ["activo", "pendiente", "bloqueado", "borrado_logico"] as const;
const outplacementServices = ["Salida digna", "Recolocacion Pyme 60", "Recolocacion profesional 90", "Outplacement ejecutivo Pyme"] as const;
const outplacementServiceRules = {
  "Salida digna": { days: 28, durationEs: "4 semanas", durationEn: "4 weeks" },
  "Recolocacion Pyme 60": { days: 60, durationEs: "60 dias", durationEn: "60 days" },
  "Recolocacion profesional 90": { days: 90, durationEs: "90 dias", durationEn: "90 days" },
  "Outplacement ejecutivo Pyme": { days: 90, durationEs: "3 meses", durationEn: "3 months" },
} as const;
const coachPartnerPlanRules = {
  "Coach Starter": { groups: 4, studentsPerGroup: 5, baseCreditsPerCycle: 1890, cycles: 3, studentCycles: 2, unlimited: false },
  "Coach Pro": { groups: 12, studentsPerGroup: 5, baseCreditsPerCycle: 2300, cycles: 3, studentCycles: 2, unlimited: false },
  "Coach Business": { groups: Infinity, studentsPerGroup: Infinity, baseCreditsPerCycle: Infinity, cycles: Infinity, studentCycles: Infinity, unlimited: true },
} as const;

const initialOrganizations: OrganizationRecord[] = [
  {
    id: "org-coach-norte",
    type: "coach_partner",
    name: "Partner Ejecutivo Norte",
    legalName: "Partner Ejecutivo Norte S.A. de C.V.",
    taxId: "FDN260601AB1",
    status: "activo",
    legalRepresentative: "Mariana Soto",
    contactName: "Mariana Soto",
    contactEmail: "mariana@partner-demo.mx",
    contactPhone: "+52 55 1000 0003",
    country: "Mexico",
    state: "Nuevo Leon",
    city: "Monterrey",
    address: "Zona Norte",
    plan: "Coach Starter",
    licenseStart: "2026-06-01",
    licenseEnd: "2026-12-01",
    contractTermMonths: 6,
    contractValue: 90000,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Starter"),
    monthlyGroups: 4,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner con bolsa principal para grupos y alumnos.",
    lastChange: "15/06/2026 18:30",
  },
  {
    id: "org-coach-bajio",
    type: "coach_partner",
    name: "Partner Bajio",
    legalName: "Partner Bajio S.A. de C.V.",
    taxId: "PBA260601EF3",
    status: "activo",
    legalRepresentative: "Hector Ramos",
    contactName: "Hector Ramos",
    contactEmail: "hector@partner-demo.mx",
    contactPhone: "+52 55 1000 0008",
    country: "Mexico",
    state: "Guanajuato",
    city: "Leon",
    address: "Zona Bajio",
    plan: "Coach Pro",
    licenseStart: "2026-06-01",
    licenseEnd: "2027-06-01",
    contractTermMonths: 12,
    contractValue: 240000,
    gracePeriodDays: 15,
    graceUntil: "2027-06-15",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Pro"),
    monthlyGroups: 12,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner Pro con grupos regionales.",
    lastChange: "16/06/2026 10:20",
  },
  {
    id: "org-coach-cdmx",
    type: "coach_partner",
    name: "Partner Ejecutivo CDMX",
    legalName: "Partner Ejecutivo CDMX S.A. de C.V.",
    taxId: "PEC260701GH4",
    status: "activo",
    legalRepresentative: "Carolina Mendez",
    contactName: "Carolina Mendez",
    contactEmail: "carolina@partner-cdmx.mx",
    contactPhone: "+52 55 1000 0022",
    country: "Mexico",
    state: "Ciudad de Mexico",
    city: "Ciudad de Mexico",
    address: "Roma Norte",
    plan: "Coach Starter",
    licenseStart: "2026-07-01",
    licenseEnd: "2027-01-01",
    contractTermMonths: 6,
    contractValue: 95000,
    gracePeriodDays: 15,
    graceUntil: "2027-01-15",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Starter"),
    monthlyGroups: 4,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner Starter para mercado CDMX.",
    lastChange: "16/06/2026 13:15",
  },
  {
    id: "org-coach-global",
    type: "coach_partner",
    name: "Partner Carrera Global",
    legalName: "Partner Carrera Global S.A. de C.V.",
    taxId: "PCG260615IJ5",
    status: "activo",
    legalRepresentative: "Daniela Ruiz",
    contactName: "Daniela Ruiz",
    contactEmail: "daniela@partner-global.mx",
    contactPhone: "+52 55 1000 0028",
    country: "Mexico",
    state: "Queretaro",
    city: "Queretaro",
    address: "Centro Sur",
    plan: "Coach Business",
    licenseStart: "2026-06-15",
    licenseEnd: "2027-06-15",
    contractTermMonths: 12,
    contractValue: 520000,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Business"),
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner Business con creditos ilimitados.",
    lastChange: "17/06/2026 09:40",
  },
  {
    id: "org-outplacement-demo",
    type: "outplacement_company",
    name: "Empresa Demo Outplacement",
    legalName: "Empresa Demo Outplacement S.A. de C.V.",
    taxId: "EDO260601CD2",
    status: "activo",
    legalRepresentative: "Ana Torres",
    contactName: "Ana Torres",
    contactEmail: "ana@empresa-demo.mx",
    contactPhone: "+52 55 1000 0004",
    country: "Mexico",
    state: "Jalisco",
    city: "Guadalajara",
    address: "Oficinas corporativas",
    plan: "Recolocacion profesional 90",
    licenseStart: "2026-06-01",
    licenseEnd: "2026-08-30",
    contractTermMonths: 3,
    contractValue: 180000,
    gracePeriodDays: 15,
    graceUntil: "2026-06-15",
    licenseVersion: 1,
    credits: 42000,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 3,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Empresa cliente con ex-empleados autorizados por campana.",
    lastChange: "15/06/2026 17:10",
  },
  {
    id: "org-outplacement-industrial",
    type: "outplacement_company",
    name: "Grupo Industrial Norte",
    legalName: "Grupo Industrial Norte S.A. de C.V.",
    taxId: "GIN260610QR1",
    status: "activo",
    legalRepresentative: "Roberto Salinas",
    contactName: "Roberto Salinas",
    contactEmail: "roberto@industrial-norte.mx",
    contactPhone: "+52 81 1000 0060",
    country: "Mexico",
    state: "Nuevo Leon",
    city: "Monterrey",
    address: "Parque Industrial Norte",
    plan: "Salida digna",
    licenseStart: "2026-06-10",
    licenseEnd: "2026-07-08",
    contractTermMonths: 1,
    contractValue: 75000,
    gracePeriodDays: 7,
    graceUntil: "2026-07-15",
    licenseVersion: 1,
    credits: 18000,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 1,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Servicio Salida digna para cierre de planta.",
    lastChange: "18/06/2026 10:10",
  },
  {
    id: "org-outplacement-delta",
    type: "outplacement_company",
    name: "Servicios Financieros Delta",
    legalName: "Servicios Financieros Delta S.A. de C.V.",
    taxId: "SFD260520ST2",
    status: "activo",
    legalRepresentative: "Patricia Campos",
    contactName: "Patricia Campos",
    contactEmail: "patricia@delta-fin.mx",
    contactPhone: "+52 55 1000 0065",
    country: "Mexico",
    state: "Ciudad de Mexico",
    city: "Ciudad de Mexico",
    address: "Santa Fe",
    plan: "Recolocacion Pyme 60",
    licenseStart: "2026-05-20",
    licenseEnd: "2026-07-19",
    contractTermMonths: 2,
    contractValue: 125000,
    gracePeriodDays: 10,
    graceUntil: "2026-07-29",
    licenseVersion: 1,
    credits: 28000,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 2,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Programa de recolocacion para perfiles administrativos.",
    lastChange: "18/06/2026 11:25",
  },
  {
    id: "org-outplacement-retail",
    type: "outplacement_company",
    name: "Retail Nacional",
    legalName: "Retail Nacional S.A. de C.V.",
    taxId: "RNA260701UV3",
    status: "pendiente",
    legalRepresentative: "Laura Benitez",
    contactName: "Laura Benitez",
    contactEmail: "laura@retail-nacional.mx",
    contactPhone: "+52 55 1000 0070",
    country: "Mexico",
    state: "Estado de Mexico",
    city: "Naucalpan",
    address: "Corporativo Satelite",
    plan: "Outplacement ejecutivo Pyme",
    licenseStart: "2026-07-01",
    licenseEnd: "2026-10-01",
    contractTermMonths: 3,
    contractValue: 220000,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    credits: 55000,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 0,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Contrato pendiente de firma para ejecutivos Pyme.",
    lastChange: "18/06/2026 14:35",
  },
  {
    id: "org-outplacement-manufacturas",
    type: "outplacement_company",
    name: "Manufacturas del Centro",
    legalName: "Manufacturas del Centro S.A. de C.V.",
    taxId: "MCE260415WX4",
    status: "activo",
    legalRepresentative: "Jorge Medina",
    contactName: "Jorge Medina",
    contactEmail: "jorge@manufacturas-centro.mx",
    contactPhone: "+52 442 1000 0075",
    country: "Mexico",
    state: "Queretaro",
    city: "Queretaro",
    address: "Parque Industrial Bernardo Quintana",
    plan: "Recolocacion profesional 90",
    licenseStart: "2026-04-15",
    licenseEnd: "2026-07-14",
    contractTermMonths: 3,
    contractValue: 165000,
    gracePeriodDays: 15,
    graceUntil: "2026-07-29",
    licenseVersion: 1,
    credits: 36000,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 2,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Recolocacion profesional para mandos medios.",
    lastChange: "19/06/2026 09:10",
  },
  {
    id: "org-outplacement-tech",
    type: "outplacement_company",
    name: "Tecnologia Humana Global",
    legalName: "Tecnologia Humana Global S.A. de C.V.",
    taxId: "THG260801YZ5",
    status: "pendiente",
    legalRepresentative: "Nadia Herrera",
    contactName: "Nadia Herrera",
    contactEmail: "nadia@techhumana.mx",
    contactPhone: "+52 55 1000 0080",
    country: "Mexico",
    state: "Jalisco",
    city: "Guadalajara",
    address: "Distrito Digital",
    plan: "Recolocacion Pyme 60",
    licenseStart: "2026-08-01",
    licenseEnd: "2026-09-30",
    contractTermMonths: 2,
    contractValue: 140000,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    credits: 30000,
    monthlyGroups: 0,
    studentsPerGroup: 0,
    outplacementCampaigns: 0,
    internalOwner: "Ricardo Vega - Operativo outplacement",
    notes: "Contrato en preparacion para perfiles tecnologicos.",
    lastChange: "19/06/2026 11:45",
  },
  {
    id: "org-coach-sureste",
    type: "coach_partner",
    name: "Partner Talento Sureste",
    legalName: "Partner Talento Sureste S.A. de C.V.",
    taxId: "PTS260515KL6",
    status: "activo",
    legalRepresentative: "Sofia Aguilar",
    contactName: "Sofia Aguilar",
    contactEmail: "sofia@partner-sureste.mx",
    contactPhone: "+52 55 1000 0033",
    country: "Mexico",
    state: "Yucatan",
    city: "Merida",
    address: "Zona Altabrisa",
    plan: "Coach Starter",
    licenseStart: "2026-05-15",
    licenseEnd: "2026-11-15",
    contractTermMonths: 6,
    contractValue: 88000,
    gracePeriodDays: 15,
    graceUntil: "2026-11-30",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Starter"),
    monthlyGroups: 4,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner Starter con periodo de gracia configurado.",
    lastChange: "18/06/2026 08:50",
  },
  {
    id: "org-coach-industrial",
    type: "coach_partner",
    name: "Partner Carrera Industrial",
    legalName: "Partner Carrera Industrial S.A. de C.V.",
    taxId: "PCI260401MN7",
    status: "activo",
    legalRepresentative: "Rafael Ortega",
    contactName: "Rafael Ortega",
    contactEmail: "rafael@partner-industrial.mx",
    contactPhone: "+52 55 1000 0037",
    country: "Mexico",
    state: "Coahuila",
    city: "Saltillo",
    address: "Parque Industrial",
    plan: "Coach Pro",
    licenseStart: "2026-04-01",
    licenseEnd: "2027-04-01",
    contractTermMonths: 12,
    contractValue: 260000,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Pro"),
    monthlyGroups: 12,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner Pro para perfiles industriales.",
    lastChange: "18/06/2026 12:10",
  },
  {
    id: "org-coach-mujeres",
    type: "coach_partner",
    name: "Partner Mujeres Profesionales",
    legalName: "Partner Mujeres Profesionales S.A. de C.V.",
    taxId: "PMP260801OP8",
    status: "pendiente",
    legalRepresentative: "Valeria Torres",
    contactName: "Valeria Torres",
    contactEmail: "valeria@partner-mujeres.mx",
    contactPhone: "+52 55 1000 0041",
    country: "Mexico",
    state: "Puebla",
    city: "Puebla",
    address: "Angelopolis",
    plan: "Coach Starter",
    licenseStart: "2026-08-01",
    licenseEnd: "2027-02-01",
    contractTermMonths: 6,
    contractValue: 92000,
    gracePeriodDays: 0,
    graceUntil: "",
    licenseVersion: 1,
    credits: calculateCoachPartnerOrganizationCredits("Coach Starter"),
    monthlyGroups: 4,
    studentsPerGroup: 5,
    outplacementCampaigns: 0,
    internalOwner: "Leo Galvez - Super Admin",
    notes: "Coach Partner pendiente de activacion contractual.",
    lastChange: "19/06/2026 16:25",
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
  const [draftPlan, setDraftPlan] = useState<string>("Coach Starter");
  const [auditEvents, setAuditEvents] = useState<OrganizationAuditEvent[]>([]);
  const [searchMode, setSearchMode] = useState<OrganizationSearchMode>("capture");
  const [draftLicenseStart, setDraftLicenseStart] = useState("");
  const [draftGracePeriodDays, setDraftGracePeriodDays] = useState(0);
  const currentAdminRole: DemoAdminRole = "Super Admin";

  const filteredOrganizations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations.filter((organization) => {
      const matchesText = !normalized || Object.values(organization).some((value) => String(value).toLowerCase().includes(normalized));
      const matchesType = typeFilter === "all" || organization.type === typeFilter;
      const matchesStatus = statusFilter === "all" || organization.status === statusFilter;
      return matchesText && matchesType && matchesStatus;
    });
  }, [organizations, query, statusFilter, typeFilter]);

  const selectedOrganization = organizations.find((organization) => organization.id === selectedId);
  const selectedLicenseState = selectedOrganization ? getLicenseState(selectedOrganization) : null;
  const calculatedGraceUntil = calculateGraceUntil(draftLicenseStart, draftGracePeriodDays);

  useEffect(() => {
    setDraftLicenseStart(selectedOrganization?.licenseStart ?? "");
    setDraftGracePeriodDays(selectedOrganization?.gracePeriodDays ?? 0);
  }, [selectedOrganization?.gracePeriodDays, selectedOrganization?.licenseStart]);

  function createNew() {
    setSelectedId("");
    setDraftType("coach_partner");
    setDraftPlan("Coach Starter");
    setDraftLicenseStart("");
    setDraftGracePeriodDays(0);
    setSearchMode("capture");
    setNotice("");
  }

  function selectOrganizationForMaintenance(organization: OrganizationRecord) {
    const nextMode = searchMode;
    setSelectedId(organization.id);
    setDraftType(organization.type);
    setDraftPlan(organization.plan);
    setSearchMode("capture");
    setNotice(nextMode === "delete" ? t.selectedForDelete : t.selectedForEdit);
  }

  function saveOrganization(formData: FormData) {
    const id = selectedOrganization?.id ?? `org-${Date.now()}`;
    const type = String(formData.get("type") || "coach_partner") as OrganizationType;
    const plan = String(formData.get("plan") || "").trim();
    const calculatedCredits = type === "coach_partner" ? calculateCoachPartnerOrganizationCredits(plan) : 0;
    const calculatedCapacity = type === "coach_partner" ? capacityForCoachPartnerPlan(plan) : null;
    const contractTermMonths = type === "coach_partner" ? Number(formData.get("contractTermMonths") || 6) : outplacementServiceMonths(plan);
    const name = String(formData.get("name") || "").trim();
    const legalName = String(formData.get("legalName") || "").trim();
    const taxId = String(formData.get("taxId") || "").trim();
    const legalRepresentative = String(formData.get("legalRepresentative") || "").trim();
    const contactName = String(formData.get("contactName") || "").trim();
    const contactEmail = String(formData.get("contactEmail") || "").trim();
    const contactPhone = String(formData.get("contactPhone") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const state = String(formData.get("state") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const licenseStart = String(formData.get("licenseStart") || "").trim();
    const gracePeriodDays = Number(formData.get("gracePeriodDays") || 0);
    const monthlyGroups = calculatedCapacity ? calculatedCapacity.groups : Number(formData.get("monthlyGroups") || 0);
    if (!selectedOrganization && !canCreateOrganization(currentAdminRole)) {
      setNotice(t.unauthorizedCreate);
      return;
    }
    if (!name || !legalName || !taxId || !legalRepresentative || !contactName || !contactEmail || !contactPhone || !country || !state || !city || !address) {
      setNotice(t.requiredFields);
      return;
    }
    if (type === "coach_partner" && organizations.some((organization) => organization.id !== id && organization.type === "coach_partner" && sameCoachPartnerIdentity(organization, name, legalName, taxId))) {
      setNotice(t.duplicateCoachPartner);
      return;
    }
    if (type === "coach_partner" && (!Number.isFinite(monthlyGroups) || monthlyGroups <= 0)) {
      setNotice(t.groupsRequired);
      return;
    }
    const saved: OrganizationRecord = {
      id,
      type,
      name,
      legalName,
      taxId,
      status: String(formData.get("status") || "activo"),
      legalRepresentative,
      contactName,
      contactEmail,
      contactPhone,
      country,
      state,
      city,
      address,
      plan,
      licenseStart,
      licenseEnd: String(formData.get("licenseEnd") || ""),
      contractTermMonths,
      contractValue: Number(formData.get("contractValue") || 0),
      gracePeriodDays,
      graceUntil: calculateGraceUntil(licenseStart, gracePeriodDays),
      licenseVersion: Number(formData.get("licenseVersion") || selectedOrganization?.licenseVersion || 1),
      credits: calculatedCredits,
      monthlyGroups,
      studentsPerGroup: calculatedCapacity ? calculatedCapacity.studentsPerGroup : Number(formData.get("studentsPerGroup") || 0),
      outplacementCampaigns: Number(formData.get("outplacementCampaigns") || selectedOrganization?.outplacementCampaigns || 0),
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
    setDraftPlan(plan);
    setNotice(t.saved);
  }

  function renewLicense() {
    if (!selectedOrganization) return;
    const licenseState = getLicenseState(selectedOrganization);
    if (licenseState === "vigente" || licenseState === "gracia") {
      addAuditEvent(selectedOrganization.name, "license.renewal.blocked", `Intento de renovacion bloqueado por estatus ${licenseState}`);
      setNotice(t.renewalBlocked);
      return;
    }
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
    setDraftPlan(renewed.plan);
    addAuditEvent(renewed.name, "license.renewal", `Nueva licencia v${renewed.licenseVersion}: ${renewed.licenseStart} - ${renewed.licenseEnd}`);
    setNotice(t.renewed);
  }

  function deleteRenewal() {
    if (!selectedOrganization || selectedOrganization.licenseVersion <= 1) return;
    setOrganizations((current) => current.map((organization) => organization.id === selectedOrganization.id ? {
      ...organization,
      status: "borrado_logico",
      lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
      notes: `${organization.notes}\nRenovacion cancelada por Super Admin.`,
    } : organization));
    addAuditEvent(selectedOrganization.name, "license.renewal.cancelled", `Renovacion v${selectedOrganization.licenseVersion} marcada como borrado_logico`);
    setNotice(t.renewalDeleted);
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

  function hardDeleteOrganization() {
    if (!selectedOrganization) return;
    if (!canHardDeleteOrganization(selectedOrganization, organizations, auditEvents)) {
      setNotice(t.hardDeleteBlocked);
      return;
    }
    setOrganizations((current) => current.filter((organization) => organization.id !== selectedOrganization.id));
    setSelectedId("");
    setNotice(t.hardDeleted);
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-5xl text-lg leading-8 text-slate-600">{t.description}</p>
        <p className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-bold leading-6 text-purple-900">{t.rule}</p>
      </header>

      {searchMode !== "capture" ? (
        <>
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xl font-black text-slate-950">{t.edit}</h2>
            <p className="mb-4 text-sm font-semibold text-slate-500">{t.searchModeEditHelp}</p>
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
                  {statusOptions.map((status) => <option key={status} value={status}>{statusLabel(status, language)}</option>)}
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
              <table className="w-full min-w-[1440px] text-left text-sm">
                <thead className="sticky top-0 z-10"><tr>{t.columns.map((column) => <Th key={column}>{column}</Th>)}</tr></thead>
                <tbody>
                  {filteredOrganizations.map((organization) => (
                    <tr key={organization.id} className={`border-b border-slate-100 last:border-0 ${selectedId === organization.id ? "bg-[var(--brand-primary-soft)]" : ""}`}>
                      <Td><input type="radio" name="selected-organization" checked={selectedId === organization.id} onChange={() => selectOrganizationForMaintenance(organization)} /></Td>
                      <Td><strong className="block text-slate-950">{organization.name}</strong><span className="text-xs text-slate-500">{organization.legalName || organization.taxId}</span></Td>
                      <Td><Pill>{t.types[organization.type]}</Pill></Td>
                      <Td>{organization.legalRepresentative}</Td>
                      <Td><strong className="block text-slate-700">{organization.contactName}</strong><span className="text-xs text-slate-500">{organization.contactEmail}</span></Td>
                      <Td>{organization.city}, {organization.state}</Td>
                      <Td>
                        <strong>v{organization.licenseVersion}</strong>
                        <span className="block text-xs text-slate-500">{organization.licenseStart || "-"} - {organization.licenseEnd || "-"}</span>
                        <span className="mt-1 inline-block"><Pill>{getLicenseState(organization)}</Pill></span>
                      </Td>
                      <Td>{organization.plan}<span className="block text-xs text-slate-500">{organization.type === "outplacement_company" ? outplacementServiceDurationLabel(organization.plan, language) : contractMonthsLabel(organization.contractTermMonths, language)}</span></Td>
                      <Td>{formatCurrency(organization.contractValue, language)}</Td>
                      <Td>{contractCreditsLabel(organization, language)}</Td>
                      <Td>{organization.type === "coach_partner" ? coachPartnerCapacityLabel(organization.plan, language) : `${organization.outplacementCampaigns} ${language === "es" ? "campañas" : "campaigns"}`}</Td>
                      <Td>{organization.internalOwner}</Td>
                      <Td><Pill>{statusLabel(organization.status, language)}</Pill></Td>
                      <Td>{organization.lastChange}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">{notice}</div> : null}

      <form key={selectedOrganization?.id ?? "new-organization"} action={saveOrganization} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{t.formTitle}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedOrganization ? `${t.selected}: ${selectedOrganization.name}` : t.noSelected}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]" onClick={createNew}><UserPlus size={17} />{t.create}</Button>
            <Button type="button" className="gap-2 bg-slate-950 text-white hover:bg-slate-800" onClick={() => { setSearchMode("edit"); setNotice(""); }}><Edit3 size={17} />{t.edit}</Button>
            <Button type="submit" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"><Save size={17} />{t.save}</Button>
            <Button type="button" disabled={!selectedOrganization} className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={renewLicense}>{t.renew}</Button>
            <Button type="button" disabled={!selectedOrganization || selectedOrganization.licenseVersion <= 1} className="gap-2 bg-orange-600 text-white hover:bg-orange-700" onClick={deleteRenewal}>{t.deleteRenewal}</Button>
            <Button type="button" disabled={!selectedOrganization} className="gap-2 bg-amber-500 text-white hover:bg-amber-600" onClick={extendGracePeriod}>{t.extendGrace}</Button>
            {selectedOrganization ? <Button type="button" className="gap-2 bg-red-600 text-white hover:bg-red-700" onClick={hardDeleteOrganization}><Trash2 size={17} />{t.deleteLogical}</Button> : null}
          </div>
        </div>

        <section className="mb-5 rounded-[1.25rem] border border-purple-100 bg-purple-50 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t.currentLicense}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">v{selectedOrganization?.licenseVersion ?? 1}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t.licenseStart}</p>
              <p className="mt-1 font-black text-slate-900">{selectedOrganization?.licenseStart || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t.licenseEnd}</p>
              <p className="mt-1 font-black text-slate-900">{selectedOrganization?.licenseEnd || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t.licenseStatus}</p>
              <p className="mt-2"><Pill>{selectedLicenseState ?? (language === "es" ? "sin seleccion" : "not selected")}</Pill></p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-3">
          <FormGroup title={t.identity} icon={<Building2 size={18} />}>
            <Field label={t.type}><Select name="type" value={draftType} onChange={(event) => {
              const nextType = event.target.value as OrganizationType;
              setDraftType(nextType);
              setDraftPlan(nextType === "coach_partner" ? "Coach Starter" : outplacementServices[0]);
            }}>{Object.entries(t.types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></Field>
            <Field label={t.commercialName}><Input name="name" defaultValue={selectedOrganization?.name ?? ""} /></Field>
            <Field label={t.legalName}><Input name="legalName" defaultValue={selectedOrganization?.legalName ?? ""} /></Field>
            <Field label={t.taxId}><Input name="taxId" defaultValue={selectedOrganization?.taxId ?? ""} /></Field>
            <Field label={t.status}><Select name="status" defaultValue={selectedOrganization?.status ?? "activo"}>{statusOptions.map((status) => <option key={status} value={status}>{statusLabel(status, language)}</option>)}</Select></Field>
          </FormGroup>

          <FormGroup title={t.contact} icon={<Building2 size={18} />}>
            <Field label={t.contactName}><Input name="contactName" defaultValue={selectedOrganization?.contactName ?? ""} /></Field>
            <Field label={t.contactEmail}><Input name="contactEmail" type="email" defaultValue={selectedOrganization?.contactEmail ?? ""} /></Field>
            <Field label={t.contactPhone}><Input name="contactPhone" defaultValue={selectedOrganization?.contactPhone ?? ""} /></Field>
            <Field label={t.legalRepresentative}><Input name="legalRepresentative" defaultValue={selectedOrganization?.legalRepresentative ?? ""} placeholder={language === "es" ? "Nombre del representante legal del contrato" : "Contract legal representative name"} /></Field>
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
                <Select name="plan" value={draftPlan} onChange={(event) => setDraftPlan(event.target.value)}>
                  {(draftType === "coach_partner" ? coachPartnerPlans : outplacementServices).map((plan) => <option key={plan}>{plan}</option>)}
                </Select>
              </Field>
              <Field label={t.credits}>
                <div className="rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-black text-slate-950">
                  {draftType === "coach_partner" ? formatCredits(calculateCoachPartnerOrganizationCredits(draftPlan), language) : (language === "es" ? "Variable por campana" : "Variable by campaign")}
                  <small className="mt-1 block font-semibold text-slate-500">{t.creditsHelp}</small>
                </div>
                <input type="hidden" name="credits" value={draftType === "coach_partner" ? calculateCoachPartnerOrganizationCredits(draftPlan) : 0} />
              </Field>
              {draftType === "coach_partner" ? <CoachPartnerCreditSummary plan={draftPlan} language={language} t={t} /> : null}
              {draftType === "coach_partner" ? (
                <Field label={t.contractTerm}><Select name="contractTermMonths" defaultValue={String(selectedOrganization?.contractTermMonths ?? 6)}>{contractTermOptions.map((months) => <option key={months} value={months}>{contractMonthsLabel(months, language)}</option>)}</Select></Field>
              ) : (
                <Field label={t.serviceDuration}>
                  <div className="rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-black text-slate-950">
                    {outplacementServiceDurationLabel(draftPlan, language)}
                    <small className="mt-1 block font-semibold text-slate-500">{language === "es" ? "Los ex-empleados conservan acceso durante esta duracion; despues pasan a usuario normal con compra de creditos." : "Former employees keep access during this duration; afterwards they move to a normal credit-purchase user."}</small>
                  </div>
                  <input type="hidden" name="contractTermMonths" value={outplacementServiceMonths(draftPlan)} />
                </Field>
              )}
              <Field label={t.contractValue}>
                <Input name="contractValue" type="number" min={0} step={1000} defaultValue={selectedOrganization?.contractValue ?? 0} />
                <small className="mt-1 block text-xs font-semibold text-slate-500">{t.contractValueHelp}</small>
              </Field>
              <Field label={t.licenseStart}><Input name="licenseStart" type="date" value={draftLicenseStart} onChange={(event) => setDraftLicenseStart(event.target.value)} /></Field>
              <Field label={t.licenseEnd}><Input name="licenseEnd" type="date" defaultValue={selectedOrganization?.licenseEnd ?? ""} /></Field>
              <Field label={t.gracePeriod}><Input name="gracePeriodDays" type="number" min={0} value={draftGracePeriodDays} onChange={(event) => setDraftGracePeriodDays(Number(event.target.value || 0))} /></Field>
              <Field label={t.graceUntil}>
                <Input name="graceUntil" type="date" value={calculatedGraceUntil} readOnly />
                <small className="mt-1 block text-xs font-semibold text-slate-500">{language === "es" ? "Se calcula con inicio de licencia + dias naturales de gracia." : "Calculated from license start + calendar grace days."}</small>
              </Field>
              <Field label={t.licenseVersion}><Input name="licenseVersion" type="number" min={1} defaultValue={selectedOrganization?.licenseVersion ?? 1} readOnly /></Field>
              {draftType === "coach_partner" ? (
                <>
                  <Field label={t.groups}><Input name="monthlyGroups" type="number" min={0} value={capacityForCoachPartnerPlan(draftPlan).groups} readOnly /></Field>
                  <Field label={t.students}><Input name="studentsPerGroup" type="number" min={0} value={capacityForCoachPartnerPlan(draftPlan).studentsPerGroup} readOnly /></Field>
                  <input type="hidden" name="outplacementCampaigns" value={selectedOrganization?.outplacementCampaigns ?? 0} />
                </>
              ) : (
                <>
                  <Field label={t.campaigns}>
                    <Input name="outplacementCampaigns" type="number" min={0} defaultValue={selectedOrganization?.outplacementCampaigns ?? 0} readOnly />
                    <small className="mt-1 block text-xs font-semibold text-slate-500">{language === "es" ? "Variable: se incrementa cuando se creen campañas asociadas al contrato." : "Variable: increases as campaigns are created under this contract."}</small>
                  </Field>
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

function CoachPartnerCreditSummary({ plan, language, t }: { plan: string; language: keyof typeof copy; t: typeof copy.es | typeof copy.en }) {
  const rule = coachPlanRuleFor(plan);
  const maxStudents = rule.unlimited ? Infinity : rule.groups * rule.studentsPerGroup;
  const studentCredits = calculateCoachPartnerStudentCredits(plan);
  const organizationCredits = calculateCoachPartnerOrganizationCredits(plan);
  const baseCredits = rule.baseCreditsPerCycle;

  return (
    <div className="md:col-span-2 rounded-2xl border border-purple-100 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t.capacity}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Metric label={t.groups} value={rule.unlimited ? unlimitedLabel(language) : String(rule.groups)} />
        <Metric label={t.maxStudents} value={rule.unlimited ? unlimitedLabel(language) : formatCredits(maxStudents, language)} />
        <Metric label={t.studentCredits} value={formatCredits(studentCredits, language)} />
        <Metric label={t.credits} value={formatCredits(organizationCredits, language)} />
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
        {rule.unlimited
          ? language === "es" ? "Coach Business opera con grupos, alumnos y creditos ilimitados segun contrato." : "Coach Business runs with unlimited groups, students, and credits according to contract."
          : language === "es"
            ? `Base por ciclo: ${formatCredits(baseCredits, language)} creditos. Bolsa de organizacion: ${rule.groups} grupos x ${rule.studentsPerGroup} alumnos x ${rule.cycles} ciclos. Bolsa por alumno: base x ${rule.studentCycles}.`
            : `Base per cycle: ${formatCredits(baseCredits, language)} credits. Organization pool: ${rule.groups} groups x ${rule.studentsPerGroup} students x ${rule.cycles} cycles. Student pool: base x ${rule.studentCycles}.`}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function coachPlanRuleFor(plan: string) {
  return coachPartnerPlanRules[plan as keyof typeof coachPartnerPlanRules] ?? coachPartnerPlanRules["Coach Starter"];
}

function calculateCoachPartnerOrganizationCredits(plan: string) {
  const rule = coachPlanRuleFor(plan);
  if (rule.unlimited) return Infinity;
  return rule.groups * rule.studentsPerGroup * rule.baseCreditsPerCycle * rule.cycles;
}

function calculateCoachPartnerStudentCredits(plan: string) {
  const rule = coachPlanRuleFor(plan);
  if (rule.unlimited) return Infinity;
  return rule.baseCreditsPerCycle * rule.studentCycles;
}

function capacityForCoachPartnerPlan(plan: string) {
  const rule = coachPlanRuleFor(plan);
  if (rule.unlimited) return { groups: 999, studentsPerGroup: 999 };
  return { groups: rule.groups, studentsPerGroup: rule.studentsPerGroup };
}

function coachPartnerCapacityLabel(plan: string, language: keyof typeof copy) {
  const rule = coachPlanRuleFor(plan);
  if (rule.unlimited) return unlimitedLabel(language);
  return `${rule.groups} x ${rule.studentsPerGroup}`;
}

function formatCredits(value: number, language: keyof typeof copy) {
  if (!Number.isFinite(value)) return unlimitedLabel(language);
  return new Intl.NumberFormat(language === "es" ? "es-MX" : "en-US").format(value);
}

function contractCreditsLabel(organization: OrganizationRecord, language: keyof typeof copy) {
  if (organization.type === "outplacement_company") return formatCredits(organization.credits, language);
  return formatCredits(organization.credits, language);
}

function canCreateOrganization(role: DemoAdminRole) {
  return ["Super Admin", "Apoyo administrativo", "Operativo outplacement", "Supervisor delegado temporal"].includes(role);
}

function sameCoachPartnerIdentity(organization: OrganizationRecord, name: string, legalName: string, taxId: string) {
  const normalizedName = name.trim().toLowerCase();
  const normalizedLegalName = legalName.trim().toLowerCase();
  const normalizedTaxId = taxId.trim().toLowerCase();
  return organization.name.trim().toLowerCase() === normalizedName
    || organization.legalName.trim().toLowerCase() === normalizedLegalName
    || organization.taxId.trim().toLowerCase() === normalizedTaxId;
}

function canHardDeleteOrganization(organization: OrganizationRecord, organizations: OrganizationRecord[], auditEvents: OrganizationAuditEvent[]) {
  const hasRenewals = organizations.some((candidate) => candidate.id !== organization.id && candidate.name === organization.name);
  const hasAuditHistory = auditEvents.some((event) => event.organizationName === organization.name);
  const hasLicenseHistory = organization.licenseVersion > 1 || Boolean(organization.licenseStart || organization.licenseEnd);
  const hasActiveLicense = getLicenseState(organization) === "vigente" || getLicenseState(organization) === "gracia";
  return !hasRenewals && !hasAuditHistory && !hasLicenseHistory && !hasActiveLicense;
}

function outplacementServiceRuleFor(plan: string) {
  return outplacementServiceRules[plan as keyof typeof outplacementServiceRules] ?? outplacementServiceRules["Salida digna"];
}

function outplacementServiceDurationLabel(plan: string, language: keyof typeof copy) {
  const rule = outplacementServiceRuleFor(plan);
  return language === "es" ? rule.durationEs : rule.durationEn;
}

function outplacementServiceMonths(plan: string) {
  const rule = outplacementServiceRuleFor(plan);
  return Math.max(1, Math.round(rule.days / 30));
}

function contractMonthsLabel(months: number, language: keyof typeof copy) {
  return language === "es" ? `${months} meses` : `${months} months`;
}

function formatCurrency(value: number, language: keyof typeof copy) {
  return new Intl.NumberFormat(language === "es" ? "es-MX" : "en-US", {
    currency: language === "es" ? "MXN" : "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value || 0);
}

function statusLabel(status: string, language: keyof typeof copy) {
  const labels = {
    es: {
      activo: "activo",
      pendiente: "pendiente",
      bloqueado: "bloqueado",
      borrado_logico: "borrado lógico",
    },
    en: {
      activo: "active",
      pendiente: "pending",
      bloqueado: "blocked",
      borrado_logico: "logical delete",
    },
  } as const;
  return labels[language][status as keyof typeof labels.es] ?? status;
}

function unlimitedLabel(language: keyof typeof copy) {
  return language === "es" ? "Ilimitado" : "Unlimited";
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function calculateGraceUntil(licenseStart: string, gracePeriodDays: number) {
  if (!licenseStart || !Number.isFinite(gracePeriodDays) || gracePeriodDays <= 0) return "";
  return addDays(licenseStart, gracePeriodDays);
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

function getLicenseState(organization: OrganizationRecord) {
  if (organization.status === "borrado_logico") return "cancelada";
  const today = todayInputValue();
  if (organization.licenseEnd && today <= organization.licenseEnd) return "vigente";
  if (organization.graceUntil && today <= organization.graceUntil) return "gracia";
  return "vencida";
}

