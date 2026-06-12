import { jsonError, jsonOk } from "@/lib/api/response";
import { canUseDevAdminLogin, getCurrentUser, getOrCreateDemoUser } from "@/services/authService";
import { getWallet } from "@/services/creditService";

export async function GET() {
  try {
    const user = (await getCurrentUser()) ?? (canUseDevAdminLogin() ? getOrCreateDemoUser() : undefined);
    if (!user) throw new Error("UNAUTHORIZED");
    return jsonOk({ wallet: getWallet(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}
