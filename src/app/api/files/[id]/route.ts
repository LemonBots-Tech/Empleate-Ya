import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getStore } from "@/lib/mockdb/store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const db = getStore();
    const index = db.files.findIndex((file) => file.id === id && file.userId === user.id);
    if (index === -1) throw new Error("NOT_FOUND");
    const [file] = db.files.splice(index, 1);
    return jsonOk({ file });
  } catch (error) {
    return jsonError(error);
  }
}
