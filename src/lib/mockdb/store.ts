import { randomUUID } from "crypto";
import { modulePricingSeed } from "@/ai/skillRegistry";

export type CreditLedgerType = "purchase" | "usage" | "refund" | "adjustment";

export type CreditWallet = {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string;
};

export type CreditLedger = {
  id: string;
  userId: string;
  type: CreditLedgerType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedModuleRunId?: string;
  createdAt: string;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetRole?: string;
  status: "active" | "archived" | "deleted";
  createdAt: string;
  updatedAt: string;
};

export type StoredFile = {
  id: string;
  userId: string;
  projectId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  fileType: string;
  createdAt: string;
};

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

export type ArtifactVersion = {
  id: string;
  artifactId: string;
  version: number;
  contentJson?: unknown;
  htmlContent?: string;
  storagePathDocx?: string;
  storagePathPdf?: string;
  createdAt: string;
};

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

export type AuditLog = {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: unknown;
  ipAddress?: string;
  createdAt: string;
};

export type MockDb = {
  wallets: CreditWallet[];
  ledger: CreditLedger[];
  projects: Project[];
  files: StoredFile[];
  artifacts: Artifact[];
  artifactVersions: ArtifactVersion[];
  moduleRuns: ModuleRun[];
  auditLogs: AuditLog[];
  modulePricing: typeof modulePricingSeed;
};

declare global {
  var employabilityMockDb: MockDb | undefined;
}

export function getStore(): MockDb {
  if (!globalThis.employabilityMockDb) {
    globalThis.employabilityMockDb = {
      wallets: [],
      ledger: [],
      projects: [],
      files: [],
      artifacts: [],
      artifactVersions: [],
      moduleRuns: [],
      auditLogs: [],
      modulePricing: modulePricingSeed,
    };
  }

  return globalThis.employabilityMockDb;
}

export const newId = () => randomUUID();

export const now = () => new Date().toISOString();
