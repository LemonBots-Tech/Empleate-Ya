import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getStore, newId, now } from "@/lib/mockdb/store";

const profileSchema = z.object({
  targetRole: z.string().optional(),
  seniority: z.string().optional(),
  industry: z.string().optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  lastRole: z.string().optional(),
  lastCompany: z.string().optional(),
  educationLevel: z.string().optional(),
  languages: z.array(z.string()).default([]),
  linkedinUrl: z.string().optional(),
  jobSearchStatus: z.string().optional(),
  employmentType: z.string().optional(),
  desiredSalaryRange: z.string().optional(),
  desiredSalaryAmount: z.string().optional(),
  preferredWorkMode: z.string().optional(),
  geographicAvailability: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ profile: getStore().profiles.find((profile) => profile.userId === user.id) ?? null });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const input = profileSchema.parse(await request.json());
    const db = getStore();
    let profile = db.profiles.find((item) => item.userId === user.id);
    if (!profile) {
      profile = { id: newId(), userId: user.id, languages: [], createdAt: now(), updatedAt: now() };
      db.profiles.push(profile);
    }
    Object.assign(profile, input, { updatedAt: now() });
    db.auditLogs.push({ id: newId(), userId: user.id, action: "profile.upsert", entityType: "professional_profile", entityId: profile.id, createdAt: now() });
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
