import { getStore, newId, now, type CreditLedger } from "@/lib/mockdb/store";

export const STAR_AVATAR_MODULES = ["optim", "mr_boost_linked", "tommy_lee_picture", "indiana_jobs", "miss_quest"] as const;

export function isStarAvatar(moduleId: string) {
  return (STAR_AVATAR_MODULES as readonly string[]).includes(moduleId);
}

export function getWallet(userId: string) {
  const db = getStore();
  let wallet = db.wallets.find((item) => item.userId === userId);
  if (!wallet) {
    wallet = { id: newId(), userId, balance: 0, currency: "MXN", updatedAt: now() };
    db.wallets.push(wallet);
  }
  return wallet;
}

export function getModulePrice(moduleId: string) {
  return getStore().modulePricing.find((price) => price.moduleId === moduleId && price.isActive)?.baseCredits ?? 0;
}

export function estimateCredits(moduleIds: string[]) {
  return moduleIds.reduce((total, moduleId) => total + getModulePrice(moduleId), 0);
}

export function hasPurchasedCredits(userId: string) {
  return getStore().ledger.some((entry) => entry.userId === userId && entry.type === "purchase" && entry.amount > 0);
}

export function getTrialUsedModules(userId: string) {
  const used = getStore().auditLogs
    .filter((entry) => entry.userId === userId && entry.action === "avatar.trial_used")
    .map((entry) => {
      const metadata = entry.metadataJson as { moduleId?: string } | undefined;
      return metadata?.moduleId;
    })
    .filter((moduleId): moduleId is string => Boolean(moduleId));
  return Array.from(new Set(used));
}

export function assertSufficientCredits(userId: string, amount: number) {
  const wallet = getWallet(userId);
  if (wallet.balance < amount) throw new Error("INSUFFICIENT_CREDITS");
  return wallet;
}

export function assertAvatarAccess(userId: string, moduleIds: string[], amount: number) {
  const purchased = hasPurchasedCredits(userId);
  if (purchased) {
    assertSufficientCredits(userId, amount);
    return { mode: "paid" as const, creditsToCharge: amount, trialModules: [] };
  }

  const starModules = Array.from(new Set(moduleIds.filter(isStarAvatar)));
  if (starModules.length > 0) {
    const error = new Error("STAR_AVATAR_REQUIRES_PURCHASE");
    error.cause = { blockedModules: starModules };
    throw error;
  }

  const usedModules = getTrialUsedModules(userId);
  const blockedModules = Array.from(new Set(moduleIds.filter((moduleId) => usedModules.includes(moduleId))));
  if (blockedModules.length > 0) {
    const error = new Error("AVATAR_TRIAL_USED");
    error.cause = { blockedModules };
    throw error;
  }

  assertSufficientCredits(userId, amount);
  return { mode: "trial" as const, creditsToCharge: amount, trialModules: Array.from(new Set(moduleIds)) };
}

export function recordAvatarTrial(userId: string, moduleIds: string[], relatedModuleRunId?: string) {
  const db = getStore();
  for (const moduleId of Array.from(new Set(moduleIds))) {
    db.auditLogs.push({
      id: newId(),
      userId,
      action: "avatar.trial_used",
      entityType: "module",
      entityId: moduleId,
      metadataJson: { moduleId, relatedModuleRunId },
      createdAt: now(),
    });
  }
}

export function addCredits(userId: string, amount: number, description = "Compra mock de creditos") {
  const wallet = getWallet(userId);
  const balanceBefore = wallet.balance;
  wallet.balance += amount;
  wallet.updatedAt = now();
  const entry: CreditLedger = { id: newId(), userId, type: "purchase", amount, balanceBefore, balanceAfter: wallet.balance, description, createdAt: now() };
  getStore().ledger.push(entry);
  return { wallet, entry };
}

export function grantCredits(userId: string, amount: number, description: string, adminUserId?: string) {
  const wallet = getWallet(userId);
  const balanceBefore = wallet.balance;
  wallet.balance += amount;
  wallet.updatedAt = now();
  const entry: CreditLedger = { id: newId(), userId, type: "adjustment", amount, balanceBefore, balanceAfter: wallet.balance, description, createdAt: now() };
  const db = getStore();
  db.ledger.push(entry);
  db.auditLogs.push({
    id: newId(),
    userId: adminUserId,
    action: "credits.grant",
    entityType: "credit_wallet",
    entityId: wallet.id,
    metadataJson: { targetUserId: userId, amount, balanceBefore, balanceAfter: wallet.balance, description },
    createdAt: now(),
  });
  return { wallet, entry };
}

export function chargeCredits(userId: string, amount: number, description: string, relatedModuleRunId?: string) {
  const wallet = assertSufficientCredits(userId, amount);
  const balanceBefore = wallet.balance;
  wallet.balance -= amount;
  wallet.updatedAt = now();
  const entry: CreditLedger = { id: newId(), userId, type: "usage", amount: -Math.abs(amount), balanceBefore, balanceAfter: wallet.balance, description, relatedModuleRunId, createdAt: now() };
  getStore().ledger.push(entry);
  return { wallet, entry };
}

export function getLedger(userId: string) {
  return getStore().ledger.filter((entry) => entry.userId === userId).toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLedgerByPeriod(params: { userId?: string; from?: string; to?: string; type?: CreditLedger["type"] }) {
  const fromTime = params.from ? new Date(params.from).getTime() : undefined;
  const toTime = params.to ? new Date(params.to).getTime() : undefined;
  return getStore().ledger
    .filter((entry) => !params.userId || entry.userId === params.userId)
    .filter((entry) => !params.type || entry.type === params.type)
    .filter((entry) => {
      const time = new Date(entry.createdAt).getTime();
      return (fromTime === undefined || time >= fromTime) && (toTime === undefined || time <= toTime);
    })
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCreditStatement(userId: string, from?: string, to?: string) {
  const wallet = getWallet(userId);
  const entries = getLedgerByPeriod({ userId, from, to });
  return {
    userId,
    wallet,
    period: { from, to },
    totals: {
      purchased: entries.filter((entry) => entry.type === "purchase").reduce((total, entry) => total + entry.amount, 0),
      granted: entries.filter((entry) => entry.type === "adjustment").reduce((total, entry) => total + entry.amount, 0),
      consumed: Math.abs(entries.filter((entry) => entry.type === "usage").reduce((total, entry) => total + entry.amount, 0)),
      refunded: entries.filter((entry) => entry.type === "refund").reduce((total, entry) => total + entry.amount, 0),
    },
    entries,
  };
}
