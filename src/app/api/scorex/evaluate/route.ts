import { NextResponse } from "next/server";
import { canUseDevAdminLogin, getCurrentUser, getOrCreateDemoUser } from "@/services/authService";
import { assertAvatarAccess, chargeCredits, getModulePrice, recordAvatarTrial } from "@/services/creditService";

type ScorexPhase = "initial" | "final" | "comparative" | "vacancy";
type ReportLanguage = "es" | "en";
type VacancyCvTarget = "original" | "optimized";
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
  vacancyComparison: { originalProbability: number; optimizedProbability: number };
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

const englishPhaseLabels: Record<ScorexPhase, string> = {
  initial: "Initial ScoreX",
  final: "Final ScoreX",
  comparative: "Comparative ScoreX",
  vacancy: "Job fit evaluation",
};

const reportCopy = {
  es: {
    area: "Área",
    alerts: "ALERTAS NO PENALIZABLES",
    candidateName: "Nombre del candidato:",
    comments: "COMENTARIOS FINALES",
    comparativeRadar: "GRÁFICA RADIAL COMPARATIVA",
    document: "Documento evaluado:",
    finalCommentsFallback: "Sin comentarios finales generados. Revisa los hallazgos, la tabla de calificaciones y los próximos pasos sugeridos antes de tomar decisiones.",
    finalScore: "ScoreX Final",
    globalScore: "Calificación global",
    ideal: "Calificación ideal",
    initialScore: "ScoreX Inicial",
    keywords: "Palabras clave detectadas",
    mainTitle: "REPORTE DE EVALUACIÓN DE ATS",
    nextSteps: "PRÓXIMOS PASOS SUGERIDOS",
    optimization: "Optimización previa:",
    profile: "Perfil:",
    score: "Puntaje",
    strengths: "Puntos fuertes",
    successProbability: "Probabilidad de éxito",
    table: "TABLA DE CALIFICACIONES",
    deviation: "Desviación",
    comparativeDeviation: "Desviación Final - Inicial",
    improvements: "Recomendaciones de mejora",
  },
  en: {
    area: "Area",
    alerts: "NON-PENALIZING ALERTS",
    candidateName: "Candidate name:",
    comments: "FINAL COMMENTS",
    comparativeRadar: "COMPARATIVE RADAR CHART",
    document: "Evaluated document:",
    finalCommentsFallback: "No final comments were generated. Review the findings, score table, and suggested next steps before making decisions.",
    finalScore: "Final ScoreX",
    globalScore: "Overall score",
    ideal: "Ideal score",
    initialScore: "Initial ScoreX",
    keywords: "Detected keywords",
    mainTitle: "ATS EVALUATION REPORT",
    nextSteps: "SUGGESTED NEXT STEPS",
    optimization: "Prior optimization:",
    profile: "Profile:",
    score: "Score",
    strengths: "Strengths",
    successProbability: "Success probability",
    table: "SCORE TABLE",
    deviation: "Deviation",
    comparativeDeviation: "Final - Initial Deviation",
    improvements: "Improvement recommendations",
  },
} satisfies Record<ReportLanguage, Record<string, string>>;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Falta OPENAI_API_KEY en .env.local para ejecutar ScoreX con IA." }, { status: 400 });
    }

    const formData = await request.formData();
    const phase = String(formData.get("phase") ?? "initial") as ScorexPhase;
    const language = normalizeLanguage(String(formData.get("language") ?? "es"));
    const vacancyCvTarget = normalizeVacancyCvTarget(String(formData.get("vacancyCvTarget") ?? "optimized"));
    const evaluationName = String(formData.get("evaluationName") ?? "Evaluación ScoreX");
    const vacancyText = String(formData.get("vacancyText") ?? "");
    const previousInitial = String(formData.get("previousInitial") ?? "");
    const previousFinal = String(formData.get("previousFinal") ?? "");
    const cvFile = formData.get("cvFile");
    const vacancyFile = formData.get("vacancyFile");
    const user = (await getCurrentUser()) ?? (canUseDevAdminLogin() ? getOrCreateDemoUser() : undefined);
    if (!user) return NextResponse.json({ error: "Necesitas iniciar sesion para usar ScoreX." }, { status: 401 });

    const access = assertAvatarAccess(user.id, ["scorex"], getModulePrice("scorex"));

    const content: OpenAiContent[] = [
      {
        type: "input_text",
        text: buildPrompt({ phase, language, vacancyCvTarget, evaluationName, vacancyText, previousInitial, previousFinal }),
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
              required: ["candidateName", "profileLevel", "optimizationStatus", "evaluatedDocument", "score", "title", "executiveSummary", "categories", "alerts", "finalComments", "nextSteps", "successProbability", "vacancyComparison", "keywords", "findings", "recommendations"],
              properties: {
                candidateName: { type: "string" },
                profileLevel: { type: "string" },
                optimizationStatus: { type: "string" },
                evaluatedDocument: { type: "string" },
                score: { type: "number" },
                title: { type: "string" },
                executiveSummary: { type: "string" },
                successProbability: { type: "string" },
                vacancyComparison: {
                  type: "object",
                  additionalProperties: false,
                  required: ["originalProbability", "optimizedProbability"],
                  properties: {
                    originalProbability: { type: "number" },
                    optimizedProbability: { type: "number" },
                  },
                },
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
    if (access.mode === "trial") recordAvatarTrial(user.id, ["scorex"]);
    chargeCredits(user.id, access.creditsToCharge, `ScoreX ${phase}`);

    return NextResponse.json({
      ...report,
      phase,
      phaseLabel: phaseLabel(phase, language),
      language,
      accessMode: access.mode,
      creditsCharged: access.creditsToCharge,
      html: renderScorexHtml(report, phase, language, previousInitialReport, previousFinalReport),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AVATAR_TRIAL_USED") return NextResponse.json({ error: "Ya usaste tu prueba gratuita de ScoreX. Compra creditos para usar este avatar cuantas veces lo necesites." }, { status: 402 });
    if (error instanceof Error && error.message === "STAR_AVATAR_REQUIRES_PURCHASE") return NextResponse.json({ error: "Este avatar requiere compra previa de creditos." }, { status: 402 });
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") return NextResponse.json({ error: "No tienes creditos suficientes para usar ScoreX." }, { status: 402 });
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

function normalizeLanguage(value: string): ReportLanguage {
  return value === "en" ? "en" : "es";
}

function normalizeVacancyCvTarget(value: string): VacancyCvTarget {
  return value === "original" ? "original" : "optimized";
}

function phaseLabel(phase: ScorexPhase, language: ReportLanguage) {
  return language === "en" ? englishPhaseLabels[phase] : phaseLabels[phase];
}

function buildPrompt(input: { phase: ScorexPhase; language: ReportLanguage; vacancyCvTarget: VacancyCvTarget; evaluationName: string; vacancyText: string; previousInitial: string; previousFinal: string }) {
  const outputLanguage = input.language === "en" ? "English" : "Spanish";
  const outputRule = input.language === "en"
    ? "Write the entire report in English. Translate all section names, category names, strengths, recommendations, final comments, keywords, and success probability to natural business English."
    : "Redacta todo el reporte en español. Usa español natural de negocios para secciones, áreas, fortalezas, recomendaciones, comentarios finales, palabras clave y probabilidad de éxito.";
  return `Eres ScoreX, agente evaluador de CV. No reescribes CVs ni cartas. Entregas diagnóstico, puntajes, palabras clave y recomendaciones accionables.

Idioma de salida: ${outputLanguage}
Regla de idioma: ${outputRule}

Etapa: ${phaseLabel(input.phase, input.language)}
Nombre de evaluación: ${input.evaluationName}
CV seleccionado para evaluación contra vacante: ${input.vacancyCvTarget === "optimized" ? "CV optimizado usado en ScoreX final" : "CV original usado en ScoreX inicial"}

Si la etapa es inicial, evalúa el CV original antes de Optim.
Si la etapa es final, evalúa el CV optimizado después de Optim.
Si la etapa es comparativa, compara la evaluación inicial con la final. Basa el detalle, recomendaciones y comentarios en la información del ScoreX final, pero explica las mejoras contra el ScoreX inicial. No pidas otro CV para esta etapa.
Si la etapa es contra vacante, evalúa compatibilidad del CV seleccionado con la vacante, posibilidades de éxito, palabras clave faltantes y recomendaciones según perfil y objetivo. Además compara la probabilidad estimada del CV original contra la del CV optimizado usando los reportes previos inicial/final y la vacante. Devuelve vacancyComparison.originalProbability y vacancyComparison.optimizedProbability como números de 0 a 100. El score principal debe corresponder al CV seleccionado.
Si la etapa no es contra vacante, devuelve vacancyComparison.originalProbability y vacancyComparison.optimizedProbability en 0.

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

Devuelve el reporte en ${outputLanguage}, con score de 0 a 100.`;
}

function parseReport(value: string): ScorexReport | undefined {
  if (!value.trim()) return undefined;
  try {
    return JSON.parse(value) as ScorexReport;
  } catch {
    return undefined;
  }
}

function renderScorexHtml(report: ScorexReport, phase: ScorexPhase, language: ReportLanguage, previousInitialReport?: ScorexReport, previousFinalReport?: ScorexReport) {
  const copy = reportCopy[language];
  const list = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const finalCategories = previousFinalReport?.categories?.length === 5 ? previousFinalReport.categories : report.categories;
  const initialCategories = previousInitialReport?.categories?.length === 5 ? previousInitialReport.categories : undefined;
  const finalComments = report.finalComments.trim() || copy.finalCommentsFallback;
  const rows = phase === "comparative" && initialCategories
    ? comparativeRows(initialCategories, finalCategories)
    : report.categories.map((category) => `<tr><td>${escapeHtml(category.area)}</td><td>${Math.round(category.score)}/100</td><td>${Math.round(category.ideal)}/100</td><td>${Math.round(category.deviation)}</td></tr>`).join("");
  const sections = report.categories.map((category, index) => `<section class="scorex-section"><h2>${roman(index + 1)}. ${escapeHtml(category.area)}</h2><h3>${copy.strengths}</h3><ul>${list(category.strengths)}</ul><h3>${copy.improvements}</h3><ul>${list(category.improvements)}</ul></section>`).join("");
  const tableHead = phase === "comparative" && initialCategories
    ? `<tr><th>${copy.area}</th><th>${copy.initialScore}</th><th>${copy.finalScore}</th><th>${copy.comparativeDeviation}</th></tr>`
    : `<tr><th>${copy.area}</th><th>${copy.score}</th><th>${copy.ideal}</th><th>${copy.deviation}</th></tr>`;
  const radar = phase === "comparative" && initialCategories
    ? comparativeRadarSvg(initialCategories, finalCategories)
    : blueRadarSvg(report.categories);
  return `<article class="scorex-report"><p class="ey-kicker">${phaseLabel(phase, language)}</p><h1>${copy.mainTitle}</h1><div class="scorex-meta"><p><strong>${copy.candidateName}</strong> ${escapeHtml(report.candidateName)}</p><p><strong>${copy.profile}</strong> ${escapeHtml(report.profileLevel)}</p><p><strong>${copy.optimization}</strong> ${escapeHtml(report.optimizationStatus)}</p><p><strong>${copy.document}</strong> ${escapeHtml(report.evaluatedDocument)}</p></div><div class="scorex-global"><span>${copy.globalScore}</span><strong>${Math.round(report.score)}/100</strong></div><p class="scorex-summary">${escapeHtml(report.executiveSummary)}</p>${sections}<h2>${copy.table}</h2><table class="scorex-table"><thead>${tableHead}</thead><tbody>${rows}</tbody></table><h2>${copy.comparativeRadar}</h2>${radar}<h2>${copy.alerts}</h2><ul>${list(report.alerts)}</ul><h2>${copy.comments}</h2><p>${escapeHtml(finalComments)}</p><h2>${copy.nextSteps}</h2><ul>${list(report.nextSteps)}</ul><h2>${copy.keywords}</h2><ul>${list(report.keywords)}</ul><h2>${copy.successProbability}</h2><p>${escapeHtml(report.successProbability)}</p></article>`;
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
  if (normalized.includes("ats") || normalized.includes("optimizacion") || normalized.includes("optimization")) return normalized.includes("optimization") ? ["ATS", "optimization"] : ["Optimizaci\u00f3n", "ATS"];
  if (normalized.includes("formato") || normalized.includes("format")) return normalized.includes("format") ? ["Format and", "presentation"] : ["Formato y", "presentaci\u00f3n"];
  if (normalized.includes("logros") || normalized.includes("achievements") || normalized.includes("contributions")) return normalized.includes("achievements") || normalized.includes("contributions") ? ["Achievements", "and impact"] : ["Logros y", "contribuciones"];
  if (normalized.includes("claridad") || normalized.includes("clarity") || normalized.includes("readability")) return normalized.includes("clarity") || normalized.includes("readability") ? ["Clarity and", "readability"] : ["Claridad y", "legibilidad"];
  if (normalized.includes("brevedad") || normalized.includes("brevity") || normalized.includes("precision")) return normalized.includes("brevity") || normalized.includes("precision") ? ["Brevity and", "precision"] : ["Brevedad y", "precisi\u00f3n"];
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
