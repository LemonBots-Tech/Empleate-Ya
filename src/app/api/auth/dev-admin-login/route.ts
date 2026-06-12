import { jsonError, jsonOk } from "@/lib/api/response";
import { canUseDevAdminLogin, getOrCreateDemoUser, setSession } from "@/services/authService";

export async function POST() {
  try {
    if (!canUseDevAdminLogin()) throw new Error("FORBIDDEN");
    const user = getOrCreateDemoUser();
    await setSession(user.id);
    return jsonOk({ ok: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    return jsonError(error);
  }
}
