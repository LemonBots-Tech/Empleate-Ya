import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { deleteArtifact, getArtifact } from "@/services/artifactService";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const artifact = getArtifact(user.id, id);
    if (!artifact) throw new Error("NOT_FOUND");
    return jsonOk({ artifact });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return jsonOk({ artifact: deleteArtifact(user.id, id) });
  } catch (error) {
    return jsonError(error);
  }
}
