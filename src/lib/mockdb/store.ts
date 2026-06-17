import { randomUUID } from "crypto";
import { modulePricingSeed } from "@/ai/skillRegistry";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  country?: string;
  state?: string;
  city?: string;
  passwordHash: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: "active" | "suspended" | "deleted";
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalProfile = {
  id: string;
  userId: string;
  targetRole?: string;
  seniority?: string;
  industry?: string;
  yearsExperience?: number;
  lastRole?: string;
  lastCompany?: string;
  educationLevel?: string;
  languages: string[];
  linkedinUrl?: string;
  jobSearchStatus?: string;
  employmentType?: string;
  desiredSalaryRange?: string;
  desiredSalaryAmount?: string;
  preferredWorkMode?: string;
  geographicAvailability?: string;
  createdAt: string;
  updatedAt: string;
};

export type PrivacyConsent = {
  id: string;
  userId: string;
  consentType: "privacy_notice" | "terms" | "ai_processing" | "image_processing" | "artifact_storage";
  accepted: boolean;
  version: string;
  ipAddress?: string;
  acceptedAt: string;
};

export type CreditWallet = { id: string; userId: string; balance: number; currency: string; updatedAt: string };
export type CreditLedger = {
  id: string;
  userId: string;
  type: "purchase" | "usage" | "refund" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedModuleRunId?: string;
  createdAt: string;
};
export type Project = { id: string; userId: string; title: string; description?: string; targetRole?: string; status: "active" | "archived" | "deleted"; createdAt: string; updatedAt: string };
export type StoredFile = { id: string; userId: string; projectId?: string; originalName: string; mimeType: string; size: number; storagePath: string; fileType: string; createdAt: string };
export type Artifact = {
  id: string;
  userId: string;
  projectId?: string;
  type: string;
  title: string;
  description?: string;
  moduleId: string;
  prompt: string;
  contentJson?: unknown;
  htmlContent?: string;
  storagePathDocx?: string;
  storagePathPdf?: string;
  version: number;
  status: "draft" | "final" | "archived" | "deleted";
  creditsCharged: number;
  createdAt: string;
  updatedAt: string;
};
export type ArtifactVersion = { id: string; artifactId: string; version: number; contentJson?: unknown; htmlContent?: string; storagePathDocx?: string; storagePathPdf?: string; createdAt: string };
export type ModuleRun = {
  id: string;
  userId: string;
  projectId?: string;
  sessionId?: string;
  moduleId: string;
  inputJson?: unknown;
  outputJson?: unknown;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  estimatedCostMxn: number;
  creditsCharged: number;
  status: "planned" | "running" | "success" | "failed" | "cancelled";
  errorMessage?: string;
  createdAt: string;
};
export type AuditLog = { id: string; userId?: string; action: string; entityType: string; entityId?: string; metadataJson?: unknown; ipAddress?: string; createdAt: string };
export type CatalogItem = {
  id: string;
  catalogCode: string;
  code: string;
  labelEs: string;
  labelEn?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  sortOrder: number;
  status: "active" | "inactive" | "archived";
  metadataJson?: unknown;
  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
};

export type Catalog = {
  code: string;
  name: string;
  description?: string;
  locked: boolean;
  items: CatalogItem[];
};

export type AiModelCost = {
  provider: string;
  model: string;
  inputUsdPer1m: number;
  outputUsdPer1m: number;
  cachedInputUsdPer1m?: number;
  useCase: string;
  isDefault?: boolean;
};

export type ScreenTokenBudget = {
  screenKey: string;
  label: string;
  moduleId?: string;
  absorptionMode: "absorbed" | "charged" | "included_in_license";
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  minCredits: number;
  recommendedCredits: number;
  notes?: string;
};

export type CreditPolicy = {
  id: string;
  name: string;
  status: "draft" | "active" | "archived";
  usdToMxnRate: number;
  creditValueMxn: number;
  grossMarginPct: number;
  sourceNote: string;
  effectiveFrom: string;
  modelCosts: AiModelCost[];
  screenBudgets: ScreenTokenBudget[];
  updatedAt: string;
};

