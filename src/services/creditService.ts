import { getStore, newId, now, type CreditLedger } from "@/lib/mockdb/store";

export function getWallet(userId: string) {
  const db = getStore();
  let wallet = db.wallets.find((item) => item.userId === userId);

  if (!wallet) {
    wallet = {
      id: newId(),
      userId,
      balance: 250,
      currency: "MXN",
      updatedAt: now(),
    };

    db.wallets.push(wallet);
    db.ledger.push({
      id: newId(),
      userId,
      type: "adjustment",
      amount: 250,
      balanceBefore: 0,
      balanceAfter: 250,
      description: "Créditos de bienvenida MVP",
      createdAt: now(),
    });
  }

  return wallet;
}

export function getModulePrice(moduleId: string) {
  return getStore().modulePricing.find((price) => price.moduleId === moduleId && price.isActive)?.baseCredits ?? 0;
}

export function estimateCredits(moduleIds: string[]) {
  return moduleIds.reduce((total, moduleId) => total + getModulePrice(moduleId), 0);
}

export function assertSufficientCredits(userId: string, amount: number) {
  const wallet = getWallet(userId);

  if (wallet.balance < amount) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  return wallet;
}

export function addCredits(userId: string, amount: number, description = "Compra mock de créditos") {
  const wallet = getWallet(userId);
  const balanceBefore = wallet.balance;

  wallet.balance += amount;
  wallet.updatedAt = now();

  const entry: CreditLedger = {
    id: newId(),
    userId,
    type: "purchase",
    amount,
    balanceBefore,
    balanceAfter: wallet.balance,
    description,
    createdAt: now(),
  };

  getStore().ledger.push(entry);

  return { wallet, entry };
}

export function chargeCredits(userId: string, amount: number, description: string, relatedModuleRunId?: string) {
  const wallet = assertSufficientCredits(userId, amount);
  const balanceBefore = wallet.balance;

  wallet.balance -= amount;
  wallet.updatedAt = now();

  const entry: CreditLedger = {
    id: newId(),
    userId,
    type: "usage",
    amount: -Math.abs(amount),
    balanceBefore,
    balanceAfter: wallet.balance,
    description,
    relatedModuleRunId,
    createdAt: now(),
  };

  getStore().ledger.push(entry);

  return { wallet, entry };
}

export function getLedger(userId: string) {
  return getStore()
    .ledger.filter((entry) => entry.userId === userId)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
}
