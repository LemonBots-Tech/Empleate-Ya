"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Building2, FileText, KeyRound, Mail, Printer, Save, Search, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { skillRegistry, type SkillId } from "@/ai/skillRegistry";
import { adminSections } from "./AdminSuperShell";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export type AdminUserKind = "online" | "super-admin-support" | "coach-partner" | "student" | "outplacement-rh" | "outplacement-employee" | "internal-coach";
type CoachPartnerPlanKey = "starter" | "pro" | "business";
type UserPermissions = {
  avatarIds: SkillId[];
  adminMenuHrefs: string[];
  userSubmenuHrefs: string[];
  coachPlanKey: CoachPartnerPlanKey;
};

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
  linkedinUrl?: string;
  salaryRange?: string;
  desiredSalaryAmount?: string;
  age?: number;
  permissions?: UserPermissions;
  extraData?: Record<string, string | boolean>;
};

type CreditAuditEvent = {
  id: string;
  userEmail: string;
  userName: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  actor: string;
  createdAt: string;
};

type UserSearchMode = "capture" | "edit" | "delete";
type BalancePeriod = "day" | "week" | "month" | "custom";
type BalanceMovement = {
  date: string;
  concept: string;
  credits: number;
  consumption: number;
};
type CoachAssignment = {
  coachEmail: string;
  kind: "group" | "campaign";
  name: string;
  startDate: string;
  endDate: string;
  modality: "online" | "presential" | "hybrid";
  nps: number;
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
      extraFields: ["Fecha de delegacion", "Fecha fin delegacion", "Supervisor responsable"],
    },
    "coach-partner": {
      title: "Coach Partner",
      description: "Alta de Coach Partners que atenderan clientes propios con la metodologia de Empleate YA. Cada Partner opera solo usuarios, grupos y alumnos de su propia organizacion.",
      profile: "Coach Partner",
      organizationLabel: "Organizacion partner",
      organizationPlaceholder: "Ej. Partner Ejecutivo Norte",
      roleLabel: "Rol partner",
      roles: ["Coach partner principal", "Coach partner colaborador"],
      extraFields: ["Licencia", "Fecha inicio licencia", "Fecha vigencia licencia"],
    },
    "outplacement-rh": {
      title: "Outplacement",
      description: "Administradores RH y apoyos de empresas cliente. Solo operan usuarios de outplacement, cursos, ex-empleados, campanas y reportes de su propia organizacion.",
      profile: "Outplacement",
      organizationLabel: "Empresa cliente",
      organizationPlaceholder: "Ej. Empresa Demo Outplacement",
      roleLabel: "Rol en empresa",
      roles: ["Administrador RH", "Apoyo administrativo RH", "Coach de outplacement", "Aprobador de Campaña"],
      extraFields: ["Campana asignada", "Puede aprobar campañas", "Inicio vigencia aprobador", "Fin vigencia aprobador"],
    },
    student: {
      title: "Alumnos",
      description: "Alta de alumnos asignados a grupos de Coach Partner o coaching interno 1o1. Primero debe existir la organizacion y el coach responsable.",
      profile: "Alumno",
      organizationLabel: "Organizacion del coach",
      organizationPlaceholder: "Ej. Partner Ejecutivo Norte / Empleate YA",
      roleLabel: "Tipo de alumno",
      roles: ["Alumno Coach Partner", "Alumno coaching 1o1", "Alumno curso online"],
      extraFields: ["Grupo asignado", "Coach responsable", "Fecha inicio grupo"],
    },
    "outplacement-employee": {
      title: "Ex-empleados outplacement",
      description: "Alta de ex-empleados autorizados por una empresa cliente y asignados a una campana de outplacement.",
      profile: "Ex-empleado outplacement",
      organizationLabel: "Empresa outplacement",
      organizationPlaceholder: "Ej. Empresa Demo Outplacement",
      roleLabel: "Estatus participante",
      roles: ["Participante autorizado", "Participante en seguimiento", "Participante cerrado"],
      extraFields: ["Campana asignada", "Administrador RH representante", "Fecha autorizacion"],
    },
    "internal-coach": {
      title: "Coach interno 1o1 de Empleate YA",
      description: "Alta de coaches internos para sesiones 1o1, cursos, notas, NPS, feedback y mentorias asignables a campanas de outplacement.",
      profile: "Coach interno 1o1",
      organizationLabel: "Unidad de servicio",
      organizationPlaceholder: "Ej. Coaching 1o1 / cursos online",
      roleLabel: "Especialidad del coach",
      roles: ["Coach empleabilidad", "Coach ejecutivo", "Coach entrevistas", "Coach CV estrategico", "Coach LinkedIn"],
      extraFields: [],
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
      extraFields: ["Delegation start date", "Delegation end date", "Responsible supervisor"],
    },
    "coach-partner": {
      title: "Coach Partner",
      description: "Create Coach Partners who will serve their own clients with the Empleate YA methodology. Each Partner operates only users, groups, and students from their own organization.",
      profile: "Coach Partner",
      organizationLabel: "Partner organization",
      organizationPlaceholder: "Example: Executive North Partner",
      roleLabel: "Partner role",
      roles: ["Main coach partner", "Coach partner collaborator"],
      extraFields: ["License", "License start date", "License end date"],
    },
    "outplacement-rh": {
      title: "Outplacement",
      description: "HR admins and support users from client companies. They only manage outplacement users, courses, former employees, campaigns, and reports for their own organization.",
      profile: "Outplacement",
      organizationLabel: "Client company",
      organizationPlaceholder: "Example: Demo Outplacement Company",
      roleLabel: "Company role",
      roles: ["HR Administrator", "HR administrative support", "Outplacement coach", "Campaign Approver"],
      extraFields: ["Assigned campaign", "Can approve campaigns", "Approver assignment start", "Approver assignment end"],
    },
    student: {
      title: "Students",
      description: "Create students assigned to Coach Partner groups or internal 1:1 coaching. The organization and responsible coach must exist first.",
      profile: "Student",
      organizationLabel: "Coach organization",
      organizationPlaceholder: "Example: Executive North Partner / Empleate YA",
      roleLabel: "Student type",
      roles: ["Coach Partner student", "1:1 coaching student", "Online course student"],
      extraFields: ["Assigned group", "Responsible coach", "Group start date"],
    },
    "outplacement-employee": {
      title: "Outplacement former employees",
      description: "Create former employees authorized by a client company and assigned to an outplacement campaign.",
      profile: "Outplacement former employee",
      organizationLabel: "Outplacement company",
      organizationPlaceholder: "Example: Demo Outplacement Company",
      roleLabel: "Participant status",
      roles: ["Authorized participant", "Participant in follow-up", "Closed participant"],
      extraFields: ["Assigned campaign", "HR admin representative", "Authorization date"],
    },
    "internal-coach": {
      title: "Internal 1:1 coach",
      description: "Create internal coaches for 1:1 sessions, courses, notes, NPS, feedback, and mentorship assignments in outplacement campaigns.",
      profile: "Internal 1:1 Coach",
      organizationLabel: "Service unit",
      organizationPlaceholder: "Example: 1:1 Coaching / online courses",
      roleLabel: "Coach specialty",
      roles: ["Employability coach", "Executive coach", "Interview coach", "Strategic resume coach", "LinkedIn coach"],
      extraFields: [],
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
    edit: "Buscar usuario",
    balance: "Movimientos / balance",
    balanceDisabledHelp: "Selecciona primero un usuario online para consultar su balance.",
    saveData: "Guardar datos",
    deleteLogical: "Buscar usuario",
    confirmDelete: "Confirmar borrado logico",
    searchModeEditHelp: "Busca y selecciona un usuario. Al elegirlo regresaras a captura para editar estado, datos, creditos o permisos y guardar cambios.",
    searchModeDeleteHelp: "Busca y selecciona un usuario. Al elegirlo regresaras a captura para editar estado, datos, creditos o permisos y guardar cambios.",
    selectedForEdit: "Usuario seleccionado. Edita lo necesario y presiona Guardar datos.",
    selectedForDelete: "Usuario seleccionado. Revisa el registro y confirma el borrado logico si corresponde.",
    savedDataMessage: "Datos del usuario guardados en la tabla correspondiente.",
    permissionsAssignedMessage: "Permisos recalculados y asignados segun la especialidad seleccionada.",
    savedPermissionsMessage: "Permisos guardados. Regresaste a captura y mantenimiento del usuario.",
    logicalDeleteMessage: "El usuario seleccionado paso a estado borrado lógico. No se elimino definitivamente.",
    protectedPrincipalDeleteMessage: "Solo Super Admin puede dar de baja logica al rol principal de una organizacion.",
    duplicatePrincipalMessage: "Ya existe un rol principal activo para esta organizacion. Primero debe darse de baja logica el principal activo y despues crear el nuevo.",
    unauthorizedPrincipalCreateMessage: "Solo Super Admin o apoyos autorizados pueden dar de alta un Coach partner principal o Administrador RH.",
    requiredOnlineMessage: "Nombre completo y correo son obligatorios para crear o editar un usuario online.",
    requiredSupportMessage: "Nombre completo, telefono y correo son obligatorios para crear o editar un apoyo Super Admin.",
    requiredInternalCoachMessage: "Nombre completo, telefono y correo son obligatorios para crear o editar un Coach interno 1o1.",
    requiredCoachPartnerMessage: "Nombre completo, telefono y correo son obligatorios para crear o editar un Coach Partner.",
    delegationExistingUserMessage: "La delegacion temporal solo puede asignarse a un usuario de apoyo ya creado. Primero crea el apoyo con su rol base y despues asigna la delegacion.",
    delegationPasswordMessage: "Para guardar fechas de delegacion, un Super Admin o supervisor delegado vigente debe autorizar con su password.",
    delegationDateMessage: "Captura fecha de delegacion y fecha fin de delegacion para habilitar la supervision temporal.",
    delegationPasswordLabel: "Password de autorizacion Super Admin",
    delegationPasswordHelp: "Demo temporal: usa admin-demo. En produccion se validara contra login real.",
    delegationExpiredMessage: "La delegacion esta fuera de vigencia; el usuario conserva su rol base y pierde facultades de Super Admin.",
    duplicateOnlineNameMessage: "Ya existe un usuario online con ese nombre. Corrige el nombre antes de guardar.",
    onlineSupportPaidTypeMessage: "Los apoyos a Super Admin solo pueden crear usuarios online como Prospecto online. Cliente Online Pagado se asigna por Super Admin o por compra Stripe.",
    onlineProspectCreditMessage: "No se pueden modificar creditos manualmente a un Prospecto online. Solo aplica para Cliente Online Pagado.",
    protectedStatusRestoreMessage: "Solo Super Admin puede cambiar un usuario desde borrado logico o bloqueado hacia otro estado.",
    creditAdjustmentMessage: "Movimiento manual de creditos registrado en bitacora.",
    alertTitle: "Atencion",
    alertAccept: "Aceptar",
    balanceEmailMessage: "Balance preparado para enviarse al correo del cliente con PDF adjunto.",
    balanceTitle: "Estado de cuenta de creditos",
    balanceDescription: "Consulta movimientos desde la creacion del usuario y genera un preview para imprimir, PDF o envio por correo.",
    balancePeriod: "Periodo a consultar",
    balanceDay: "Dia",
    balanceWeek: "Semana",
    balanceMonth: "Mes",
    balanceCustom: "Periodo personalizado",
    balanceStart: "Fecha inicial",
    balanceEnd: "Fecha final",
    balancePreview: "Preview del balance",
    balanceGeneralData: "Datos generales",
    balancePrint: "Imprimir",
    balancePdf: "PDF",
    balanceEmail: "Enviar por email",
    balanceFinal: "Balance final",
    balanceColumns: ["Fecha", "Concepto", "Creditos", "Consumos"],
    balanceDefaultConcept: "Creditos de prueba default",
    selected: "Seleccionado",
    noSelected: "Selecciona un usuario existente para editar o borrar logicamente.",
    name: "Nombre completo",
    email: "Correo",
    phone: "Telefono",
    organization: "Organizacion",
    role: "Rol",
    statusLabel: "Estado",
    credits: "Creditos / bolsa inicial",
    creditsHelp: "Solo Super Admin o supervisor delegado temporal pueden mover manualmente la bolsa de un Cliente Online Pagado. Cada aumento o disminucion queda en bitacora.",
    careerData: "Datos profesionales",
    age: "Edad",
    ageHelp: "Dato profesional visible para administracion y reportes internos; ayuda a personalizar recomendaciones sin fomentar sesgos.",
    linkedinUrl: "URL de LinkedIn",
    noLinkedin: "No tengo perfil de LinkedIn",
    salaryRange: "Rango salarial",
    desiredSalaryAmount: "Salario mensual deseado",
    desiredSalaryHelp: "Monto puntual que desea pedir segun experiencia y aptitudes.",
    loginEligibility: "Regla de login",
    loginEligibilityHelp: "Alumnos y ex-empleados primero deben existir en un grupo o campana autorizada. Despues pueden iniciar sesion con el usuario creado por RH, Coach Partner o coach responsable.",
    creditAuditTitle: "Bitacora de movimientos manuales de creditos",
    creditAuditEmpty: "Aun no hay ajustes manuales de creditos en esta sesion.",
    owner: "Responsable interno",
    ownerHelp: "Solo el Super Admin puede modificar esta asignacion. Los nuevos usuarios se reparten aleatoriamente entre Super Admin y usuarios de apoyo.",
    orgHelp: "Para empresas de outplacement y coach partners, la organizacion viene del catalogo administrado por Super Admin o apoyos de Super Admin.",
    privacyAccepted: "Acepto privacidad",
    privacyReadonly: "Solo el usuario online lo modifica al aceptar el aviso en login. Administracion solo lo consulta.",
    stripeReadonly: "Dato de solo lectura. Lo genera Stripe cuando el usuario compra creditos en linea.",
    permissions: "Permisos",
    currentPermissions: "Permisos actuales",
    assignedAvatars: "Avatares asignados",
    assignedMenu: "Menu asignado",
    permissionsTitle: "Permisos y limites de acceso",
    permissionsHelp: "Configura avatares, opciones del menu lateral y submenus disponibles para este perfil. El consumo real se descuenta contra la bolsa de creditos correspondiente.",
    supportRolePolicy: "Regla de rol",
    supportRolePolicyHelp: "Los permisos iniciales se calculan por rol: cobranza opera creditos, pagos y reportes; outplacement opera empresas, campanas y ex-empleados; coach partner opera organizaciones, grupos y alumnos; supervisor delegado opera casi como Super Admin durante su vigencia, excepto crear, sustituir o borrar al Super Admin.",
    savePermissions: "Guardar permisos",
    backToCapture: "Regresar",
    avatars: "Avatares",
    adminMenu: "Menu lateral Super Admin",
    submenu: "Submenus de usuarios",
    unlimitedCredits: "Creditos ilimitados",
    unlimitedCreditsHelp: "Este perfil no descuenta de una bolsa individual de creditos para operar.",
    coachAvailabilityTitle: "Disponibilidad operativa del coach",
    coachAvailabilityHelp: "Datos calculados desde grupos, campanas y evaluaciones. Solo Super Admin podra intervenirlos manualmente cuando exista una excepcion.",
    coachAvailability: "Disponibilidad",
    coachAssigned: "Asignado",
    coachAvailable: "Disponible",
    coachDateRange: "Periodo consolidado",
    coachModality: "Modalidad",
    coachAverageNps: "NPS promedio",
    coachOutplacementMentor: "Mentor outplacement",
    coachAssignmentList: "Asignaciones activas",
    coachNoAssignments: "Sin asignaciones activas.",
    onlineRule: "Regla online",
    onlineProspectRule: "Prospecto online: solo avatares basicos una vez por avatar. Cliente Online Pagado: acceso a todos los avatares, sujeto a saldo suficiente.",
    partnerPlan: "Plan Coach Partner",
    partnerCreditPool: "Bolsa maxima mensual del Coach Partner",
    partnerStudentCredits: "Creditos por alumno del plan",
    partnerBaseCredits: "Base de creditos por ciclo",
    partnerCapacity: "Capacidad maxima",
    partnerScopeRule: "El Coach Partner solo ve su organizacion. Super Admin y apoyos autorizados pueden apoyar y ver todas las organizaciones.",
    partnerRule: "El Coach Partner principal concentra la bolsa. Colaboradores y alumnos descuentan de esa bolsa principal.",
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
    edit: "Find user",
    balance: "Movements / balance",
    balanceDisabledHelp: "Select an online user first to review their balance.",
    saveData: "Save data",
    deleteLogical: "Find user",
    confirmDelete: "Confirm logical delete",
    searchModeEditHelp: "Search and select a user. After selecting, you will return to capture to edit status, data, credits, or permissions and save changes.",
    searchModeDeleteHelp: "Search and select a user. After selecting, you will return to capture to edit status, data, credits, or permissions and save changes.",
    selectedForEdit: "User selected. Edit what is needed and press Save data.",
    selectedForDelete: "User selected. Review the record and confirm logical deletion if appropriate.",
    savedDataMessage: "User data saved in the corresponding table.",
    permissionsAssignedMessage: "Permissions were recalculated and assigned according to the selected specialty.",
    savedPermissionsMessage: "Permissions saved. You are back in user capture and maintenance.",
    logicalDeleteMessage: "The selected user was moved to logical_delete. It was not permanently deleted.",
    protectedPrincipalDeleteMessage: "Only Super Admin can logically delete the main role of an organization.",
    duplicatePrincipalMessage: "An active main role already exists for this organization. Logically delete the active main user first, then create the new one.",
    unauthorizedPrincipalCreateMessage: "Only Super Admin or authorized support users can create a main Coach Partner or HR Administrator.",
    requiredOnlineMessage: "Full name and email are required to create or edit an online user.",
    requiredSupportMessage: "Full name, phone, and email are required to create or edit a Super Admin support user.",
    requiredInternalCoachMessage: "Full name, phone, and email are required to create or edit an internal 1:1 coach.",
    requiredCoachPartnerMessage: "Full name, phone, and email are required to create or edit a Coach Partner.",
    delegationExistingUserMessage: "Temporary delegation can only be assigned to an existing support user. Create the support user with a base role first, then assign delegation.",
    delegationPasswordMessage: "To save delegation dates, a Super Admin or active delegated supervisor must authorize with their password.",
    delegationDateMessage: "Enter delegation start and end dates to enable temporary supervision.",
    delegationPasswordLabel: "Super Admin authorization password",
    delegationPasswordHelp: "Temporary demo: use admin-demo. Production will validate real login.",
    delegationExpiredMessage: "The delegation is outside its validity period; the user keeps their base role and loses Super Admin authority.",
    duplicateOnlineNameMessage: "An online user with that name already exists. Correct the name before saving.",
    onlineSupportPaidTypeMessage: "Super Admin support users can only create online users as Online prospect. Paid online client is assigned by Super Admin or Stripe purchase.",
    onlineProspectCreditMessage: "Manual credits cannot be changed for an Online prospect. This only applies to Paid online clients.",
    protectedStatusRestoreMessage: "Only Super Admin can move a user from logical delete or blocked into another status.",
    creditAdjustmentMessage: "Manual credit movement recorded in the audit log.",
    alertTitle: "Attention",
    alertAccept: "Accept",
    balanceEmailMessage: "Balance prepared to be emailed to the client with the PDF attached.",
    balanceTitle: "Credit statement",
    balanceDescription: "Review movements since the user was created and generate a preview for print, PDF, or email delivery.",
    balancePeriod: "Period to review",
    balanceDay: "Day",
    balanceWeek: "Week",
    balanceMonth: "Month",
    balanceCustom: "Custom period",
    balanceStart: "Start date",
    balanceEnd: "End date",
    balancePreview: "Balance preview",
    balanceGeneralData: "General data",
    balancePrint: "Print",
    balancePdf: "PDF",
    balanceEmail: "Email",
    balanceFinal: "Final balance",
    balanceColumns: ["Date", "Concept", "Credits", "Consumption"],
    balanceDefaultConcept: "Default trial credits",
    selected: "Selected",
    noSelected: "Select an existing user to edit or logically delete.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    organization: "Organization",
    role: "Role",
    statusLabel: "Status",
    credits: "Credits / initial pool",
    creditsHelp: "Only Super Admin or a temporary delegated supervisor can manually move the credit pool of a Paid online client. Every increase or decrease is logged.",
    careerData: "Professional data",
    age: "Age",
    ageHelp: "Professional data visible for administration and internal reports; helps personalize recommendations without encouraging bias.",
    linkedinUrl: "LinkedIn URL",
    noLinkedin: "I do not have a LinkedIn profile",
    salaryRange: "Salary range",
    desiredSalaryAmount: "Desired monthly salary",
    desiredSalaryHelp: "Specific amount the user wants to request based on experience and skills.",
    loginEligibility: "Login rule",
    loginEligibilityHelp: "Students and former employees must first exist in an authorized group or campaign. Then they can sign in with the user created by HR, Coach Partner, or the responsible coach.",
    creditAuditTitle: "Manual credit movement audit log",
    creditAuditEmpty: "There are no manual credit adjustments in this session yet.",
    owner: "Internal owner",
    ownerHelp: "Only the Super Admin can modify this assignment. New users are distributed randomly among Super Admin and support users.",
    orgHelp: "For outplacement companies and coach partners, the organization comes from the organization catalog managed by Super Admin or Super Admin support users.",
    privacyAccepted: "Privacy accepted",
    privacyReadonly: "Only the online user changes this by accepting the notice during login. Administration only reviews it.",
    stripeReadonly: "Read-only field. Stripe provides it when the user buys credits online.",
    permissions: "Permissions",
    currentPermissions: "Current permissions",
    assignedAvatars: "Assigned avatars",
    assignedMenu: "Assigned menu",
    permissionsTitle: "Access permissions and limits",
    permissionsHelp: "Configure avatars, left-side menu options, and user submenus available for this profile. Actual usage is deducted from the corresponding credit pool.",
    supportRolePolicy: "Role rule",
    supportRolePolicyHelp: "Initial permissions are calculated by role: collections manages credits, payments, and reports; outplacement manages companies, campaigns, and former employees; coach partner support manages organizations, groups, and students; delegated supervisor operates almost like Super Admin during the delegation window, except creating, replacing, or deleting the Super Admin.",
    savePermissions: "Save permissions",
    backToCapture: "Back",
    avatars: "Avatars",
    adminMenu: "Super Admin side menu",
    submenu: "User submenus",
    unlimitedCredits: "Unlimited credits",
    unlimitedCreditsHelp: "This profile does not deduct from an individual credit pool to operate.",
    coachAvailabilityTitle: "Coach operating availability",
    coachAvailabilityHelp: "Calculated from groups, campaigns, and evaluations. Only the Super Admin may manually intervene when an exception exists.",
    coachAvailability: "Availability",
    coachAssigned: "Assigned",
    coachAvailable: "Available",
    coachDateRange: "Consolidated period",
    coachModality: "Modality",
    coachAverageNps: "Average NPS",
    coachOutplacementMentor: "Outplacement mentor",
    coachAssignmentList: "Active assignments",
    coachNoAssignments: "No active assignments.",
    onlineRule: "Online rule",
    onlineProspectRule: "Online prospect: basic avatars only, once per avatar. Paid online client: all avatars, subject to enough credit balance.",
    partnerPlan: "Coach Partner plan",
    partnerCreditPool: "Monthly Coach Partner credit pool",
    partnerStudentCredits: "Student credits in this plan",
    partnerBaseCredits: "Base credits per cycle",
    partnerCapacity: "Maximum capacity",
    partnerScopeRule: "The Coach Partner only sees their own organization. Super Admin and authorized support users can help and view all organizations.",
    partnerRule: "The main Coach Partner holds the main pool. Collaborators and students deduct from that main pool.",
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
  },
  en: {
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
  },
} as const;

