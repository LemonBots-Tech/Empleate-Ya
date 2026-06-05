import { NextResponse } from "next/server";

type ScorexPhase = "initial" | "final" | "comparative" | "vacancy";
type OpenAiContent = { type: "input_text"; text: string } | { type: "input_file"; filename: string; file_data: string };
type CategoryScore = { area: string; score: number; ideal: number; deviation: number; strengths: string[]; improvements: string[] };
type ScorexReport = {
  candidateName: string;
  profileLevel: string;
  optimizationStatus: string;
  evaluatedDocument: string;
  score: number;
  title: string;
  executiveSummary: string;
  categories: CategoryScore[];
  alerts: string[];
  finalComments: string;
  nextSteps: string[];
  successProbability: string;
  keywords: string[];
  findings: string[];
  recommendations: string[];
};

const phaseLabels: Record<ScorexPhase, string> = {
  initial: "ScoreX inicial",
  final: "ScoreX final",
  comparative: "ScoreX comparativo",
  vacancy: "Evaluación vs vacante",
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Falta OPENAI_API_KEY en .env.local para ejecutar ScoreX con IA." }, { status: 400 });
    }

    const formData = await request.formData();
    const phase = String(formData.get("phase") ?? "initial") as ScorexPhase;
    const evaluationName = String(formData.get("evaluationName") ?? "Evaluación ScoreX");
    const vacancyText = String(formData.get("vacancyText") ?? "");
    const previousInitial = String(formData.get("previousInitial") ?? "");
    const previousFinal = String(formData.get("previousFinal") ?? "");
    const cvFile = formData.get("cvFile");
    const vacancyFile = formData.get("vacancyFile");

    const content: OpenAiContent[] = [
      {
        type: "input_text",
        text: buildPrompt({ phase, evaluationName, vacancyText, previousInitial, previousFinal }),
      },
    ];

    if (cvFile instanceof File) content.push(await fileToInput(cvFile, "CV"));
    if (vacancyFile instanceof File) content.push(await fileToInput(vacancyFile, "Vacante"));

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "scorex_report",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["candidateName", "profileLevel", "optimizationStatus", "evaluatedDocument", "score", "title", "executiveSummary", "categories", "alerts", "finalComments", "nextSteps", "successProbability", "keywords", "findings", "recommendations"],
              properties: {
                candidateName: { type: "string" },
                profileLevel: { type: "string" },
                optimizationStatus: { type: "string" },
                evaluatedDocument: { type: "string" },
                score: { type: "number" },
                title: { type: "string" },
                executiveSummary: { type: "string" },
                successProbability: { type: "string" },
                categories: {
                  type: "array",
                  minItems: 5,
                  maxItems: 5,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["area", "score", "ideal", "deviation", "strengths", "improvements"],
                    properties: {
                      area: { type: "string" },
                      score: { type: "number" },
                      ideal: { type: "number" },
                      deviation: { type: "number" },
                      strengths: { type: "array", items: { type: "string" } },
                      improvements: { type: "array", items: { type: "string" } },
                    },
                  },
                },
                alerts: { type: "array", items: { type: "string" } },
                finalComments: { type: "string" },
                nextSteps: { type: "array", items: { type: "string" } },
                keywords: { type: "array", items: { type: "string" } },
                findings: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: payload.error?.message ?? "OpenAI no pudo generar la evaluación." }, { status: response.status });
    }

    const text = payload.output_text ?? payload.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? []).map((item: { text?: string }) => item.text ?? "").join("");
    const report = JSON.parse(text) as ScorexReport;
    const previousInitialReport = parseReport(previousInitial);
    const previousFinalReport = parseReport(previousFinal);
    return NextResponse.json({
      ...report,
      phase,
      phaseLabel: phaseLabels[phase],
      html: renderScorexHtml(report, phase, previousInitialReport, previousFinalReport),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error inesperado en ScoreX." }, { status: 500 });
  }
}