export type MockDb = {
  users: User[];
  profiles: ProfessionalProfile[];
  consents: PrivacyConsent[];
  wallets: CreditWallet[];
  ledger: CreditLedger[];
  projects: Project[];
  files: StoredFile[];
  artifacts: Artifact[];
  artifactVersions: ArtifactVersion[];
  moduleRuns: ModuleRun[];
  auditLogs: AuditLog[];
  modulePricing: typeof modulePricingSeed;
  catalogs: Catalog[];
  creditPolicy: CreditPolicy;
};

declare global {
  var employabilityMockDb: MockDb | undefined;
}

export function getStore(): MockDb {
  if (!globalThis.employabilityMockDb) {
    globalThis.employabilityMockDb = {
      users: [],
      profiles: [],
      consents: [],
      wallets: [],
      ledger: [],
      projects: [],
      files: [],
      artifacts: [],
      artifactVersions: [],
      moduleRuns: [],
      auditLogs: [],
      modulePricing: modulePricingSeed,
      catalogs: createCatalogSeed(),
      creditPolicy: createCreditPolicySeed(),
    };
  }
  return globalThis.employabilityMockDb;
}

export const newId = () => randomUUID();
export const now = () => new Date().toISOString();

export function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function createCatalogSeed(): Catalog[] {
  const createdAt = now();
  return [
    {
      code: "user_types",
      name: "Tipos de usuario",
      description: "Clasifica usuarios online, coaching, empresa y emprendedor.",
      locked: true,
      items: [
        catalogItem("user_types", "online_user", "Usuario online", "Online user", 10, createdAt),
        catalogItem("user_types", "coaching_client", "Cliente coaching 1o1", "1:1 coaching client", 20, createdAt),
        catalogItem("user_types", "company_participant", "Ex-colaborador empresa", "Company former employee", 30, createdAt),
        catalogItem("user_types", "entrepreneur_client", "Cliente emprendedor", "Entrepreneur client", 40, createdAt),
      ],
    },
    {
      code: "organization_types",
      name: "Tipos de organización",
      description: "Empresas, emprendedores y Empléate YA.",
      locked: true,
      items: [
        catalogItem("organization_types", "empleate_ya", "Empléate YA", "Empléate YA", 10, createdAt),
        catalogItem("organization_types", "company", "Empresa", "Company", 20, createdAt),
        catalogItem("organization_types", "entrepreneur", "Emprendedor / franquiciatario", "Entrepreneur / franchisee", 30, createdAt),
      ],
    },
    {
      code: "membership_roles",
      name: "Roles y permisos",
      description: "Roles base para acceso multi-tenant.",
      locked: true,
      items: [
        catalogItem("membership_roles", "super_admin", "Super admin", "Super admin", 10, createdAt),
        catalogItem("membership_roles", "company_admin", "Administrador empresa", "Company admin", 20, createdAt),
        catalogItem("membership_roles", "company_recruiter", "Reclutador / selección", "Recruiter", 30, createdAt),
        catalogItem("membership_roles", "entrepreneur_owner", "Responsable emprendedor", "Entrepreneur owner", 40, createdAt),
        catalogItem("membership_roles", "entrepreneur_collaborator", "Colaborador emprendedor", "Entrepreneur collaborator", 50, createdAt),
        catalogItem("membership_roles", "coach", "Coach", "Coach", 60, createdAt),
      ],
    },
    {
      code: "campaign_statuses",
      name: "Estados de campaña",
      description: "Ciclo de vida de campañas de empresas y emprendedores.",
      locked: false,
      items: [
        catalogItem("campaign_statuses", "draft", "Borrador", "Draft", 10, createdAt),
        catalogItem("campaign_statuses", "pending_approval", "Pendiente de aprobación", "Pending approval", 20, createdAt),
        catalogItem("campaign_statuses", "active", "Activa", "Active", 30, createdAt),
        catalogItem("campaign_statuses", "completed", "Completada", "Completed", 40, createdAt),
        catalogItem("campaign_statuses", "cancelled", "Cancelada", "Cancelled", 50, createdAt),
      ],
    },
  ];
}