const internalOwners = ["Leo Galvez - Super Admin", "Daniela Ponce - Apoyo cobranza", "Ricardo Vega - Operativo outplacement", "Valeria Nunez - Apoyo administrativo", "Monica Reyes - Supervisor delegado temporal"] as const;
const empleateYaOrganization = "Empleate YA";
const adminUsersStorageKey = "empleate-ya-admin-users-v3";
const adminCreditAuditStorageKey = "empleate-ya-admin-credit-audit-v1";
const profileStorageKey = "empleate-ya-nav-profile";
const roleStorageKey = "empleate-ya-nav-role";
const onlineBaselineCredits = 150;
const onlineBasicAvatarIds: SkillId[] = ["lumo", "recharge", "scorex", "mr_ikigai", "new_job_challenge", "mr_wow"];
const linkedInVisualAvatarIds: SkillId[] = ["mr_boost_linked", "tommy_lee_picture"];
const coachStarterAvatarIds: SkillId[] = ["scorex", "optim", "mr_wow", ...linkedInVisualAvatarIds];
const coachProAvatarIds: SkillId[] = [...coachStarterAvatarIds, "lumo", "boost_me", "new_job_challenge", "miss_quest"];
const internalCoachAvatarProfiles: Array<{ match: string[]; avatarIds: SkillId[] }> = [
  { match: ["linkedin"], avatarIds: ["mr_boost_linked", "tommy_lee_picture"] },
  { match: ["entrevista", "interview"], avatarIds: ["new_job_challenge", "indiana_jobs", "miss_quest", "mr_wow"] },
  { match: ["cv estrategico", "strategic resume"], avatarIds: ["scorex", "scorex_360", "optim"] },
  { match: ["ejecutivo", "executive"], avatarIds: ["recharge", "boost_me", "clio", "mr_ikigai", "lumo"] },
  { match: ["empleabilidad", "employability"], avatarIds: [] },
];
const allAvatarIds = Object.keys(skillRegistry) as SkillId[];
const userSubmenuPermissions = [
  "/admin/users/online",
  "/admin/users/super-admin-support",
  "/admin/users/internal-coach",
  "/admin/users/coach-partner",
  "/admin/users/outplacement-rh",
] as const;

