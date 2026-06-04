import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getWallet } from "@/services/creditService";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ wallet: getWallet(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}