async function fileToInput(file: File, label: string): Promise<OpenAiContent> {
  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  if (file.type.startsWith("text/") || /\.txt$/i.test(file.name)) {
    return { type: "input_text", text: `${label} (${file.name}):\n${Buffer.from(bytes, "base64").toString("utf8")}` };
  }
  return {
    type: "input_file",
    filename: file.name,
    file_data: `data:${file.type || "application/octet-stream"};base64,${bytes}`,
  };
}

function buildPrompt(input: { phase: ScorexPhase; evaluationName: string; vacancyText: string; previousInitial: string; previousFinal: string }) {
  return `Eres ScoreX, agente evaluador de CV. No reescribes CVs ni cartas. Entregas diagnóstico, puntajes, palabras clave y recomendaciones accionables.

Etapa: ${phaseLabels[input.phase]}
Nombre de evaluación: ${input.evaluationName}

Si la etapa es inicial, evalúa el CV original antes de Optim.
Si la etapa es final, evalúa el CV optimizado después de Optim.
Si la etapa es comparativa, compara la evaluación inicial con la final. Basa el detalle, recomendaciones y comentarios en la información del ScoreX final, pero explica las mejoras contra el ScoreX inicial. No pidas otro CV para esta etapa.
Si la etapa es contra vacante, evalúa compatibilidad del CV con la vacante, posibilidades de éxito, palabras clave faltantes y recomendaciones según perfil y objetivo.

El reporte debe seguir este formato:
1. Encabezado: REPORTE DE EVALUACIÓN DE ATS, nombre del candidato, perfil, optimización previa, documento evaluado y calificación global.
2. Resumen ejecutivo de un párrafo.
3. Cinco áreas obligatorias, cada una con puntos fuertes y recomendaciones de mejora:
   - Optimización para ATS
   - Formato y Presentación
   - Logros y Contribuciones
   - Claridad y Legibilidad
   - Brevedad y Precisión
4. Tabla de calificaciones con área, puntaje, calificación ideal 100/100 y desviación. En etapa comparativa, la tabla HTML final mostrará ScoreX Inicial, ScoreX Final y Desviación Final - Inicial.
5. Gráfica radial comparativa basada en las cinco áreas. En etapa comparativa, debe comparar visualmente ScoreX Inicial contra ScoreX Final.
6. Alertas no penalizables.
7. Comentarios finales. Esta sección es obligatoria y nunca debe omitirse.
8. Próximos pasos sugeridos.

Reporte inicial previo:
${input.previousInitial || "No disponible"}

Reporte final previo:
${input.previousFinal || "No disponible"}

Vacante pegada por el usuario:
${input.vacancyText || "No disponible"}

Devuelve el reporte en español, con score de 0 a 100.`;
}

function parseReport(value: string): ScorexReport | undefined {
  if (!value.trim()) return undefined;
  try {
    return JSON.parse(value) as ScorexReport;
  } catch {
    return undefined;
  }
}

