import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getStore, now } from "@/lib/mockdb/store";

const projectSchema = z.object({ title: z.string().min(1).optional(), description: z.string().optional(), targetRole: z.string().optional() });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const project = getStore().projects.find((item) => item.id === id && item.userId === user.id && item.status !== "deleted");
    if (!project) throw new Error("NOT_FOUND");
    return jsonOk({ project });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const project = getStore().projects.find((item) => item.id === id && item.userId === user.id && item.status !== "deleted");
    if (!project) throw new Error("NOT_FOUND");
    Object.assign(project, projectSchema.parse(await request.json()), { updatedAt: now() });
    return jsonOk({ project });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const project = getStore().projects.find((item) => item.id === id && item.userId === user.id && item.status !== "deleted");
    if (!project) throw new Error("NOT_FOUND");
    project.status = "deleted";
    project.updatedAt = now();
    return jsonOk({ project });
  } catch (error) {
    return jsonError(error);
  }
}
