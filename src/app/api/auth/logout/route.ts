import { jsonError, jsonOk } from "@/lib/api/response";
import { clearSession } from "@/services/authService";

export async function POST() {
  try {
    await clearSession();
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
