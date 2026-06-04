import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getLedger } from "@/services/creditService";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ ledger: getLedger(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}
