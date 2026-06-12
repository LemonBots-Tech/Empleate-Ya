import { jsonError, jsonOk } from "@/lib/api/response";
import { canUseDevAdminLogin, getCurrentUser, getOrCreateDemoUser } from "@/services/authService";
import { getLedger } from "@/services/creditService";

export async function GET() {
  try {
    const user = (await getCurrentUser()) ?? (canUseDevAdminLogin() ? getOrCreateDemoUser() : undefined);
    if (!user) throw new Error("UNAUTHORIZED");
    return jsonOk({ ledger: getLedger(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}
