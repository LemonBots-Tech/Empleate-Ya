import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { canUseDevAdminLogin, getCurrentUser, getOrCreateDemoUser } from "@/services/authService";
import { addCredits } from "@/services/creditService";

const schema = z.object({ amount: z.coerce.number().int().min(1).max(10000).default(500) });

export async function POST(request: Request) {
  try {
    const user = (await getCurrentUser()) ?? (canUseDevAdminLogin() ? getOrCreateDemoUser() : undefined);
    if (!user) throw new Error("UNAUTHORIZED");
    const { amount } = schema.parse(await request.json());
    return jsonOk(addCredits(user.id, amount));
  } catch (error) {
    return jsonError(error);
  }
}
