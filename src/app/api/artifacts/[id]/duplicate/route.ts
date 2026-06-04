import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { duplicateArtifact } from "@/services/artifactService";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return jsonOk({ artifact: duplicateArtifact(user.id, id) }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