const coachPartnerPlans = {
  starter: { label: "Coach Starter", avatarIds: coachStarterAvatarIds, baseCreditsPerCycle: 1890, groups: 4, studentsPerGroup: 5, cycles: 3, studentCycles: 2, unlimited: false },
  pro: { label: "Coach Pro", avatarIds: coachProAvatarIds, baseCreditsPerCycle: 2300, groups: 12, studentsPerGroup: 5, cycles: 3, studentCycles: 2, unlimited: false },
  business: { label: "Coach Business", avatarIds: allAvatarIds, baseCreditsPerCycle: Infinity, groups: Infinity, studentsPerGroup: Infinity, cycles: Infinity, studentCycles: Infinity, unlimited: true },
} as const;

const coachPartnerOrganizationLicenses: Record<string, { licenseNumber: string; licenseStart: string; licenseEnd: string; planKey: CoachPartnerPlanKey }> = {
  "Partner Ejecutivo Norte": { licenseNumber: "CP-2026-001-v1", licenseStart: "2026-06-01", licenseEnd: "2026-12-01", planKey: "starter" },
  "Partner Bajio": { licenseNumber: "CP-2026-002-v1", licenseStart: "2026-06-01", licenseEnd: "2027-06-01", planKey: "pro" },
  "Partner Ejecutivo CDMX": { licenseNumber: "CP-2026-003-v1", licenseStart: "2026-07-01", licenseEnd: "2027-01-01", planKey: "starter" },
  "Partner Carrera Global": { licenseNumber: "CP-2026-004-v1", licenseStart: "2026-06-15", licenseEnd: "2027-06-15", planKey: "business" },
};

const organizationCatalog = {
  "coach-partner": ["Partner Ejecutivo Norte", "Partner Bajio", "Partner Ejecutivo CDMX", "Partner Carrera Global"],
  student: ["Empleate YA", "Partner Ejecutivo Norte", "Partner Bajio", "Partner Ejecutivo CDMX", "Partner Carrera Global"],
  "outplacement-rh": ["Empresa Demo Outplacement", "Grupo Industrial Norte", "Servicios Financieros Delta", "Retail Nacional"],
  "outplacement-employee": ["Empresa Demo Outplacement", "Grupo Industrial Norte", "Servicios Financieros Delta", "Retail Nacional"],
} as const;

const salaryRangeOptions = {
  es: [
    ["mxn_min_1_5", "MXN $8,500 - $12,750 mensual"],
    ["mxn_1_5_2_5", "MXN $12,751 - $21,250 mensual"],
    ["mxn_2_5_4", "MXN $21,251 - $34,000 mensual"],
    ["mxn_4_6", "MXN $34,001 - $51,000 mensual"],
    ["mxn_6_10", "MXN $51,001 - $85,000 mensual"],
    ["mxn_10_plus", "MXN $85,001+ mensual"],
  ],
  en: [
    ["usd_min_1_5", "USD $1,260 - $1,890 monthly"],
    ["usd_1_5_2_5", "USD $1,891 - $3,150 monthly"],
    ["usd_2_5_4", "USD $3,151 - $5,040 monthly"],
    ["usd_4_6", "USD $5,041 - $7,560 monthly"],
    ["usd_6_10", "USD $7,561 - $12,600 monthly"],
    ["usd_10_plus", "USD $12,601+ monthly"],
  ],
} as const;

const demoUsers: DemoUser[] = [
  { kind: "online", name: "Laura Mendez", email: "laura@email.com", organization: empleateYaOrganization, role: "Cliente Online Pagado", phone: "+52 55 1000 0001", status: "activo", credits: onlineBaselineCredits - skillRegistry.scorex.baseCredits + 500, owner: "Leo Galvez", lastChange: "12/06/2026 10:40", notes: "Compra individual Stripe. Puede ejecutar avatares segun saldo.", age: 34 },
  { kind: "online", name: "Jorge Luna", email: "jorge@email.com", organization: empleateYaOrganization, role: "Prospecto online", phone: "+52 55 1000 0006", status: "pendiente", credits: onlineBaselineCredits, owner: "Sistema", lastChange: "12/06/2026 08:20", notes: "Prueba limitada. Requiere registro para consumir mas avatares.", age: 42 },
  { kind: "super-admin-support", name: "Daniela Ponce", email: "daniela@empleateya.mx", organization: "Cobranza", role: "Apoyo cobranza", phone: "+52 55 1000 0002", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "12/06/2026 10:10", notes: "Acceso a pagos, estados de cuenta y comentarios internos." },
  { kind: "super-admin-support", name: "Ricardo Vega", email: "ricardo@empleateya.mx", organization: "Operaciones", role: "Operativo outplacement", phone: "+52 55 1000 0007", status: "invitado", credits: 0, owner: "Leo Galvez", lastChange: "12/06/2026 07:52", notes: "Apoya altas masivas y seguimiento operativo de campanas." },
  { kind: "super-admin-support", name: "Monica Reyes", email: "monica@empleateya.mx", organization: "Direccion", role: "Supervisor delegado temporal", phone: "+52 55 1000 0015", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "18/06/2026 09:00", notes: "Delegacion temporal para pruebas de facultades Super Admin.", extraData: { fecha_de_delegacion: "2026-06-01", fecha_fin_delegacion: "2026-12-31", supervisor_responsable: "Leo Galvez - Super Admin" } },
  { kind: "coach-partner", name: "Mariana Soto", email: "mariana@partner-demo.mx", organization: "Partner Ejecutivo Norte", role: "Coach partner principal", phone: "+52 55 1000 0003", status: "activo", credits: calculateCoachPartnerPool(coachPartnerPlans.starter), owner: "Leo Galvez", lastChange: "11/06/2026 17:20", notes: "Licencia activa tomada de la organizacion. Administra clientes propios.", permissions: defaultPermissionsFor("coach-partner", "Coach partner principal", "starter") },
  { kind: "coach-partner", name: "Hector Ramos", email: "hector@partner-demo.mx", organization: "Partner Bajio", role: "Coach partner colaborador", phone: "+52 55 1000 0008", status: "pendiente", credits: calculateCoachPartnerPool(coachPartnerPlans.pro), owner: "Mariana Soto", lastChange: "11/06/2026 12:35", notes: "Pendiente completar curso online de metodologia.", permissions: defaultPermissionsFor("coach-partner", "Coach partner colaborador", "pro") },
  { kind: "student", name: "Fernanda Rios", email: "fernanda@alumno-demo.mx", organization: "Partner Ejecutivo Norte", role: "Alumno Coach Partner", phone: "+52 55 1000 0011", status: "activo", credits: calculateCoachPartnerStudentCredits(coachPartnerPlans.starter), owner: "Mariana Soto", lastChange: "12/06/2026 11:05", notes: "Asignada al grupo CV Estrategico Norte. Descuenta de bolsa del Coach Partner responsable." },
  { kind: "student", name: "Roberto Salas", email: "roberto@coaching-demo.mx", organization: "Empleate YA", role: "Alumno coaching 1o1", phone: "+52 55 1000 0012", status: "pendiente", credits: 1545, owner: "Sofia Rivera", lastChange: "12/06/2026 11:12", notes: "Pendiente asignar calendario de sesiones 1o1." },
  { kind: "outplacement-rh", name: "Ana Torres", email: "ana@empresa-demo.mx", organization: "Empresa Demo Outplacement", role: "Administrador RH", phone: "+52 55 1000 0004", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "12/06/2026 09:15", notes: "Puede crear y aprobar campanas, cursos y revisar avance de ex-colaboradores autorizados.", permissions: defaultPermissionsFor("outplacement-rh", "Administrador RH", "starter") },
  { kind: "outplacement-rh", name: "Carlos Ibarra", email: "carlos@empresa-demo.mx", organization: "Empresa Demo Outplacement", role: "Coach de outplacement", phone: "+52 55 1000 0009", status: "activo", credits: calculateOutplacementRoleCredits("Coach de outplacement"), owner: "Ana Torres", lastChange: "10/06/2026 18:02", notes: "Puede crear cursos, campanas y dar seguimiento, pero no aprobar campanas.", permissions: defaultPermissionsFor("outplacement-rh", "Coach de outplacement", "starter") },
  { kind: "outplacement-employee", name: "Miguel Herrera", email: "miguel@exempleado-demo.mx", organization: "Empresa Demo Outplacement", role: "Participante autorizado", phone: "+52 55 1000 0013", status: "activo", credits: 1545, owner: "Ana Torres", lastChange: "12/06/2026 11:18", notes: "Asignado a campana Outplacement Junio 2026. Representante legal: Administrador RH de la empresa." },
  { kind: "outplacement-employee", name: "Paola Castillo", email: "paola@exempleada-demo.mx", organization: "Grupo Industrial Norte", role: "Participante en seguimiento", phone: "+52 55 1000 0014", status: "invitado", credits: 1545, owner: "Ricardo Vega", lastChange: "12/06/2026 11:25", notes: "Pendiente aceptar invitacion de acceso a plataforma." },
  { kind: "internal-coach", name: "Sofia Rivera", email: "sofia@empleateya.mx", organization: "Coaching 1o1", role: "Coach ejecutivo", phone: "+52 55 1000 0005", status: "invitado", credits: 0, owner: "Leo Galvez", lastChange: "10/06/2026 13:02", notes: "Asignable a sesiones 1o1, NPS, notas y testimonios." },
  { kind: "internal-coach", name: "Patricia Mora", email: "patricia@empleateya.mx", organization: "Cursos online", role: "Coach entrevistas", phone: "+52 55 1000 0010", status: "activo", credits: 0, owner: "Leo Galvez", lastChange: "09/06/2026 15:45", notes: "Disponible para cursos grupales y sesiones remotas." },
];

const internalCoachAssignments: CoachAssignment[] = [
  { coachEmail: "sofia@empleateya.mx", kind: "group", name: "Coaching 1o1 Ejecutivo", startDate: "2026-06-10", endDate: "2026-07-10", modality: "online", nps: 92 },
  { coachEmail: "sofia@empleateya.mx", kind: "campaign", name: "Outplacement Junio 2026", startDate: "2026-06-18", endDate: "2026-08-15", modality: "hybrid", nps: 88 },
  { coachEmail: "patricia@empleateya.mx", kind: "group", name: "Preparacion entrevistas remoto", startDate: "2026-06-20", endDate: "2026-07-20", modality: "online", nps: 95 },
];

