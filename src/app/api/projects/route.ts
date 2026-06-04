import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getStore, newId, now } from "@/lib/mockdb/store";

const projectSchema = z.object({ title: z.string().min(1), description: z.string().optional(), targetRole: z.string().optional() });

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ projects: getStore().projects.filter((project) => project.userId === user.id && project.status !== "deleted") });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = projectSchema.parse(await request.json());
    const project = { id: newId(), userId: user.id, ...input, status: "active" as const, createdAt: now(), updatedAt: now() };
    getStore().projects.push(project);
    return jsonOk({ project }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
