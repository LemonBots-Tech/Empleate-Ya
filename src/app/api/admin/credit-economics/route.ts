import { jsonError, jsonOk } from "@/lib/api/response";
import { getStore } from "@/lib/mockdb/store";
import { requireSuperAdmin } from "@/services/authService";

export async function GET() {
  try {
    await requireSuperAdmin();
    return jsonOk({ policy: getStore().creditPolicy });
  } catch (error) {
    return jsonError(error);
  }
}
