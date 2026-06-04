import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getStore, newId, now } from "@/lib/mockdb/store";

const uploadSchema = z.object({ originalName: z.string().min(1), mimeType: z.string().default("application/octet-stream"), size: z.coerce.number().int().min(0).default(0), fileType: z.string().default("cv_file"), projectId: z.string().optional() });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = uploadSchema.parse(await request.json());
    const file = { id: newId(), userId: user.id, projectId: input.projectId, originalName: input.originalName, mimeType: input.mimeType, size: input.size, storagePath: `local/${user.id}/${newId()}-${input.originalName}`, fileType: input.fileType, createdAt: now() };
    getStore().files.push(file);
    return jsonOk({ file }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
