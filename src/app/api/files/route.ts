import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getStore } from "@/lib/mockdb/store";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ files: getStore().files.filter((file) => file.userId === user.id) });
  } catch (error) {
    return jsonError(error);
  }
}