export function AdminUsersClient({ userKind = "online" }: { userKind?: AdminUserKind }) {
  const { language } = useLanguage();
  const t = copy[language];
  const kind = kindConfig[language][userKind];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showPermissions, setShowPermissions] = useState(false);
  const [coachPlanKey, setCoachPlanKey] = useState<CoachPartnerPlanKey>("starter");
  const [users, setUsers] = useState<DemoUser[]>(demoUsers);
  const [notice, setNotice] = useState("");
  const [pendingPermissions, setPendingPermissions] = useState<UserPermissions | null>(null);
  const [creditAuditEvents, setCreditAuditEvents] = useState<CreditAuditEvent[]>([]);
  const [searchMode, setSearchMode] = useState<UserSearchMode>("capture");
  const [showBalance, setShowBalance] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [draftRole, setDraftRole] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftOwner, setDraftOwner] = useState<string>(internalOwners[0]);
  const [draftOrganization, setDraftOrganization] = useState("");
  const [draftCoachPlanKey, setDraftCoachPlanKey] = useState<CoachPartnerPlanKey>("starter");
  const [currentOperator, setCurrentOperator] = useState(() => operatorForProfile("super_admin"));

  useEffect(() => {
    setCurrentOperator(operatorForProfile(window.localStorage.getItem(profileStorageKey) ?? "super_admin", window.localStorage.getItem(roleStorageKey) ?? ""));
    const storedUsers = readStoredJson<DemoUser[]>(adminUsersStorageKey);
    const storedAuditEvents = readStoredJson<CreditAuditEvent[]>(adminCreditAuditStorageKey);
    if (storedUsers?.length) setUsers(mergeMissingDemoUsers(storedUsers));
    if (storedAuditEvents?.length) setCreditAuditEvents(storedAuditEvents);
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(adminUsersStorageKey, JSON.stringify(users));
  }, [storageLoaded, users]);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(adminCreditAuditStorageKey, JSON.stringify(creditAuditEvents));
  }, [creditAuditEvents, storageLoaded]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKind = user.kind === userKind;
      const matchesStatus = status === "all" || user.status === status;
      const matchesText = !normalized || Object.values(user).some((value) => String(value).toLowerCase().includes(normalized));
      return matchesKind && matchesStatus && matchesText;
    });
  }, [query, status, userKind, users]);

  const selectedUser = users.find((user) => user.kind === userKind && user.email === selectedEmail);
  const fixedEmpleateYaOrg = usesFixedEmpleateYaOrganization(userKind);
  const activeOrganization = fixedEmpleateYaOrg
    ? empleateYaOrganization
    : draftOrganization || selectedUser?.organization || (usesOrganizationCatalog(userKind) ? organizationCatalog[userKind][0] : "");
  const defaultStatus = selectedUser?.status ?? t.statuses[0];
  const activeRole = draftRole || selectedUser?.role || kind.roles[0];
  const unlimitedCredits = hasUnlimitedCredits(userKind, activeRole);
  const activeCoachPlanKey = pendingPermissions?.coachPlanKey ?? (userKind === "coach-partner" ? coachPartnerLicenseForOrganization(activeOrganization).planKey : draftCoachPlanKey);
  const activePermissions = normalizePermissionsForUser(pendingPermissions ?? selectedUser?.permissions ?? defaultPermissionsFor(userKind, activeRole, activeCoachPlanKey), userKind, activeRole);
  const operatorIsSuperAdmin = currentOperator.role === "Super Admin" || delegatedSupervisorIsActive(currentOperator, users);
  const operatorCanMoveOnlineCredits = operatorIsSuperAdmin;
  const onlineUserIsPaid = activeRole === "Cliente Online Pagado" || activeRole === "Paid online client";
  const canEditOnlineRoleAndOwner = userKind !== "online" || operatorIsSuperAdmin;
  const canEditOnlineCredits = userKind === "online" && operatorCanMoveOnlineCredits && onlineUserIsPaid;
  const selectedOnlineBalance = selectedUser && userKind === "online" ? balanceTotalForUser(selectedUser, creditAuditEvents, language) : undefined;

  useEffect(() => {
    setDraftRole(selectedUser?.role ?? kind.roles[0]);
  }, [kind.roles, selectedUser?.role, userKind]);

  useEffect(() => {
    setDraftStatus(selectedUser?.status ?? t.statuses[0]);
  }, [selectedUser?.status, t.statuses]);

  useEffect(() => {
    setDraftOwner(selectedUser?.owner ? ownerOptionFor(selectedUser.owner) : internalOwners[0]);
  }, [selectedUser?.owner, userKind]);

  useEffect(() => {
    if (fixedEmpleateYaOrg) {
      setDraftOrganization(empleateYaOrganization);
      return;
    }
    setDraftOrganization(selectedUser?.organization ?? (usesOrganizationCatalog(userKind) ? organizationCatalog[userKind][0] : ""));
  }, [fixedEmpleateYaOrg, selectedUser?.organization, userKind]);

  useEffect(() => {
    const organizationPlanKey = userKind === "coach-partner" ? coachPartnerLicenseForOrganization(activeOrganization).planKey : undefined;
    setDraftCoachPlanKey(selectedUser?.permissions?.coachPlanKey ?? organizationPlanKey ?? coachPlanKey);
  }, [activeOrganization, coachPlanKey, selectedUser?.permissions?.coachPlanKey, userKind]);

  function selectUserForMaintenance(email: string) {
    const user = users.find((currentUser) => currentUser.kind === userKind && currentUser.email === email);
    setSelectedEmail(email);
    setDraftRole(user?.role ?? kind.roles[0]);
    setDraftStatus(user?.status ?? t.statuses[0]);
    setDraftOwner(user?.owner ? ownerOptionFor(user.owner) : internalOwners[0]);
    setDraftOrganization(user?.organization ?? (usesOrganizationCatalog(userKind) ? organizationCatalog[userKind][0] : ""));
    setDraftCoachPlanKey(user?.permissions?.coachPlanKey ?? (userKind === "coach-partner" ? coachPartnerLicenseForOrganization(user?.organization).planKey : coachPlanKey));
    setSearchMode("capture");
    setNotice(t.selectedForEdit);
  }

  function handleSaveUser(formData: FormData) {
    const nextName = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const requestedRole = String(formData.get("role") || kind.roles[0]);
    let nextRole = userKind === "online" && !operatorIsSuperAdmin ? (selectedUser?.role ?? kind.roles[0]) : requestedRole;
    if (userKind === "online" && (!nextName || !email)) {
      setNotice(t.requiredOnlineMessage);
      return;
    }
    if (userKind === "super-admin-support" && (!nextName || !phone || !email)) {
      setNotice(t.requiredSupportMessage);
      return;
    }
    if (userKind === "internal-coach" && (!nextName || !phone || !email)) {
      setNotice(t.requiredInternalCoachMessage);
      return;
    }
    if (userKind === "coach-partner" && (!nextName || !phone || !email)) {
      setNotice(t.requiredCoachPartnerMessage);
      return;
    }
    if (userKind === "super-admin-support" && isTemporarySupervisorRole(nextRole) && !selectedUser) {
      setNotice(t.delegationExistingUserMessage);
      return;
    }
    if (userKind === "online" && !operatorIsSuperAdmin && !selectedUser && (requestedRole === "Cliente Online Pagado" || requestedRole === "Paid online client")) {
      setNotice(t.onlineSupportPaidTypeMessage);
      return;
    }
    if (userKind === "online" && users.some((user) => user.kind === "online" && user.email !== selectedUser?.email && user.name.trim().toLowerCase() === nextName.toLowerCase())) {
      setNotice(t.duplicateOnlineNameMessage);
      return;
    }
    const nextOrganization = fixedEmpleateYaOrg ? empleateYaOrganization : String(formData.get("organization") || "").trim();
    const delegationStart = String(formData.get("extra-fecha_de_delegacion") || selectedUser?.extraData?.fecha_de_delegacion || "").trim();
    const delegationEnd = String(formData.get("extra-fecha_fin_delegacion") || selectedUser?.extraData?.fecha_fin_delegacion || "").trim();
    const delegationPassword = String(formData.get("delegationPassword") || "").trim();
    const assigningDelegation = userKind === "super-admin-support" && isTemporarySupervisorRole(nextRole);
    if (assigningDelegation && (!delegationStart || !delegationEnd)) {
      setNotice(t.delegationDateMessage);
      return;
    }
    if (assigningDelegation && currentOperator.role === "Apoyo administrativo" && !operatorIsSuperAdmin && delegationPassword !== "admin-demo") {
      setNotice(t.delegationPasswordMessage);
      return;
    }
    const previousSupportRole = userKind === "super-admin-support" ? baseSupportRoleForDelegation(selectedUser, nextRole) : "";
    const delegationExpired = assigningDelegation && !delegationWindowIsActive(delegationStart, delegationEnd);
    if (delegationExpired) {
      nextRole = previousSupportRole;
    }
    const nextCoachPlanKey = userKind === "coach-partner"
      ? coachPartnerLicenseForOrganization(nextOrganization).planKey
      : String(formData.get("coachPlanKey") || draftCoachPlanKey || coachPlanKey) as CoachPartnerPlanKey;
    const nextCoachPlan = coachPartnerPlans[nextCoachPlanKey];
    const roleChanged = selectedUser ? selectedUser.role !== nextRole : true;
    const planChanged = selectedUser?.permissions?.coachPlanKey !== nextCoachPlanKey;
    const requestedStatus = selectedUser ? String(formData.get("status") || draftStatus || defaultStatus) : activeStatusValue(language);
    const statusChanged = selectedUser ? selectedUser.status !== requestedStatus : false;
    const nextRoleIsPaidOnline = nextRole === "Cliente Online Pagado" || nextRole === "Paid online client";
    const nextCanEditOnlineCredits = !statusChanged && userKind === "online" && operatorCanMoveOnlineCredits && nextRoleIsPaidOnline;
    const currentOnlineBalance = userKind === "online" ? selectedOnlineBalance ?? onlineBaselineCredits : undefined;
    const shouldRestoreOnlineDefaults = userKind === "online" && selectedUser && !isActiveStatus(selectedUser.status) && isActiveStatus(requestedStatus);
    const shouldCascade = shouldCascadePermissionsForRole(userKind, roleChanged, planChanged);
    const cascadedPermissions = normalizePermissionsForUser(shouldRestoreOnlineDefaults || shouldCascade
      ? defaultPermissionsFor(userKind, nextRole, nextCoachPlanKey)
      : pendingPermissions ?? selectedUser?.permissions ?? defaultPermissionsFor(userKind, nextRole, nextCoachPlanKey), userKind, nextRole);
    let nextCredits = userKind === "online"
      ? statusChanged && selectedUser
        ? currentOnlineBalance ?? onlineBaselineCredits
        : nextCanEditOnlineCredits
          ? Number(formData.get("credits") || currentOnlineBalance || onlineBaselineCredits)
          : currentOnlineBalance ?? onlineBaselineCredits
      : creditsForUserRole(userKind, nextRole, nextCoachPlan, formData, selectedUser, nextCanEditOnlineCredits, requestedStatus);
    if (userKind === "coach-partner") {
      nextCredits = selectedUser?.credits ?? calculateCoachPartnerPool(nextCoachPlan);
    }
    if (userKind === "online" && !nextRoleIsPaidOnline && !isInvitedStatus(requestedStatus) && Number(formData.get("credits") || currentOnlineBalance || onlineBaselineCredits) !== (currentOnlineBalance ?? onlineBaselineCredits)) {
      setNotice(t.onlineProspectCreditMessage);
      return;
    }
    if (selectedUser && isLockedOrDeletedStatus(selectedUser.status) && requestedStatus !== selectedUser.status && !operatorIsSuperAdmin) {
      setNotice(t.protectedStatusRestoreMessage);
      return;
    }
    if (isMainOrganizationRole(userKind, nextRole) && !canCurrentOperatorCreateMainOrganizationRole(currentOperator.role, operatorIsSuperAdmin)) {
      setNotice(t.unauthorizedPrincipalCreateMessage);
      return;
    }
    if (isMainOrganizationRole(userKind, nextRole) && hasActivePrincipalForOrganization(users, userKind, nextRole, nextOrganization, selectedUser?.email)) {
      setNotice(t.duplicatePrincipalMessage);
      return;
    }
    const savedUser: DemoUser = {
      kind: userKind,
      name: nextName || "Usuario sin nombre",
      email: email || `usuario-${Date.now()}@empleateya.local`,
      organization: nextOrganization,
      role: nextRole,
      phone,
      status: requestedStatus,
      credits: nextCredits,
      owner: userKind === "online" && !operatorIsSuperAdmin ? (selectedUser?.owner ?? internalOwners[0]) : String(formData.get("owner") || draftOwner || internalOwners[0]),
      lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
      notes: String(formData.get("notes") || "").trim(),
      linkedinUrl: String(formData.get("linkedinUrl") || "").trim(),
      salaryRange: String(formData.get("salaryRange") || "").trim(),
      desiredSalaryAmount: String(formData.get("desiredSalaryAmount") || "").trim(),
      age: Number(formData.get("age") || 0) || undefined,
      permissions: cascadedPermissions,
      extraData: {
        ...buildExtraData(kind.extraFields, formData, selectedUser, userKind),
        ...(previousSupportRole ? { previous_support_role: previousSupportRole } : {}),
        profileName: nextName,
        profileEmail: email,
      },
    };
    let creditAdjusted = false;

    setUsers((currentUsers) => {
      const previousEmail = selectedUser?.email;
      const existingIndex = currentUsers.findIndex((user) => user.email === previousEmail || user.email === savedUser.email);
      if (existingIndex === -1) return [savedUser, ...currentUsers];
      return currentUsers.map((user, index) => (index === existingIndex ? savedUser : user));
    });
    if (userKind === "online") {
      const balanceBefore = currentOnlineBalance ?? onlineBaselineCredits;
      const difference = nextCredits - balanceBefore;
      if (difference !== 0) {
        creditAdjusted = true;
        setCreditAuditEvents((currentEvents) => [
          {
            id: `${Date.now()}-${savedUser.email}`,
            userEmail: savedUser.email,
            userName: savedUser.name,
            amount: difference,
            balanceBefore,
            balanceAfter: nextCredits,
            actor: `${currentOperator.name} - ${currentOperator.role}`,
            createdAt: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }),
          },
          ...currentEvents,
        ]);
      }
    }
    setSelectedEmail(savedUser.email);
    setDraftOrganization(savedUser.organization);
    if (userKind === "coach-partner") {
      setCoachPlanKey(nextCoachPlanKey);
      setDraftCoachPlanKey(nextCoachPlanKey);
    }
    setDraftRole(nextRole);
    setPendingPermissions(null);
    const cascadedMessage = shouldCascadePermissionsForRole(userKind, roleChanged, planChanged) ? ` ${t.permissionsAssignedMessage}` : "";
    const delegationMessage = delegationExpired ? ` ${t.delegationExpiredMessage}` : "";
    setNotice(creditAdjusted ? `${t.savedDataMessage} ${t.creditAdjustmentMessage}${cascadedMessage}${delegationMessage}` : `${t.savedDataMessage}${cascadedMessage}${delegationMessage}`);
  }

  if (showPermissions) {
    return (
      <PermissionsPanel
        userKind={userKind}
        userRole={activeRole}
        language={language}
        permissions={activePermissions}
        onBack={() => setShowPermissions(false)}
        onSave={(permissions) => {
          setCoachPlanKey(permissions.coachPlanKey);
          setPendingPermissions(permissions);
          if (selectedUser) {
            setUsers((currentUsers) => currentUsers.map((user) => (user.email === selectedUser.email ? { ...user, permissions, lastChange: new Date().toLocaleString(language === "es" ? "es-MX" : "en-US", { dateStyle: "short", timeStyle: "short" }) } : user)));
          }
          setShowPermissions(false);
          setNotice(t.savedPermissionsMessage);
        }}
      />
    );
  }

  if (showBalance && selectedUser && userKind === "online") {
    return (
      <OnlineBalancePanel
        user={selectedUser}
        language={language}
        creditAuditEvents={creditAuditEvents}
        onBack={() => setShowBalance(false)}
        onEmail={() => {
          setShowBalance(false);
          setNotice(t.balanceEmailMessage);
        }}
      />
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]"><ShieldCheck size={15} /> {t.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{kind.title}</h1>
        <p className="mt-4 max-w-5xl text-lg leading-8 text-slate-600">{kind.description}</p>
      </header>

      {searchMode !== "capture" ? (
        <>
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">{t.edit}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{t.searchModeEditHelp}</p>
              </div>
              <Button type="button" className="border border-[var(--brand-border)] bg-white text-slate-700 hover:bg-slate-50" onClick={() => setSearchMode("capture")}>{t.backToCapture}</Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.5fr_260px]">
              <div>
                <Label>{t.search}</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder={t.searchPlaceholder} />
                </div>
              </div>
              <Field label={t.status}>
                <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">{t.all}</option>
                  {t.statuses.map((item) => <option key={item} value={item}>{statusLabel(item, language)}</option>)}
                </Select>
              </Field>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-xl font-black text-slate-950">{t.results}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{t.resultHelp}</p>
            </div>
            <div className="max-h-[210px] overflow-auto">
              <table className="w-full min-w-[1280px] text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr>{t.columns.map((column) => <Th key={column}>{column}</Th>)}</tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.email} className={`border-b border-slate-100 last:border-0 ${selectedEmail === user.email ? "bg-[var(--brand-primary-soft)]" : ""}`}>
                      <Td><input type="radio" name="selected-user" checked={selectedEmail === user.email} onChange={() => selectUserForMaintenance(user.email)} /></Td>
                      <Td><strong className="block text-slate-950">{user.name}</strong><span className="text-xs text-slate-500">{user.email}</span></Td>
                      <Td><Pill>{kind.profile}</Pill></Td>
                      <Td>{user.organization}</Td>
                      <Td>{user.role}</Td>
                      <Td>{user.phone}</Td>
                      <Td>{hasUnlimitedCredits(user.kind, user.role) ? t.unlimitedCredits : user.credits}</Td>
                      <Td><StatusPill status={user.status} language={language} /></Td>
                      <Td>{user.owner}</Td>
                      <Td>{user.lastChange}</Td>
                      <Td>{user.notes}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <NoticeDialog title={t.alertTitle} acceptLabel={t.alertAccept} message={notice} onClose={() => setNotice("")} />

      <form key={`${userKind}-${selectedEmail || "new"}`} action={handleSaveUser} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{t.formTitle}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedUser ? `${t.selected}: ${selectedUser.name}` : t.noSelected}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]" onClick={() => { const defaultOrganization = fixedEmpleateYaOrg ? empleateYaOrganization : (usesOrganizationCatalog(userKind) ? organizationCatalog[userKind][0] : ""); setSelectedEmail(""); setDraftRole(kind.roles[0]); setDraftStatus(t.statuses[0]); setDraftOwner(internalOwners[0]); setDraftOrganization(defaultOrganization); setDraftCoachPlanKey(coachPartnerLicenseForOrganization(defaultOrganization).planKey); setPendingPermissions(null); setNotice(""); setSearchMode("capture"); }}><UserPlus size={17} />{t.create}</Button>
            <Button type="button" className="gap-2 bg-slate-950 text-white hover:bg-slate-800" onClick={() => { setSearchMode("edit"); setNotice(""); }}><Search size={17} />{t.edit}</Button>
            {userKind === "online" ? <Button type="button" disabled={!selectedUser} title={!selectedUser ? t.balanceDisabledHelp : undefined} className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" onClick={() => setShowBalance(true)}><FileText size={17} />{t.balance}</Button> : null}
            <Button type="submit" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"><Save size={17} />{t.saveData}</Button>
            <Button type="button" className="gap-2 border border-[var(--brand-border)] bg-white text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]" onClick={() => { setPendingPermissions(activePermissions); setShowPermissions(true); }}><KeyRound size={17} />{t.permissions}</Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <FormGroup title={t.name} icon={<UsersRound size={18} />}>
            <Field label={t.name}><Input name="name" placeholder="Ej. Laura Mendez" defaultValue={selectedUser?.name ?? ""} /></Field>
            <Field label={t.email}><Input name="email" placeholder="correo@ejemplo.com" defaultValue={selectedUser?.email ?? ""} type="email" /></Field>
            <Field label={t.phone}><Input name="phone" placeholder="+52 55 0000 0000" defaultValue={selectedUser?.phone ?? ""} /></Field>
          </FormGroup>
          <FormGroup title={kind.organizationLabel} icon={<Building2 size={18} />}>
            <Field label={t.organization}>{organizationFieldForUserKind(userKind, activeOrganization, fixedEmpleateYaOrg, kind.organizationPlaceholder, setDraftOrganization)}</Field>
            {usesOrganizationCatalog(userKind) ? <p className="text-xs font-semibold leading-5 text-slate-500">{t.orgHelp}</p> : null}
            <Field label={kind.roleLabel}>
              <Select
                name="role"
                value={activeRole}
                disabled={!canEditOnlineRoleAndOwner}
                onChange={(event) => {
                  const nextRole = event.target.value;
                  setDraftRole(nextRole);
                  setPendingPermissions(normalizePermissionsForUser(defaultPermissionsFor(userKind, nextRole, activeCoachPlanKey), userKind, nextRole));
                }}
              >
                {kind.roles.map((item) => <option key={item}>{item}</option>)}
              </Select>
              {!canEditOnlineRoleAndOwner ? <input type="hidden" name="role" value={activeRole} /> : null}
            </Field>
            {userKind === "coach-partner" ? (
              <>
                <Field label={t.partnerPlan}>
                  <Select name="coachPlanKey" value={activeCoachPlanKey} disabled>
                    {Object.entries(coachPartnerPlans).map(([key, plan]) => <option key={key} value={key}>{plan.label}</option>)}
                  </Select>
                  <input type="hidden" name="coachPlanKey" value={activeCoachPlanKey} />
                </Field>
                <PartnerPlanSummary plan={coachPartnerPlans[activeCoachPlanKey]} language={language} />
              </>
            ) : null}
            <Field label={t.owner}>
              <Select name="owner" value={draftOwner} onChange={(event) => setDraftOwner(event.target.value)} disabled={!canEditOnlineRoleAndOwner}>
                {internalOwners.map((item) => <option key={item}>{item}</option>)}
              </Select>
              {!canEditOnlineRoleAndOwner ? <input type="hidden" name="owner" value={draftOwner} /> : null}
            </Field>
            <p className="text-xs font-semibold leading-5 text-slate-500">{t.ownerHelp}</p>
          </FormGroup>
          <FormGroup title={t.extra} icon={<ShieldCheck size={18} />}>
            <Field label={t.statusLabel}>
              <Select name="status" value={draftStatus || defaultStatus} onChange={(event) => setDraftStatus(event.target.value)} disabled={Boolean(selectedUser && isLockedOrDeletedStatus(selectedUser.status) && !operatorIsSuperAdmin)}>
                {t.statuses.map((item) => <option key={item} value={item}>{statusLabel(item, language)}</option>)}
              </Select>
              {selectedUser && isLockedOrDeletedStatus(selectedUser.status) && !operatorIsSuperAdmin ? <input type="hidden" name="status" value={selectedUser.status} /> : null}
            </Field>
            <Field label={t.credits}>
              {userKind === "coach-partner" ? (
                <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-black text-purple-900">
                  {formatPlanNumber(calculateCoachPartnerPool(coachPartnerPlans[activeCoachPlanKey]), language)}
                  <small className="mt-1 block font-semibold text-purple-700">{t.partnerCreditPool}</small>
                  <input type="hidden" name="credits" value={Number.isFinite(calculateCoachPartnerPool(coachPartnerPlans[activeCoachPlanKey])) ? calculateCoachPartnerPool(coachPartnerPlans[activeCoachPlanKey]) : 0} />
                </div>
              ) : unlimitedCredits ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
                  {t.unlimitedCredits}
                  <small className="mt-1 block font-semibold text-emerald-700">{t.unlimitedCreditsHelp}</small>
                  <input type="hidden" name="credits" value="0" />
                </div>
              ) : userKind === "outplacement-rh" ? (
                <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-black text-purple-900">
                  {formatPlanNumber(outplacementCurrentCredits(selectedUser, activeRole), language)}
                  <small className="mt-1 block font-semibold text-purple-700">
                    {language === "es" ? "Saldo operativo vigente. Para usuarios nuevos se propone la bolsa mensual del rol; despues se conserva el balance actualizado por consumo." : "Current operating balance. New users get the role monthly pool; after that, the consumed balance is preserved."}
                  </small>
                  <input type="hidden" name="credits" value={outplacementCurrentCredits(selectedUser, activeRole)} />
                </div>
              ) : (
                <Input name="credits" placeholder="0" type="number" defaultValue={selectedOnlineBalance ?? selectedUser?.credits ?? (userKind === "online" ? onlineBaselineCredits : 0)} readOnly={userKind !== "online" || !canEditOnlineCredits} />
              )}
            </Field>
            {userKind === "online" ? <p className="text-xs font-semibold leading-5 text-slate-500">{t.creditsHelp}</p> : null}
            <ExtraFields fields={kind.extraFields} selectedUser={selectedUser} userRole={activeRole} userKind={userKind} organization={activeOrganization} language={language} canSeeStripeFull={operatorIsSuperAdmin} currentOperator={currentOperator} operatorIsSuperAdmin={operatorIsSuperAdmin} />
            {userKind === "internal-coach" ? <InternalCoachAvailabilityPanel user={selectedUser} language={language} /> : null}
            {userKind === "super-admin-support" ? (
              <p className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-xs font-semibold leading-5 text-purple-900">
                <strong>{t.supportRolePolicy}:</strong> {t.supportRolePolicyHelp}
              </p>
            ) : null}
            {userKind === "online" ? (
              <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-slate-700">
                <input name="privacyAccepted" type="checkbox" className="mt-1" checked={Boolean(selectedUser?.extraData?.privacyAccepted)} readOnly disabled />
                <span>{t.privacyAccepted} <small className="block font-semibold text-slate-500">{t.privacyReadonly}</small></span>
              </label>
            ) : null}
          </FormGroup>
        </div>
        {usesCareerDataFields(userKind) ? (
          <section className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="mb-4 text-lg font-black text-slate-950">{t.careerData}</h3>
            {(userKind === "student" || userKind === "outplacement-employee") ? (
              <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
                <strong>{t.loginEligibility}:</strong> {t.loginEligibilityHelp}
              </p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-3">
              {userKind === "online" ? (
                <Field label={t.age}>
                  <Input name="age" type="number" min="16" max="90" placeholder="Ej. 38" defaultValue={selectedUser?.age ?? ""} />
                  <p className="mt-1 text-xs font-semibold text-slate-500">{t.ageHelp}</p>
                </Field>
              ) : null}
              <Field label={t.linkedinUrl}>
                <Input name="linkedinUrl" placeholder="https://linkedin.com/in/... / No tengo perfil de LinkedIn" defaultValue={selectedUser?.linkedinUrl ?? ""} />
              </Field>
              <Field label={t.salaryRange}>
                <Select name="salaryRange" defaultValue={selectedUser?.salaryRange ?? ""}>
                  <option value="">-</option>
                  {salaryRangeOptions[language].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
              <Field label={t.desiredSalaryAmount}>
                <Input name="desiredSalaryAmount" placeholder={language === "es" ? "Ej. MXN $45,000" : "Example: USD $5,500"} defaultValue={selectedUser?.desiredSalaryAmount ?? ""} />
                <p className="mt-1 text-xs font-semibold text-slate-500">{t.desiredSalaryHelp}</p>
              </Field>
            </div>
          </section>
        ) : null}
        <PermissionsSummary permissions={activePermissions} language={language} />
        <div className="mt-5">
          <Label>{t.notes}</Label>
          <textarea name="notes" className="min-h-28 w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-ink)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]" defaultValue={selectedUser?.notes ?? ""} />
        </div>
        {userKind === "online" ? <CreditAuditLog title={t.creditAuditTitle} empty={t.creditAuditEmpty} events={selectedUser ? creditAuditEvents.filter((event) => event.userEmail === selectedUser.email) : []} /> : null}
      </form>
    </div>
  );
}

function OnlineBalancePanel({
  user,
  language,
  creditAuditEvents,
  onBack,
  onEmail,
}: {
  user: DemoUser;
  language: "es" | "en";
  creditAuditEvents: CreditAuditEvent[];
  onBack: () => void;
  onEmail: () => void;
}) {
  const t = copy[language];
  const [period, setPeriod] = useState<BalancePeriod>("month");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  const movements = useMemo(() => filterBalanceMovements(buildBalanceMovements(user, creditAuditEvents, language), period, startDate, endDate), [creditAuditEvents, endDate, language, period, startDate, user]);
  const finalBalance = movements.reduce((total, movement) => total + movement.credits + movement.consumption, 0);

  function printStatement() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <section className="space-y-5 rounded-[1.5rem] border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">{t.balance}</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{t.balanceTitle}</h2>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-600">{t.balanceDescription}</p>
        </div>
        <Button type="button" className="border border-[var(--brand-border)] bg-white text-slate-700 hover:bg-slate-50" onClick={onBack}>{t.backToCapture}</Button>
      </div>

      <div className="grid gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 lg:grid-cols-[240px_1fr_1fr]">
        <Field label={t.balancePeriod}>
          <Select value={period} onChange={(event) => setPeriod(event.target.value as BalancePeriod)}>
            <option value="day">{t.balanceDay}</option>
            <option value="week">{t.balanceWeek}</option>
            <option value="month">{t.balanceMonth}</option>
            <option value="custom">{t.balanceCustom}</option>
          </Select>
        </Field>
        <Field label={t.balanceStart}>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} disabled={period !== "custom"} />
        </Field>
        <Field label={t.balanceEnd}>
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} disabled={period !== "custom"} />
        </Field>
      </div>

      <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-950">{t.balancePreview}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">{t.balanceGeneralData}: {user.name} | {user.email} | {user.phone} | {user.role}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{user.organization} | {user.status}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2 bg-slate-700 text-white hover:bg-slate-800" onClick={printStatement}><Printer size={17} />{t.balancePrint}</Button>
            <Button type="button" className="gap-2 bg-rose-500 text-white hover:bg-rose-600" onClick={printStatement}><FileText size={17} />{t.balancePdf}</Button>
            <Button type="button" className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700" onClick={onEmail}><Mail size={17} />{t.balanceEmail}</Button>
          </div>
        </div>

        <div className="max-h-[980px] overflow-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr>{t.balanceColumns.map((column) => <Th key={column}>{column}</Th>)}</tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={`${movement.date}-${movement.concept}`} className="border-b border-slate-100 last:border-0">
                  <Td>{formatBalanceDate(movement.date, language)}</Td>
                  <Td><span className="font-bold text-slate-900">{movement.concept}</span></Td>
                  <Td>{movement.credits > 0 ? formatSignedCredits(movement.credits) : "-"}</Td>
                  <Td>{movement.consumption < 0 ? formatSignedCredits(movement.consumption) : "-"}</Td>
                </tr>
              ))}
              <tr className="bg-slate-950 text-white">
                <td className="px-4 py-3 text-sm font-black" colSpan={2}>{t.balanceFinal}</td>
                <td className="px-4 py-3 text-sm font-black" colSpan={2}>{finalBalance.toLocaleString(language === "es" ? "es-MX" : "en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function InternalCoachAvailabilityPanel({ user, language }: { user?: DemoUser; language: "es" | "en" }) {
  const t = copy[language];
  const assignments = internalCoachAssignments.filter((assignment) => assignment.coachEmail === user?.email);
  const summary = summarizeCoachAssignments(assignments, language);
  return (
    <section className="rounded-[1.25rem] border border-indigo-100 bg-indigo-50/70 p-4">
      <h3 className="text-base font-black text-slate-950">{t.coachAvailabilityTitle}</h3>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{t.coachAvailabilityHelp}</p>
      <div className="mt-4 grid gap-3">
        <ReadOnlyMetric label={t.coachAvailability} value={assignments.length ? t.coachAssigned : t.coachAvailable} tone={assignments.length ? "amber" : "emerald"} />
        <ReadOnlyMetric label={t.coachDateRange} value={summary.dateRange} />
        <ReadOnlyMetric label={t.coachModality} value={summary.modality} />
        <ReadOnlyMetric label={t.coachAverageNps} value={summary.averageNps} />
        <ReadOnlyMetric label={t.coachOutplacementMentor} value={assignments.some((assignment) => assignment.kind === "campaign") ? t.coachAssigned : t.coachAvailable} tone={assignments.some((assignment) => assignment.kind === "campaign") ? "amber" : "emerald"} />
      </div>
      <div className="mt-4">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t.coachAssignmentList}</p>
        {assignments.length ? (
          <div className="max-h-36 overflow-auto rounded-2xl border border-indigo-100 bg-white">
            {assignments.map((assignment) => (
              <div key={`${assignment.coachEmail}-${assignment.name}`} className="border-b border-slate-100 px-3 py-2 text-xs last:border-0">
                <strong className="block text-slate-950">{assignment.name}</strong>
                <span className="text-slate-500">
                  {assignment.kind === "campaign" ? (language === "es" ? "Campana" : "Campaign") : (language === "es" ? "Grupo" : "Group")} · {formatShortDate(assignment.startDate, language)} - {formatShortDate(assignment.endDate, language)} · {modalityLabel(assignment.modality, language)} · NPS {assignment.nps}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">{t.coachNoAssignments}</p>
        )}
      </div>
    </section>
  );
}

function ReadOnlyMetric({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "amber" | "emerald" }) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone];
  return (
    <div className={`rounded-2xl border px-3 py-2 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function PermissionsSummary({ permissions, language }: { permissions: UserPermissions; language: "es" | "en" }) {
  const t = copy[language];
  const avatarNames = permissions.avatarIds.map((avatarId) => skillRegistry[avatarId]?.name).filter(Boolean);
  const menuNames = permissions.adminMenuHrefs
    .map((href) => adminSections.find((section) => section.href === href))
    .filter((section): section is (typeof adminSections)[number] => Boolean(section))
    .map((section) => adminMenuLabels[language][section.key]);
  return (
    <section className="mt-5 rounded-[1.25rem] border border-purple-100 bg-purple-50/70 p-4">
      <h3 className="text-lg font-black text-slate-950">{t.currentPermissions}</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t.assignedAvatars}</p>
          <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-auto pr-1">
            {avatarNames.map((name) => <Pill key={name}>{name}</Pill>)}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t.assignedMenu}</p>
          <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-auto pr-1">
            {menuNames.length ? menuNames.map((name) => <Pill key={name}>{name}</Pill>) : <span className="text-sm font-semibold text-slate-500">-</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerPlanSummary({ plan, language }: { plan: (typeof coachPartnerPlans)[CoachPartnerPlanKey]; language: "es" | "en" }) {
  const t = copy[language];
  const groupLabel = plan.unlimited ? (language === "es" ? "Ilimitados" : "Unlimited") : `${plan.groups}`;
  const studentsLabel = plan.unlimited ? (language === "es" ? "Ilimitados" : "Unlimited") : `${plan.studentsPerGroup}`;
  const maxStudents = plan.unlimited ? Infinity : plan.groups * plan.studentsPerGroup;
  const poolLabel = formatPlanNumber(calculateCoachPartnerPool(plan), language);
  const studentCreditsLabel = formatPlanNumber(calculateCoachPartnerStudentCredits(plan), language);
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-xs font-semibold leading-5 text-purple-900">
      <strong className="block text-sm text-slate-950">{plan.label}</strong>
      <span>{t.groups}: {groupLabel} - {t.students}: {studentsLabel}</span>
      <span className="block">{t.partnerCapacity}: {formatPlanNumber(maxStudents, language)}</span>
      <span className="block">{t.partnerBaseCredits}: {formatPlanNumber(plan.baseCreditsPerCycle, language)} x {formatPlanNumber(plan.cycles, language)}</span>
      <span className="block">{t.partnerCreditPool}: {poolLabel}</span>
      <span className="block">{t.partnerStudentCredits}: {studentCreditsLabel}</span>
      <span className="mt-2 block text-slate-600">{t.partnerScopeRule}</span>
    </div>
  );
}

function ExtraFields({
  fields,
  selectedUser,
  userRole,
  userKind,
  organization,
  language,
  canSeeStripeFull,
  currentOperator,
  operatorIsSuperAdmin,
}: {
  fields: readonly string[];
  selectedUser?: DemoUser;
  userRole: string;
  userKind: AdminUserKind;
  organization: string;
  language: "es" | "en";
  canSeeStripeFull: boolean;
  currentOperator: { name: string; role: string };
  operatorIsSuperAdmin: boolean;
}) {
  const t = copy[language];
  const showDelegationPassword = userKind === "super-admin-support" && isTemporarySupervisorRole(userRole) && currentOperator.role === "Apoyo administrativo" && !operatorIsSuperAdmin;
  return (
    <>
      {fields.map((field) => {
        const key = extraFieldKey(field);
        const savedValue = selectedUser?.extraData?.[key];
        const isStripeField = userKind === "online" && key.includes("stripe");
        if (userKind === "coach-partner") {
          const license = coachPartnerLicenseForOrganization(organization);
          const value = coachPartnerLicenseFieldValue(key, license);
          return (
            <Field key={field} label={field}>
              <Input value={value} readOnly />
              <input type="hidden" name={`extra-${key}`} value={value} />
            </Field>
          );
        }
        if (isStripeField) {
          const rawValue = typeof savedValue === "string" ? savedValue : "";
          const visibleValue = rawValue ? (canSeeStripeFull ? rawValue : maskStripeId(rawValue)) : "Stripe asignara este ID al comprar creditos";
          return (
            <Field key={field} label={field}>
              <Input value={visibleValue} readOnly />
              <input type="hidden" name={`extra-${key}`} value={typeof savedValue === "string" ? savedValue : ""} />
              <p className="mt-1 text-xs font-semibold text-slate-500">{t.stripeReadonly}</p>
            </Field>
          );
        }
        if (isBooleanExtraField(field)) {
          return (
            <label key={field} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              <input name={`extra-${key}`} type="checkbox" className="mt-1" defaultChecked={savedValue === undefined ? isDefaultCampaignApproverRole(userRole) : savedValue === true || savedValue === "true"} />
              <span>{field}</span>
            </label>
          );
        }
        if (key.includes("supervisor_responsable") || key.includes("responsible_supervisor")) {
          return (
            <Field key={field} label={field}>
              <Select name={`extra-${key}`} defaultValue={typeof savedValue === "string" ? savedValue : internalOwners[0]}>
                {internalOwners.map((owner) => <option key={owner}>{owner}</option>)}
              </Select>
            </Field>
          );
        }

        return (
          <Field key={field} label={field}>
            <Input name={`extra-${key}`} placeholder={field} type={isDateLikeField(field) ? "date" : "text"} defaultValue={typeof savedValue === "string" ? savedValue : ""} />
          </Field>
        );
      })}
      {showDelegationPassword ? (
        <Field label={t.delegationPasswordLabel}>
          <Input name="delegationPassword" type="password" placeholder="admin-demo" />
          <p className="mt-1 text-xs font-semibold text-slate-500">{t.delegationPasswordHelp}</p>
        </Field>
      ) : null}
    </>
  );
}

function PermissionsPanel({
  userKind,
  userRole,
  language,
  permissions,
  onBack,
  onSave,
}: {
  userKind: AdminUserKind;
  userRole: string;
  language: "es" | "en";
  permissions: UserPermissions;
  onBack: () => void;
  onSave: (permissions: UserPermissions) => void;
}) {
  const t = copy[language];
  const userIsPaidOnline = userRole === "Cliente Online Pagado" || userRole === "Paid online client";
  const [avatarIds, setAvatarIds] = useState<SkillId[]>(permissions.avatarIds);
  const [adminMenuHrefs, setAdminMenuHrefs] = useState<string[]>(permissions.adminMenuHrefs);
  const [localCoachPlanKey, setLocalCoachPlanKey] = useState<CoachPartnerPlanKey>(permissions.coachPlanKey);
  const partnerPlan = coachPartnerPlans[localCoachPlanKey];
  const partnerCreditPool = calculateCoachPartnerPool(partnerPlan);
  const partnerStudentCredits = calculateCoachPartnerStudentCredits(partnerPlan);
  const showAdminPermissionSections = userKind === "super-admin-support" || userKind === "internal-coach";
  const savePermissions = () => onSave(normalizePermissionsForUser({ avatarIds, adminMenuHrefs, userSubmenuHrefs: [], coachPlanKey: localCoachPlanKey }, userKind, userRole));

  function toggleAdminMenu(href: string, nextChecked: boolean) {
    setAdminMenuHrefs((currentHrefs) => toggleItem(currentHrefs, href, nextChecked));
  }

  return (
    <section className="space-y-5 rounded-[1.5rem] border border-purple-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-black text-slate-950"><KeyRound size={20} />{t.permissionsTitle}</h3>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-600">{t.permissionsHelp}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]" onClick={savePermissions}><ShieldCheck size={17} />{t.savePermissions}</Button>
          <Button className="gap-2 border border-[var(--brand-border)] bg-white text-slate-700 hover:bg-slate-50" onClick={onBack}>{t.backToCapture}</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {hasUnlimitedCredits(userKind, userRole) ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-900">
              {t.unlimitedCredits}. {t.unlimitedCreditsHelp}
            </div>
          ) : null}
        </div>
        {userKind === "coach-partner" ? (
          <div className="w-full rounded-2xl bg-white p-3 shadow-sm lg:w-80">
            <Label>{t.partnerPlan}</Label>
            <Select value={localCoachPlanKey} onChange={(event) => {
              const nextPlanKey = event.target.value as CoachPartnerPlanKey;
              setLocalCoachPlanKey(nextPlanKey);
              setAvatarIds(coachPartnerPlans[nextPlanKey].avatarIds.slice());
            }}>
              {Object.entries(coachPartnerPlans).map(([key, plan]) => <option key={key} value={key}>{plan.label}</option>)}
            </Select>
            <div className="mt-3 rounded-xl bg-slate-950 p-3 text-sm font-bold text-white">
              <p>{t.partnerCreditPool}: {formatPlanNumber(partnerCreditPool, language)}</p>
              <p>{t.partnerStudentCredits}: {formatPlanNumber(partnerStudentCredits, language)}</p>
              <p className="mt-1 text-xs text-slate-300">{t.groups}: {formatPlanNumber(partnerPlan.groups, language)} · {t.students}: {formatPlanNumber(partnerPlan.studentsPerGroup, language)} · {t.cycles}: {formatPlanNumber(partnerPlan.cycles, language)}</p>
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

      <div className={`grid gap-4 ${showAdminPermissionSections ? "xl:grid-cols-[1.2fr_1fr]" : "xl:grid-cols-1"}`}>
        <ChecklistCard title={t.avatars}>
          <div className="grid max-h-80 gap-2 overflow-auto pr-1">
            {allAvatarIds.map((avatarId) => {
              const skill = skillRegistry[avatarId];
              const checked = avatarIds.includes(avatarId);
              return (
                <PermissionCheck
                  key={avatarId}
                  checked={checked}
                  title={skill.name}
                  detail={`${skill.baseCredits} ${language === "es" ? "creditos" : "credits"}`}
                  onChange={(nextChecked) => setAvatarIds((currentIds) => toggleItem(currentIds, avatarId, nextChecked))}
                />
              );
            })}
          </div>
        </ChecklistCard>
        {showAdminPermissionSections ? (
          <>
            <ChecklistCard title={t.adminMenu}>
              <div className="grid max-h-80 gap-2 overflow-auto pr-1">
                {adminSections.map((section) => (
                  <PermissionCheck
                    key={section.href}
                    checked={adminMenuHrefs.includes(section.href)}
                    title={adminMenuLabels[language][section.key]}
                    detail={section.href}
                    onChange={(nextChecked) => toggleAdminMenu(section.href, nextChecked)}
                  />
                ))}
              </div>
            </ChecklistCard>
          </>
        ) : null}
      </div>
    </section>
  );
}

function defaultPermissionsFor(userKind: AdminUserKind, userRole: string, coachPlanKey: CoachPartnerPlanKey, userStatus = "activo"): UserPermissions {
  const adminMenuHrefs = adminSections.filter((section) => menuAllowedFor(userKind, userRole, section.href)).map((section) => section.href);
  return {
    avatarIds: allowedAvatarsFor(userKind, userRole, coachPlanKey, userStatus),
    adminMenuHrefs,
    userSubmenuHrefs: inheritedUserSubmenusForAdminMenus(adminMenuHrefs, userKind, userRole),
    coachPlanKey,
  };
}

function normalizePermissionsForUser(permissions: UserPermissions, userKind: AdminUserKind, userRole: string): UserPermissions {
  const validAvatarIds = Array.from(new Set(permissions.avatarIds)).filter((avatarId) => Boolean(skillRegistry[avatarId]));
  const validAdminMenuHrefs = Array.from(new Set(permissions.adminMenuHrefs)).filter((href) => adminSections.some((section) => section.href === href));
  return {
    ...permissions,
    avatarIds: validAvatarIds,
    adminMenuHrefs: validAdminMenuHrefs,
    userSubmenuHrefs: inheritedUserSubmenusForAdminMenus(validAdminMenuHrefs, userKind, userRole),
  };
}

function inheritedUserSubmenusForAdminMenus(adminMenuHrefs: string[], userKind: AdminUserKind, userRole: string) {
  if (!adminMenuHrefs.includes("/admin/users")) return [];
  return userSubmenuPermissions.filter((href) => userSubmenuAllowedFor(userKind, userRole, href));
}

function allowedAvatarsFor(userKind: AdminUserKind, userRole: string, coachPlanKey: CoachPartnerPlanKey, userStatus = "activo") {
  if (userKind === "online") {
    if (isRestrictedAccessStatus(userStatus)) return [];
    if (isInvitedStatus(userStatus)) return allAvatarIds;
    return userRole === "Cliente Online Pagado" || userRole === "Paid online client" ? allAvatarIds : onlineBasicAvatarIds;
  }
  if (userKind === "coach-partner") return coachPartnerPlans[coachPlanKey].avatarIds;
  if (userKind === "internal-coach") return internalCoachAvatarsFor(userRole);
  if (userKind === "outplacement-rh") return outplacementRhAvatarsFor(userRole);
  return allAvatarIds;
}

function outplacementRhAvatarsFor(_userRole: string) {
  return allAvatarIds;
}

function toggleItem<T>(items: T[], item: T, checked: boolean) {
  if (checked) return items.includes(item) ? items : [...items, item];
  return items.filter((currentItem) => currentItem !== item);
}

function calculateCoachPartnerPool(plan: (typeof coachPartnerPlans)[CoachPartnerPlanKey]) {
  if (plan.unlimited) return Infinity;
  return plan.baseCreditsPerCycle * plan.groups * plan.studentsPerGroup * plan.cycles;
}

function calculateCoachPartnerStudentCredits(plan: (typeof coachPartnerPlans)[CoachPartnerPlanKey]) {
  if (plan.unlimited) return Infinity;
  return plan.baseCreditsPerCycle * plan.studentCycles;
}

function creditsForUserRole(
  userKind: AdminUserKind,
  userRole: string,
  coachPlan: (typeof coachPartnerPlans)[CoachPartnerPlanKey],
  formData: FormData,
  selectedUser?: DemoUser,
  canEditOnlineCredits = false,
  userStatus = "activo",
) {
  if (userKind === "coach-partner") return coachPlan.unlimited ? 0 : calculateCoachPartnerPool(coachPlan);
  if (hasUnlimitedCredits(userKind, userRole)) return 0;
  if (userKind === "outplacement-rh") return Number(formData.get("credits") || calculateOutplacementRoleCredits(userRole));
  if (userKind === "online") {
    if (isInvitedStatus(userStatus)) return onlineBaselineCredits;
    if (!canEditOnlineCredits) return selectedUser?.credits ?? onlineBaselineCredits;
    return Number(formData.get("credits") || selectedUser?.credits || onlineBaselineCredits);
  }
  return Number(formData.get("credits") || 0);
}

function calculateOutplacementRoleCredits(userRole: string, avatarIds = outplacementRhAvatarsFor(userRole)) {
  return avatarIds.reduce((total, avatarId) => total + (skillRegistry[avatarId]?.baseCredits ?? 0), 0) * 3;
}

function outplacementCurrentCredits(selectedUser: DemoUser | undefined, userRole: string) {
  if (selectedUser) return selectedUser.credits;
  return calculateOutplacementRoleCredits(userRole);
}

function coachPartnerLicenseForOrganization(organization?: string) {
  return coachPartnerOrganizationLicenses[organization || ""] ?? coachPartnerOrganizationLicenses["Partner Ejecutivo Norte"];
}

function coachPartnerLicenseFieldValue(key: string, license: { licenseNumber: string; licenseStart: string; licenseEnd: string }) {
  if (key.includes("inicio") || key.includes("start")) return license.licenseStart;
  if (key.includes("vigencia") || key.includes("end")) return license.licenseEnd;
  return license.licenseNumber;
}

function formatPlanNumber(value: number, language: "es" | "en") {
  if (!Number.isFinite(value)) return language === "es" ? "Ilimitado" : "Unlimited";
  return value.toLocaleString(language === "es" ? "es-MX" : "en-US");
}

function organizationFieldForUserKind(userKind: AdminUserKind, organization: string, fixedEmpleateYaOrg: boolean, placeholder: string, onChange: (value: string) => void) {
  if (fixedEmpleateYaOrg) return <Input name="organization" value={empleateYaOrganization} readOnly />;
  if (userKind === "outplacement-rh") {
    const value = organization || organizationCatalog["outplacement-rh"][0];
    return (
      <>
        <Input value={value} readOnly />
        <input type="hidden" name="organization" value={value} />
      </>
    );
  }
  if (usesOrganizationCatalog(userKind)) return <Select name="organization" value={organization || organizationCatalog[userKind][0]} onChange={(event) => onChange(event.target.value)}>{organizationCatalog[userKind].map((item) => <option key={item}>{item}</option>)}</Select>;
  return <Input name="organization" placeholder={placeholder} value={organization} onChange={(event) => onChange(event.target.value)} />;
}

function statusLabel(status: string, language: "es" | "en") {
  if (status === "borrado_logico") return "borrado lógico";
  if (status === "logical_delete") return "logical delete";
  return status;
}

function activeStatusValue(language: "es" | "en") {
  return language === "es" ? "activo" : "active";
}

function isInvitedStatus(status: string) {
  return status === "invitado" || status === "invited";
}

function isActiveStatus(status: string) {
  return status === "activo" || status === "active";
}

function isRestrictedAccessStatus(status: string) {
  return ["pendiente", "pending", "bloqueado", "blocked", "borrado_logico", "logical_delete"].includes(status);
}

function isLockedOrDeletedStatus(status: string) {
  return ["bloqueado", "blocked", "borrado_logico", "logical_delete"].includes(status);
}

function isTemporarySupervisorRole(role: string) {
  const normalized = normalizeRole(role);
  return normalized.includes("supervisor delegado temporal") || normalized.includes("temporary delegated supervisor");
}

function baseSupportRoleForDelegation(selectedUser: DemoUser | undefined, nextRole: string) {
  const previousRole = selectedUser?.extraData?.previous_support_role;
  if (typeof previousRole === "string" && previousRole.trim()) return previousRole;
  if (selectedUser && !isTemporarySupervisorRole(selectedUser.role)) return selectedUser.role;
  return nextRole === "Temporary delegated supervisor" ? "Administrative support" : "Apoyo administrativo";
}

function delegationWindowIsActive(startValue: string, endValue: string) {
  const start = parseDateOnly(startValue);
  const end = parseDateOnly(endValue);
  if (!start || !end) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today >= start && today <= end;
}

function parseDateOnly(value: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isDefaultCampaignApproverRole(userRole: string) {
  const role = normalizeRole(userRole);
  return role.includes("administrador rh") || role.includes("hr administrator") || role.includes("aprobador de campa") || role.includes("campaign approver");
}

function isHrAdminRole(userRole: string) {
  const role = normalizeRole(userRole);
  return role.includes("administrador rh") || role.includes("hr administrator");
}

function isCoachPartnerPrincipalRole(userRole: string) {
  const role = normalizeRole(userRole);
  return role.includes("coach partner principal") || role.includes("main coach partner");
}

function isMainOrganizationRole(userKind: AdminUserKind, userRole: string) {
  return (userKind === "outplacement-rh" && isHrAdminRole(userRole)) || (userKind === "coach-partner" && isCoachPartnerPrincipalRole(userRole));
}

function hasActivePrincipalForOrganization(users: DemoUser[], userKind: AdminUserKind, userRole: string, organization: string, currentEmail?: string) {
  return users.some((user) => (
    user.kind === userKind
    && user.organization === organization
    && user.email !== currentEmail
    && user.status !== "borrado_logico"
    && user.status !== "logical_delete"
    && isMainOrganizationRole(user.kind, user.role)
    && samePrincipalFamily(userRole, user.role)
  ));
}

function samePrincipalFamily(leftRole: string, rightRole: string) {
  return (isHrAdminRole(leftRole) && isHrAdminRole(rightRole)) || (isCoachPartnerPrincipalRole(leftRole) && isCoachPartnerPrincipalRole(rightRole));
}

function canCurrentOperatorCreateMainOrganizationRole(operatorRole: string, hasSuperAdminAuthority: boolean) {
  return hasSuperAdminAuthority || [
    "Apoyo coach partner",
    "Apoyo administrativo",
    "Operativo outplacement",
  ].includes(operatorRole);
}

function buildBalanceMovements(user: DemoUser, creditAuditEvents: CreditAuditEvent[], language: "es" | "en"): BalanceMovement[] {
  const defaultConcept = copy[language].balanceDefaultConcept;
  const seededDemoMovements: BalanceMovement[] = user.email === "laura@email.com"
    ? [
        { date: "2026-06-05", concept: "ScoreX | evalua CV para ATS", credits: 0, consumption: -skillRegistry.scorex.baseCredits },
        { date: "2026-06-08", concept: "Compra de 999 creditos | Referencia Stripe: 9999999999", credits: 500, consumption: 0 },
      ]
    : [];
  const userAuditMovements = creditAuditEvents
    .filter((event) => event.userEmail === user.email)
    .map((event) => ({
      date: isoDateFromDisplayDate(event.createdAt),
      concept: language === "es" ? `Ajuste manual de creditos | ${event.actor}` : `Manual credit adjustment | ${event.actor}`,
      credits: event.amount > 0 ? event.amount : 0,
      consumption: event.amount < 0 ? event.amount : 0,
    }));

  return [
    { date: "2026-06-01", concept: defaultConcept, credits: onlineBaselineCredits, consumption: 0 },
    ...seededDemoMovements,
    ...userAuditMovements,
  ].sort((left, right) => left.date.localeCompare(right.date));
}

function balanceTotalForUser(user: DemoUser, creditAuditEvents: CreditAuditEvent[], language: "es" | "en") {
  return buildBalanceMovements(user, creditAuditEvents, language).reduce((total, movement) => total + movement.credits + movement.consumption, 0);
}

function filterBalanceMovements(movements: BalanceMovement[], period: BalancePeriod, startDate: string, endDate: string) {
  const today = "2026-06-17";
  const ranges: Record<Exclude<BalancePeriod, "custom">, [string, string]> = {
    day: [today, today],
    week: ["2026-06-15", "2026-06-21"],
    month: ["2026-06-01", "2026-06-30"],
  };
  const [start, end] = period === "custom" ? [startDate || "0000-01-01", endDate || "9999-12-31"] : ranges[period];
  return movements.filter((movement) => movement.date >= start && movement.date <= end);
}

function isoDateFromDisplayDate(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return "2026-06-17";
}

function eventTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function formatBalanceDate(value: string, language: "es" | "en") {
  return new Date(`${value}T12:00:00`).toLocaleDateString(language === "es" ? "es-MX" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function formatSignedCredits(value: number) {
  return value > 0 ? `+${value.toLocaleString("es-MX")}` : value.toLocaleString("es-MX");
}

function maskStripeId(value: string) {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function menuAllowedFor(userKind: AdminUserKind, userRole: string, href: string) {
  if (userKind === "online") return false;
  if (userKind === "coach-partner") return ["/admin/users", "/admin/users/students", "/admin/groups", "/admin/reports", "/admin/coaching"].includes(href);
  if (userKind === "student") return false;
  if (userKind === "outplacement-rh") return outplacementCompanyMenuAllowed(userRole, href);
  if (userKind === "outplacement-employee") return false;
  if (userKind === "internal-coach") return ["/admin/coaching", "/admin/groups", "/admin/users/students", "/admin/reports", "/admin/feedback"].includes(href);
  if (userKind === "super-admin-support") return supportRoleMenuAllowed(userRole, href);
  return true;
}

function userSubmenuAllowedFor(userKind: AdminUserKind, userRole: string, href: string) {
  if (userKind === "super-admin-support") return supportRoleUserSubmenuAllowed(userRole, href);
  if (userKind === "coach-partner") return href === "/admin/users/coach-partner";
  if (userKind === "outplacement-rh") return href === "/admin/users/outplacement-rh";
  if (userKind === "internal-coach") return false;
  return href === "/admin/users/online";
}

function internalCoachAvatarsFor(userRole: string) {
  const role = normalizeRole(userRole);
  const profile = internalCoachAvatarProfiles.find((item) => item.match.some((keyword) => role.includes(keyword)));
  if (!profile || profile.avatarIds.length === 0) return allAvatarIds;
  return profile.avatarIds;
}

function shouldCascadePermissionsForRole(userKind: AdminUserKind, roleChanged: boolean, planChanged: boolean) {
  return (roleChanged || planChanged) && (userKind === "internal-coach" || userKind === "online" || userKind === "super-admin-support" || userKind === "coach-partner" || userKind === "outplacement-rh");
}

function supportRoleMenuAllowed(userRole: string, href: string) {
  const role = normalizeRole(userRole);
  if (role.includes("supervisor delegado") || role.includes("temporary delegated")) return true;
  if (role.includes("cobranza") || role.includes("collections")) return ["/admin", "/admin/credits", "/admin/payments", "/admin/reports", "/admin/audit"].includes(href);
  if (role.includes("outplacement")) return ["/admin", "/admin/users", "/admin/users/outplacement-employees", "/admin/organizations", "/admin/campaigns", "/admin/coaching", "/admin/reports", "/admin/audit"].includes(href);
  if (role.includes("coach partner")) return ["/admin", "/admin/users", "/admin/users/students", "/admin/organizations", "/admin/groups", "/admin/coaching", "/admin/reports", "/admin/audit"].includes(href);
  return ["/admin", "/admin/users", "/admin/users/students", "/admin/users/outplacement-employees", "/admin/organizations", "/admin/reports"].includes(href);
}

function supportRoleUserSubmenuAllowed(userRole: string, href: string) {
  const role = normalizeRole(userRole);
  if (role.includes("supervisor delegado") || role.includes("temporary delegated")) return true;
  if (role.includes("cobranza") || role.includes("collections")) return false;
  if (role.includes("outplacement")) return href === "/admin/users/outplacement-rh";
  if (role.includes("coach partner")) return href === "/admin/users/coach-partner";
  return ["/admin/users/online", "/admin/users/coach-partner", "/admin/users/outplacement-rh"].includes(href);
}

function outplacementCompanyMenuAllowed(userRole: string, href: string) {
  const role = normalizeRole(userRole);
  const operationalHrefs = ["/admin/users", "/admin/users/outplacement-employees", "/admin/campaigns", "/admin/coaching", "/admin/reports"];
  if (role.includes("coach de outplacement") || role.includes("outplacement coach")) return ["/admin/users/outplacement-employees", "/admin/campaigns", "/admin/coaching", "/admin/reports"].includes(href);
  return operationalHrefs.includes(href);
}

function normalizeRole(role: string) {
  return role.toLowerCase();
}

function usesOrganizationCatalog(userKind: AdminUserKind): userKind is "coach-partner" | "student" | "outplacement-rh" | "outplacement-employee" {
  return userKind === "coach-partner" || userKind === "student" || userKind === "outplacement-rh" || userKind === "outplacement-employee";
}

function usesFixedEmpleateYaOrganization(userKind: AdminUserKind) {
  return userKind === "online" || userKind === "super-admin-support" || userKind === "internal-coach";
}

function hasUnlimitedCredits(userKind: AdminUserKind, _userRole = "") {
  return userKind === "super-admin-support" || userKind === "internal-coach";
}

function usesCareerDataFields(userKind: AdminUserKind) {
  return userKind === "online" || userKind === "student" || userKind === "outplacement-employee";
}

function summarizeCoachAssignments(assignments: CoachAssignment[], language: "es" | "en") {
  if (!assignments.length) {
    return {
      dateRange: "-",
      modality: "-",
      averageNps: "-",
    };
  }
  const startDate = assignments.map((assignment) => assignment.startDate).sort()[0];
  const endDate = assignments.map((assignment) => assignment.endDate).sort().at(-1) ?? startDate;
  const modalities = Array.from(new Set(assignments.map((assignment) => modalityLabel(assignment.modality, language))));
  const averageNps = Math.round(assignments.reduce((total, assignment) => total + assignment.nps, 0) / assignments.length);
  return {
    dateRange: `${formatShortDate(startDate, language)} - ${formatShortDate(endDate, language)}`,
    modality: modalities.join(" / "),
    averageNps: `${averageNps}`,
  };
}

function modalityLabel(modality: CoachAssignment["modality"], language: "es" | "en") {
  const labels = {
    es: { online: "En linea", presential: "Presencial", hybrid: "Mixta" },
    en: { online: "Online", presential: "In person", hybrid: "Hybrid" },
  } as const;
  return labels[language][modality];
}

function formatShortDate(value: string, language: "es" | "en") {
  return new Date(`${value}T12:00:00`).toLocaleDateString(language === "es" ? "es-MX" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function buildExtraData(fields: readonly string[], formData: FormData, selectedUser?: DemoUser, userKind?: AdminUserKind) {
  const extraData = fields.reduce<Record<string, string | boolean>>((currentExtraData, field) => {
    const key = extraFieldKey(field);
    currentExtraData[key] = isBooleanExtraField(field) ? formData.get(`extra-${key}`) === "on" : String(formData.get(`extra-${key}`) || selectedUser?.extraData?.[key] || "").trim();
    return currentExtraData;
  }, {});
  if (userKind === "online") {
    extraData.privacyAccepted = selectedUser?.extraData?.privacyAccepted === true || selectedUser?.extraData?.privacyAccepted === "true";
  }
  return extraData;
}

function extraFieldKey(field: string) {
  return field.toLowerCase().replaceAll(" ", "_").replace(/[^a-z0-9_]/g, "");
}

function isBooleanExtraField(field: string) {
  const normalized = field.toLowerCase();
  return normalized.includes("puede aprobar") || normalized.includes("can approve");
}

function isDateLikeField(field: string) {
  const normalized = field.toLowerCase();
  return normalized.includes("fecha") || normalized.includes("date") || normalized.includes("vigencia") || normalized.includes("start") || normalized.includes("end");
}

function readStoredJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

function mergeMissingDemoUsers(storedUsers: DemoUser[]) {
  const storedEmails = new Set(storedUsers.map((user) => user.email));
  const missingUsers = demoUsers.filter((user) => !storedEmails.has(user.email));
  return missingUsers.length ? [...storedUsers, ...missingUsers] : storedUsers;
}

function ownerOptionFor(owner: string) {
  return internalOwners.find((item) => item.startsWith(owner)) ?? internalOwners[0];
}

function operatorForProfile(profile: string, role = "") {
  if (profile === "super_admin_support") {
    if (role === "temporary_delegate") return { name: "Monica Reyes", role: "Supervisor delegado temporal" } as const;
    if (role === "collections_support") return { name: "Daniela Ponce", role: "Apoyo cobranza" } as const;
    if (role === "outplacement_operator") return { name: "Ricardo Vega", role: "Operativo outplacement" } as const;
    if (role === "coach_partner_support") return { name: "Camila Ortega", role: "Apoyo coach partner" } as const;
    return { name: "Valeria Nunez", role: "Apoyo administrativo" } as const;
  }
  return { name: "Leo Galvez", role: "Super Admin" } as const;
}

function delegatedSupervisorIsActive(operator: { name: string; role: string }, users: DemoUser[]) {
  if (operator.role !== "Supervisor delegado temporal") return false;
  const delegatedUser = users.find((user) => user.kind === "super-admin-support" && user.role === "Supervisor delegado temporal" && user.name === operator.name);
  if (!delegatedUser || !isActiveStatus(delegatedUser.status)) return false;
  const start = extraDataDate(delegatedUser.extraData, ["fecha_de_delegacion", "delegation_start_date"]);
  const end = extraDataDate(delegatedUser.extraData, ["fecha_fin_delegacion", "delegation_end_date"]);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return (!start || today >= start) && (!end || today <= end);
}

function extraDataDate(extraData: DemoUser["extraData"], keys: string[]) {
  const value = keys.map((key) => extraData?.[key]).find((item) => typeof item === "string" && item.length > 0);
  if (typeof value !== "string") return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

function StatusPill({ status, language }: { status: string; language: "es" | "en" }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("activo") || normalized.includes("active")
    ? "bg-emerald-50 text-emerald-700"
    : normalized.includes("bloqueado") || normalized.includes("blocked") || normalized.includes("borrado") || normalized.includes("delete")
      ? "bg-rose-50 text-rose-700"
      : normalized.includes("pendiente") || normalized.includes("pending")
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-black ${tone}`}>{statusLabel(status, language)}</span>;
}

function NoticeDialog({ title, acceptLabel, message, onClose }: { title: string; acceptLabel: string; message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="admin-users-notice-title">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-purple-100 bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">{title}</p>
        <h2 id="admin-users-notice-title" className="mt-3 text-2xl font-black text-slate-950">{message}</h2>
        <div className="mt-5 flex justify-end">
          <Button type="button" className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]" onClick={onClose}>{acceptLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function CreditAuditLog({ title, empty, events }: { title: string; empty: string; events: CreditAuditEvent[] }) {
  const orderedEvents = [...events].sort((left, right) => eventTime(right.createdAt) - eventTime(left.createdAt));
  return (
    <section className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      {events.length ? (
        <div className="mt-3 max-h-[520px] overflow-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr>
                <Th>Usuario</Th>
                <Th>Movimiento</Th>
                <Th>Saldo</Th>
                <Th>Actor</Th>
                <Th>Fecha</Th>
              </tr>
            </thead>
            <tbody>
              {orderedEvents.map((event) => (
                <tr key={event.id} className="border-b border-slate-100 last:border-0">
                  <Td><strong className="block text-slate-950">{event.userName}</strong><span className="text-xs text-slate-500">{event.userEmail}</span></Td>
                  <Td><strong className={event.amount >= 0 ? "text-emerald-700" : "text-rose-700"}>{event.amount >= 0 ? "+" : ""}{event.amount}</strong></Td>
                  <Td>{event.balanceBefore} -&gt; {event.balanceAfter}</Td>
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

function ChecklistCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-lg font-black text-slate-950">{title}</h4>
      {children}
    </section>
  );
}

function PermissionCheck({ checked, title, detail, onChange }: { checked: boolean; title: string; detail: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
      <input type="checkbox" className="mt-1" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="min-w-0">
        <span className="block font-black text-slate-900">{title}</span>
        <small className="block truncate font-semibold text-slate-500">{detail}</small>
      </span>
    </label>
  );
}

