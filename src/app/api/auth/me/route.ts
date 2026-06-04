import { jsonError, jsonOk } from "@/lib/api/response";
import { getCurrentUser } from "@/services/authService";
import { toPublicUser } from "@/lib/mockdb/store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return jsonOk({ user: user ? toPublicUser(user) : null });
  } catch (error) {
    return jsonError(error);
  }
}
