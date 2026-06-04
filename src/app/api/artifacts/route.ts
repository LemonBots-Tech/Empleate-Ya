import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { listArtifacts } from "@/services/artifactService";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ artifacts: listArtifacts(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}