function renderScorexHtml(report: ScorexReport, phase: ScorexPhase, previousInitialReport?: ScorexReport, previousFinalReport?: ScorexReport) {
  const list = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const finalCategories = previousFinalReport?.categories?.length === 5 ? previousFinalReport.categories : report.categories;
  const initialCategories = previousInitialReport?.categories?.length === 5 ? previousInitialReport.categories : undefined;
  const finalComments = report.finalComments.trim() || "Sin comentarios finales generados. Revisa los hallazgos, la tabla de calificaciones y los próximos pasos sugeridos antes de tomar decisiones.";
  const rows = phase === "comparative" && initialCategories
    ? comparativeRows(initialCategories, finalCategories)
    : report.categories.map((category) => `<tr><td>${escapeHtml(category.area)}</td><td>${Math.round(category.score)}/100</td><td>${Math.round(category.ideal)}/100</td><td>${Math.round(category.deviation)}</td></tr>`).join("");
  const sections = report.categories.map((category, index) => `<section class="scorex-section"><h2>${roman(index + 1)}. ${escapeHtml(category.area)}</h2><h3>Puntos fuertes</h3><ul>${list(category.strengths)}</ul><h3>Recomendaciones de mejora</h3><ul>${list(category.improvements)}</ul></section>`).join("");
  const tableHead = phase === "comparative" && initialCategories
    ? "<tr><th>\u00c1rea</th><th>ScoreX Inicial</th><th>ScoreX Final</th><th>Desviaci\u00f3n Final - Inicial</th></tr>"
    : "<tr><th>\u00c1rea</th><th>Puntaje</th><th>Calificaci\u00f3n ideal</th><th>Desviaci\u00f3n</th></tr>";
  const radar = phase === "comparative" && initialCategories
    ? comparativeRadarSvg(initialCategories, finalCategories)
    : blueRadarSvg(report.categories);
  return `<article class="scorex-report"><p class="ey-kicker">${phaseLabels[phase]}</p><h1>REPORTE DE EVALUACI\u00d3N DE ATS</h1><div class="scorex-meta"><p><strong>Nombre del candidato:</strong> ${escapeHtml(report.candidateName)}</p><p><strong>Perfil:</strong> ${escapeHtml(report.profileLevel)}</p><p><strong>Optimizaci\u00f3n previa:</strong> ${escapeHtml(report.optimizationStatus)}</p><p><strong>Documento evaluado:</strong> ${escapeHtml(report.evaluatedDocument)}</p></div><div class="scorex-global"><span>Calificaci\u00f3n global</span><strong>${Math.round(report.score)}/100</strong></div><p class="scorex-summary">${escapeHtml(report.executiveSummary)}</p>${sections}<h2>TABLA DE CALIFICACIONES</h2><table class="scorex-table"><thead>${tableHead}</thead><tbody>${rows}</tbody></table><h2>GR\u00c1FICA RADIAL COMPARATIVA</h2>${radar}<h2>ALERTAS NO PENALIZABLES</h2><ul>${list(report.alerts)}</ul><h2>COMENTARIOS FINALES</h2><p>${escapeHtml(finalComments)}</p><h2>PR\u00d3XIMOS PASOS SUGERIDOS</h2><ul>${list(report.nextSteps)}</ul><h2>Palabras clave detectadas</h2><ul>${list(report.keywords)}</ul><h2>Probabilidad de \u00e9xito</h2><p>${escapeHtml(report.successProbability)}</p></article>`;
}

function comparativeRows(initialCategories: CategoryScore[], finalCategories: CategoryScore[]) {
  return finalCategories.map((finalCategory, index) => {
    const initialCategory = findMatchingCategory(initialCategories, finalCategory.area) ?? initialCategories[index];
    const initialScore = Math.round(initialCategory?.score ?? 0);
    const finalScore = Math.round(finalCategory.score);
    const deviation = finalScore - initialScore;
    const deviationLabel = deviation > 0 ? `+${deviation}` : String(deviation);
    return `<tr><td>${escapeHtml(finalCategory.area)}</td><td>${initialScore}/100</td><td>${finalScore}/100</td><td>${deviationLabel}</td></tr>`;
  }).join("");
}

