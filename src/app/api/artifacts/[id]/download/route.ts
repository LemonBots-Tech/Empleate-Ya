import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { getArtifact } from "@/services/artifactService";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const artifact = getArtifact(user.id, id);
    if (!artifact) throw new Error("NOT_FOUND");
    const format = new URL(request.url).searchParams.get("format") ?? "html";
    const body = format === "json" ? JSON.stringify(artifact.contentJson, null, 2) : artifact.htmlContent ?? `<h1>${artifact.title}</h1>`;
    return new NextResponse(body, { headers: { "Content-Type": format === "json" ? "application/json" : "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="artifact-${artifact.id}.${format === "json" ? "json" : "html"}"` } });
  } catch (error) {
    return jsonError(error);
  }
}
