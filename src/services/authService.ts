import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { MOCK_USER_ID } from "@/lib/api/mockUser";
import { getStore, newId, now, toPublicUser, type User } from "@/lib/mockdb/store";

const SESSION_COOKIE = "eya_session";
const CONSENT_VERSION = "2026-06-02";

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5).optional(),
  age: z.coerce.number().int().min(16).max(90).optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  password: z.string().min(8),
  privacyAccepted: z.literal(true),
  termsAccepted: z.literal(true),
  aiConsentAccepted: z.literal(true),
});

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export type PublicUser = ReturnType<typeof toPublicUser>;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120_000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [, iterations, salt, hash] = stored.split("$");
  const computed = pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
  return timingSafeEqual(Buffer.from(hash, "hex"), computed);
}

function tokenForUser(userId: string) {
  return Buffer.from(`${userId}.${createHash("sha256").update(userId).digest("hex").slice(0, 12)}`).toString("base64url");
}

function userIdFromToken(token: string | undefined) {
  if (!token) return undefined;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [userId, signature] = raw.split(".");
    const expected = createHash("sha256").update(userId).digest("hex").slice(0, 12);
    return signature === expected ? userId : undefined;
  } catch {
    return undefined;
  }
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, tokenForUser(userId), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | undefined> {
  const jar = await cookies();
  const userId = userIdFromToken(jar.get(SESSION_COOKIE)?.value);
  return getStore().users.find((user) => user.id === userId && user.status === "active");
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function getOrCreateDemoUser() {
  const db = getStore();
  let user = db.users.find((item) => item.id === MOCK_USER_ID);
  if (!user) {
    user = {
      id: MOCK_USER_ID,
      firstName: "Demo",
      lastName: "Empléate",
      email: "demo@empleateya.local",
      passwordHash: hashPassword("demo-password"),
      emailVerified: true,
      phoneVerified: false,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    };
    db.users.push(user);
  }

  let wallet = db.wallets.find((item) => item.userId === user.id);
  if (!wallet) {
    wallet = { id: newId(), userId: user.id, balance: 1000, currency: "MXN", updatedAt: now() };
    db.wallets.push(wallet);
  } else if (wallet.balance < 500) {
    wallet.balance = 1000;
    wallet.updatedAt = now();
  }

  return user;
}

export async function getCurrentUserOrDemo() {
  return (await getCurrentUser()) ?? getOrCreateDemoUser();
}

export function registerUser(input: z.infer<typeof registerSchema>, ipAddress?: string) {
  const data = registerSchema.parse(input);
  const db = getStore();
  const email = data.email.toLowerCase();
  if (db.users.some((user) => user.email === email)) throw new Error("EMAIL_EXISTS");
  const user: User = {
    id: newId(),
    firstName: data.firstName,
    lastName: data.lastName,
    email,
    phone: data.phone,
    age: data.age,
    country: data.country,
    state: data.state,
    city: data.city,
    passwordHash: hashPassword(data.password),
    emailVerified: false,
    phoneVerified: false,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  };
  db.users.push(user);
  db.wallets.push({ id: newId(), userId: user.id, balance: 250, currency: "MXN", updatedAt: now() });
  db.ledger.push({ id: newId(), userId: user.id, type: "adjustment", amount: 250, balanceBefore: 0, balanceAfter: 250, description: "Créditos de bienvenida MVP", createdAt: now() });
  (["privacy_notice", "terms", "ai_processing", "artifact_storage"] as const).forEach((consentType) => {
    db.consents.push({ id: newId(), userId: user.id, consentType, accepted: true, version: CONSENT_VERSION, ipAddress, acceptedAt: now() });
  });
  db.auditLogs.push({ id: newId(), userId: user.id, action: "auth.register", entityType: "user", entityId: user.id, ipAddress, createdAt: now() });
  return user;
}

export function loginUser(email: string, password: string) {
  const user = getStore().users.find((item) => item.email === email.toLowerCase() && item.status === "active");
  if (!user || !verifyPassword(password, user.passwordHash)) throw new Error("INVALID_CREDENTIALS");
  getStore().auditLogs.push({ id: newId(), userId: user.id, action: "auth.login", entityType: "user", entityId: user.id, createdAt: now() });
  return user;
}