function reportToHtml(report: ScorexReport, phase: ScorexPhase) {
  const list = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const rows = report.categories.map((category) => `<tr><td>${escapeHtml(category.area)}</td><td>${Math.round(category.score)}/100</td><td>${Math.round(category.ideal)}/100</td><td>${Math.round(category.deviation)}</td></tr>`).join("");
  const sections = report.categories.map((category, index) => `<section class="scorex-section"><h2>${roman(index + 1)}. ${escapeHtml(category.area)}</h2><h3>Puntos fuertes</h3><ul>${list(category.strengths)}</ul><h3>Recomendaciones de mejora</h3><ul>${list(category.improvements)}</ul></section>`).join("");
  return `<article class="scorex-report"><p class="ey-kicker">${phaseLabels[phase]}</p><h1>REPORTE DE EVALUACIÓN DE ATS</h1><div class="scorex-meta"><p><strong>Nombre del candidato:</strong> ${escapeHtml(report.candidateName)}</p><p><strong>Perfil:</strong> ${escapeHtml(report.profileLevel)}</p><p><strong>Optimización previa:</strong> ${escapeHtml(report.optimizationStatus)}</p><p><strong>Documento evaluado:</strong> ${escapeHtml(report.evaluatedDocument)}</p></div><div class="scorex-global"><span>Calificación global</span><strong>${Math.round(report.score)}/100</strong></div><p class="scorex-summary">${escapeHtml(report.executiveSummary)}</p>${sections}<h2>TABLA DE CALIFICACIONES</h2><table class="scorex-table"><thead><tr><th>Área</th><th>Puntaje</th><th>Calificación ideal</th><th>Desviación</th></tr></thead><tbody>${rows}</tbody></table><h2>GRÁFICA RADIAL COMPARATIVA</h2>${radarSvg(report.categories)}<h2>ALERTAS NO PENALIZABLES</h2><ul>${list(report.alerts)}</ul><h2>COMENTARIOS FINALES</h2><p>${escapeHtml(report.finalComments)}</p><h2>PRÓXIMOS PASOS SUGERIDOS</h2><ul>${list(report.nextSteps)}</ul><h2>Palabras clave detectadas</h2><ul>${list(report.keywords)}</ul><h2>Probabilidad de éxito</h2><p>${escapeHtml(report.successProbability)}</p></article>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function roman(value: number) {
  return ["I", "II", "III", "IV", "V"][value - 1] ?? String(value);
}

function normalizeArea(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function findMatchingCategory(categories: CategoryScore[], area: string) {
  const normalizedArea = normalizeArea(area);
  return categories.find((category) => normalizeArea(category.area) === normalizedArea)
    ?? categories.find((category) => normalizedArea.includes(normalizeArea(category.area).slice(0, 8)) || normalizeArea(category.area).includes(normalizedArea.slice(0, 8)));
}

function radarPolygon(categories: CategoryScore[], size: number, center: number, maxRadius: number) {
  return categories.map((category, index) => {
    const angle = (-90 + index * 360 / size) * Math.PI / 180;
    const radius = Math.max(0, Math.min(100, category.score)) / 100 * maxRadius;
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
  }).join(" ");
}

function radarLabel(area: string) {
  const normalized = normalizeArea(area);
  if (normalized.includes("ats") || normalized.includes("optimizacion")) return ["Optimizaci\u00f3n", "ATS"];
  if (normalized.includes("formato")) return ["Formato y", "presentaci\u00f3n"];
  if (normalized.includes("logros")) return ["Logros y", "contribuciones"];
  if (normalized.includes("claridad")) return ["Claridad y", "legibilidad"];
  if (normalized.includes("brevedad")) return ["Brevedad y", "precisi\u00f3n"];
  const words = area.split(/\s+/);
  return [words.slice(0, 2).join(" "), words.slice(2, 4).join(" ")].filter(Boolean);
}

function radarAxes(categories: CategoryScore[], center: number, maxRadius: number) {
  return categories.map((category, index) => {
    const angle = (-90 + index * 360 / categories.length) * Math.PI / 180;
    const x = center + Math.cos(angle) * maxRadius;
    const y = center + Math.sin(angle) * maxRadius;
    const labelX = center + Math.cos(angle) * (maxRadius + 54);
    const labelY = center + Math.sin(angle) * (maxRadius + 54);
    const label = radarLabel(category.area);
    const tspans = label.map((part, partIndex) => `<tspan x="${labelX}" dy="${partIndex === 0 ? 0 : 13}">${escapeHtml(part)}</tspan>`).join("");
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#bfdbfe"/><text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="11" font-weight="700" fill="#0066CC">${tspans}</text>`;
  }).join("");
}