function catalogItem(catalogCode: string, code: string, labelEs: string, labelEn: string, sortOrder: number, createdAt: string): CatalogItem {
  return {
    id: randomUUID(),
    catalogCode,
    code,
    labelEs,
    labelEn,
    sortOrder,
    status: "active",
    createdAt,
    updatedAt: createdAt,
  };
}

function createCreditPolicySeed(): CreditPolicy {
  const createdAt = now();
  return {
    id: randomUUID(),
    name: "Política inicial de créditos",
    status: "active",
    usdToMxnRate: 17.46,
    creditValueMxn: 1,
    grossMarginPct: 0.65,
    sourceNote: "Referencia inicial editable. Actualizar con precio oficial del proveedor y tipo de cambio vigente antes de activar pagos reales.",
    effectiveFrom: createdAt,
    updatedAt: createdAt,
    modelCosts: [
      { provider: "openai", model: "gpt-4.1-nano", inputUsdPer1m: 0.1, outputUsdPer1m: 0.4, useCase: "FAQ, clasificación, prompts cortos", isDefault: false },
      { provider: "openai", model: "gpt-4.1-mini", inputUsdPer1m: 0.4, outputUsdPer1m: 1.6, useCase: "Gateway, borradores, reportes medios", isDefault: true },
      { provider: "openai", model: "gpt-4.1", inputUsdPer1m: 2, outputUsdPer1m: 8, useCase: "CVs complejos, análisis profundo, optimización final", isDefault: false },
    ],
    screenBudgets: [
      { screenKey: "home_faq", label: "Home FAQ / chat inicial", absorptionMode: "absorbed", estimatedInputTokens: 900, estimatedOutputTokens: 450, maxInputTokens: 1500, maxOutputTokens: 700, minCredits: 0, recommendedCredits: 0, notes: "Costo absorbido por marketing. Requiere límites por sesión/IP." },
      { screenKey: "gateway_plan", label: "Gateway - analizar plan", absorptionMode: "absorbed", estimatedInputTokens: 1200, estimatedOutputTokens: 700, maxInputTokens: 2200, maxOutputTokens: 1100, minCredits: 0, recommendedCredits: 0, notes: "Puede quedar gratis para conversión, con límite." },
      { screenKey: "scorex_initial", label: "ScoreX inicial", moduleId: "scorex", absorptionMode: "charged", estimatedInputTokens: 9000, estimatedOutputTokens: 3500, maxInputTokens: 16000, maxOutputTokens: 6500, minCredits: 35, recommendedCredits: 55 },
      { screenKey: "scorex_final", label: "ScoreX final", moduleId: "scorex", absorptionMode: "charged", estimatedInputTokens: 10000, estimatedOutputTokens: 4000, maxInputTokens: 18000, maxOutputTokens: 7000, minCredits: 45, recommendedCredits: 65 },
      { screenKey: "scorex_vacancy", label: "ScoreX evaluación vs vacante", moduleId: "scorex", absorptionMode: "charged", estimatedInputTokens: 12000, estimatedOutputTokens: 4500, maxInputTokens: 22000, maxOutputTokens: 8000, minCredits: 55, recommendedCredits: 80 },
      { screenKey: "optim_create_cv", label: "Optim crear CV desde cero", moduleId: "optim", absorptionMode: "charged", estimatedInputTokens: 18000, estimatedOutputTokens: 9000, maxInputTokens: 32000, maxOutputTokens: 15000, minCredits: 180, recommendedCredits: 240 },
      { screenKey: "optim_adapt_cv", label: "Optim adaptar CV a vacante", moduleId: "optim", absorptionMode: "charged", estimatedInputTokens: 22000, estimatedOutputTokens: 9000, maxInputTokens: 38000, maxOutputTokens: 16000, minCredits: 220, recommendedCredits: 290 },
      { screenKey: "company_full_cycle", label: "Ciclo completo outplacement", absorptionMode: "included_in_license", estimatedInputTokens: 90000, estimatedOutputTokens: 42000, maxInputTokens: 140000, maxOutputTokens: 65000, minCredits: 0, recommendedCredits: 650, notes: "Base para calcular fee por ex-empleado o bolsa incluida por campaña." },
    ],
  };
}
