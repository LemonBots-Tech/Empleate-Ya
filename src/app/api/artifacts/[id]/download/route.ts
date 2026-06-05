import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getCurrentUserOrDemo } from "@/services/authService";
import { getArtifact } from "@/services/artifactService";

function wrapHtmlDocument(title: string, content: string) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; background: #fbfaf8; color: #0f172a; font-family: "Avenir Next", "Segoe UI", Inter, system-ui, sans-serif; }
      main { max-width: 920px; margin: 0 auto; padding: 32px 20px; }
      .report-document { line-height: 1.65; }
      .report-hero { border-radius: 24px; background: linear-gradient(135deg, #f1eafe 0%, #ffffff 52%, #fff6dc 100%); border: 1px solid #e7dcfb; padding: 28px; }
      .report-kicker { margin: 0 0 10px; color: #7c3aed; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
      h1 { margin: 0; color: #0f172a; font-size: 32px; line-height: 1.08; }
      h2 { margin: 28px 0 10px; color: #111827; font-size: 20px; }
      p, li, dd { color: #475569; }
      dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 22px 0 0; }
      dt { color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; }
      dd { margin: 4px 0 0; font-weight: 800; }
    </style>
  </head>
  <body>
    <main>${content}</main>
  </body>
</html>`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUserOrDemo();
    const { id } = await params;
    const artifact = getArtifact(user.id, id);
    if (!artifact) throw new Error("NOT_FOUND");
    const format = new URL(request.url).searchParams.get("format") ?? "html";
    const body = format === "json" ? JSON.stringify(artifact.contentJson, null, 2) : wrapHtmlDocument(artifact.title, artifact.htmlContent ?? `<h1>${artifact.title}</h1>`);
    return new NextResponse(body, { headers: { "Content-Type": format === "json" ? "application/json" : "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="artifact-${artifact.id}.${format === "json" ? "json" : "html"}"` } });
  } catch (error) {
    return jsonError(error);
  }
}
