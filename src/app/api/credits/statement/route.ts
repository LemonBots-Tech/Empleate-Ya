import { jsonError, jsonOk } from "@/lib/api/response";
import { canUseDevAdminLogin, getCurrentUser, getOrCreateDemoUser } from "@/services/authService";
import { getCreditStatement } from "@/services/creditService";

export async function GET(request: Request) {
  try {
    const user = (await getCurrentUser()) ?? (canUseDevAdminLogin() ? getOrCreateDemoUser() : undefined);
    if (!user) throw new Error("UNAUTHORIZED");
    const { searchParams } = new URL(request.url);
    return jsonOk({
      statement: getCreditStatement(user.id, searchParams.get("from") ?? undefined, searchParams.get("to") ?? undefined),
    });
  } catch (error) {
    return jsonError(error);
  }
}