function blueRadarSvg(categories: CategoryScore[]) {
  const center = 180;
  const maxRadius = 104;
  const points = radarPolygon(categories, categories.length, center, maxRadius);
  return `<svg class="scorex-radar" viewBox="0 0 360 360" role="img" aria-label="Gr\u00e1fica radial comparativa"><circle cx="${center}" cy="${center}" r="104" fill="none" stroke="#dbeafe"/><circle cx="${center}" cy="${center}" r="70" fill="none" stroke="#dbeafe"/><circle cx="${center}" cy="${center}" r="35" fill="none" stroke="#dbeafe"/>${radarAxes(categories, center, maxRadius)}<polygon points="${points}" fill="rgba(0,102,204,.22)" stroke="#0066CC" stroke-width="3"/></svg>`;
}

function comparativeRadarSvg(initialCategories: CategoryScore[], finalCategories: CategoryScore[]) {
  const center = 180;
  const maxRadius = 104;
  const alignedInitial = finalCategories.map((finalCategory, index) => findMatchingCategory(initialCategories, finalCategory.area) ?? initialCategories[index] ?? finalCategory);
  const initialPoints = radarPolygon(alignedInitial, finalCategories.length, center, maxRadius);
  const finalPoints = radarPolygon(finalCategories, finalCategories.length, center, maxRadius);
  return `<svg class="scorex-radar" viewBox="0 0 360 390" role="img" aria-label="Gr\u00e1fica radial comparativa ScoreX Inicial contra ScoreX Final"><circle cx="${center}" cy="${center}" r="104" fill="none" stroke="#dbeafe"/><circle cx="${center}" cy="${center}" r="70" fill="none" stroke="#dbeafe"/><circle cx="${center}" cy="${center}" r="35" fill="none" stroke="#dbeafe"/>${radarAxes(finalCategories, center, maxRadius)}<polygon points="${initialPoints}" fill="rgba(148,163,184,.20)" stroke="#64748b" stroke-width="3"/><polygon points="${finalPoints}" fill="rgba(0,102,204,.20)" stroke="#0066CC" stroke-width="3"/><g transform="translate(88 348)"><rect width="184" height="25" rx="12" fill="#f8fafc" stroke="#dbeafe"/><line x1="14" y1="13" x2="34" y2="13" stroke="#64748b" stroke-width="4"/><text x="42" y="17" font-size="11" fill="#334155">ScoreX Inicial</text><line x1="112" y1="13" x2="132" y2="13" stroke="#0066CC" stroke-width="4"/><text x="140" y="17" font-size="11" fill="#334155">ScoreX Final</text></g></svg>`;
}

function radarSvg(categories: CategoryScore[]) {
  const center = 140;
  const maxRadius = 96;
  const points = categories.map((category, index) => {
    const angle = (-90 + index * 360 / categories.length) * Math.PI / 180;
    const radius = Math.max(0, Math.min(100, category.score)) / 100 * maxRadius;
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
  }).join(" ");
  const axes = categories.map((category, index) => {
    const angle = (-90 + index * 360 / categories.length) * Math.PI / 180;
    const x = center + Math.cos(angle) * maxRadius;
    const y = center + Math.sin(angle) * maxRadius;
    const labelX = center + Math.cos(angle) * (maxRadius + 34);
    const labelY = center + Math.sin(angle) * (maxRadius + 34);
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#ddd6fe"/><text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="10" fill="#4c1d95">${escapeHtml(category.area.slice(0, 18))}</text>`;
  }).join("");
  return `<svg class="scorex-radar" viewBox="0 0 280 280" role="img" aria-label="Gráfica radial comparativa"><circle cx="${center}" cy="${center}" r="96" fill="none" stroke="#ede9fe"/><circle cx="${center}" cy="${center}" r="64" fill="none" stroke="#ede9fe"/><circle cx="${center}" cy="${center}" r="32" fill="none" stroke="#ede9fe"/>${axes}<polygon points="${points}" fill="rgba(124,58,237,.24)" stroke="#7c3aed" stroke-width="3"/></svg>`;
}
