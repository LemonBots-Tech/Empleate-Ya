import { z } from "zod";
import { skillRegistry, type SkillId } from "@/ai/skillRegistry";
import { estimateCredits, assertSufficientCredits, chargeCredits } from "@/services/creditService";
import { createArtifact } from "@/services/artifactService";
import { runMockAgent } from "@/services/aiService";
import { getStore, newId, now, type Artifact, type ModuleRun } from "@/lib/mockdb/store";

export const orchestratorInputSchema = z.object({
  userId: z.string().min(1),
  prompt: z.string().min(3),
  projectId: z.string().optional(),
  files: z.array(z.object({ id: z.string(), fileType: z.string().optional(), originalName: z.string().optional() })).default([]),
  selectedModule: z.string().optional(),
  execute: z.boolean().default(false),
});

export type OrchestratorInput = z.infer<typeof orchestratorInputSchema>;
export type OrchestratorResponse = {
  status: "needs_input" | "insufficient_credits" | "ready" | "completed";
  message: string;
  detectedIntent: string;
  requiredModules: SkillId[];
  missingInputs: string[];
  estimatedCredits: number;
  executionPlan: string[];
  artifactsCreated: Artifact[];
};

const keywordRules: Array<{ moduleId: SkillId; keywords: string[]; intent: string }> = [
  { moduleId: "clio", keywords: ["clío", "clio", "tarot", "oráculo", "oraculo", "tirada", "futuro laboral"], intent: "symbolic_career_tarot" },
  { moduleId: "lumo", keywords: ["pilares", "prioridades", "punto de partida", "descubrirme"], intent: "life_discovery" },
  { moduleId: "boost_me", keywords: ["plan de acción", "impúlsame", "impulsame", "objetivos"], intent: "personal_action_plan" },
  { moduleId: "scorex_360", keywords: ["scorex 360", "internacional", "ats internacional"], intent: "international_ats_audit" },
  { moduleId: "optim", keywords: ["optim", "cv", "curriculum", "currículum", "resume"], intent: "cv_optimization" },
  { moduleId: "scorex", keywords: ["evalu", "score", "ats", "compatibilidad"], intent: "cv_scoring" },
  { moduleId: "miss_quest", keywords: ["entrevista", "interview", "preguntas"], intent: "interview_prep" },
  { moduleId: "mr_wow", keywords: ["pitch", "presentarme", "elevator"], intent: "pitch" },
  { moduleId: "mr_boost_linked", keywords: ["linkedin", "perfil"], intent: "linkedin" },
  { moduleId: "new_job_challenge", keywords: ["mercado", "tendencias", "brechas"], intent: "market_study" },
  { moduleId: "indiana_jobs", keywords: ["empleos", "vacantes", "trabajos", "buscar empleo"], intent: "job_search" },
  { moduleId: "recharge", keywords: ["desánimo", "frustr", "motiva", "cansado", "abandono"], intent: "resilience" },
  { moduleId: "mr_ikigai", keywords: ["ikigai", "norte", "propósito", "direccion profesional"], intent: "professional_direction" },
  { moduleId: "tommy_lee_picture", keywords: ["foto", "fotografía", "headshot", "imagen"], intent: "linkedin_photo" },
];

const artifactLabels: Record<string, string> = {
  scorex_inicial: "Reporte ScoreX inicial",
  scorex_final: "Reporte ScoreX final",
  scorex_comparativo: "Comparativo antes/después",
  cv_optimizado: "CV optimizado",
  cv_adaptado: "CV adaptado",
  linkedin_optimizado: "LinkedIn optimizado",
  elevator_pitch: "Elevator pitch",
  reporte_entrevista: "Reporte de entrevista",
  estudio_mercado: "Estudio de mercado laboral",
  vacantes_guardadas: "Vacantes priorizadas",
  plan_recharge: "Plan Recharge",
  mapa_ikigai: "Mapa Ikigai",
  foto_linkedin: "Foto LinkedIn",
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function detectModules(prompt: string, selectedModule?: string): { modules: SkillId[]; intent: string } {
  if (selectedModule && selectedModule in skillRegistry) return { modules: [selectedModule as SkillId], intent: `selected_${selectedModule}` };
  const normalized = prompt.toLowerCase();
  const matched = keywordRules.filter((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  let modules = unique(matched.map((rule) => rule.moduleId));
  if (normalized.includes("optim") && normalized.includes("entrevista")) modules = unique(["scorex", "optim", "scorex", "mr_wow", "miss_quest"] as SkillId[]);
  if (modules.includes("optim") && !modules.includes("scorex")) modules = ["scorex", ...modules];
  if (modules.length === 0) modules = ["recharge"];
  return { modules, intent: matched.map((rule) => rule.intent).join("+") || "general_guidance" };
}

function hasInput(inputName: string, input: OrchestratorInput) {
  const prompt = input.prompt.toLowerCase();
  if (inputName === "cv_file") return input.files.some((file) => file.fileType === "cv_file" || file.originalName?.toLowerCase().includes("cv")) || prompt.includes("crear cv desde cero");
  if (inputName === "job_posting") return input.files.some((file) => file.fileType === "job_posting") || prompt.includes("vacante");
  if (inputName === "target_role") return /gerente|manager|analista|director|desarrollador|comercial|ventas|project/i.test(input.prompt);
  if (inputName === "professional_profile") return true;
  if (inputName === "linkedin_url_or_profile") return prompt.includes("linkedin");
  if (inputName === "photo_file") return input.files.some((file) => file.fileType === "photo_file");
  if (inputName === "image_processing_consent") return false;
  if (inputName === "mood_signal") return true;
  if (inputName === "reflection_answers") return prompt.length > 20;
  if (inputName === "oracle_question") return prompt.length > 3;
  if (inputName === "career_stage") return true;
  if (inputName === "goals") return prompt.length > 10;
  return true;
}

function missingInputsFor(modules: SkillId[], input: OrchestratorInput) {
  return unique(modules.flatMap((moduleId) => skillRegistry[moduleId].requiredInputs.filter((required) => !hasInput(required, input))));
}

function executionPlanFor(modules: SkillId[]) {
  return modules.map((moduleId, index) => {
    if (moduleId === "scorex" && index === 0) return "ScoreX evaluación inicial";
    if (moduleId === "scorex") return "ScoreX evaluación final / comparativo";
    if (moduleId === "optim") return "Optim optimización de CV";
    if (moduleId === "mr_wow") return "Mr. Wow elevator pitch";
    if (moduleId === "miss_quest") return "Miss Quest preparación de entrevista";
    return skillRegistry[moduleId].name;
  });
}

function buildFormattedReport(params: { moduleName: string; title: string; type: string; prompt: string; creditsCharged: number }) {
  const generatedAt = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const artifactLabel = artifactLabels[params.type] ?? params.type.replaceAll("_", " ");

  return `
    <article class="report-document">
      <header class="report-hero">
        <p class="report-kicker">${params.moduleName} · ${artifactLabel}</p>
        <h1>${params.title}</h1>
        <p>Entregable mock generado para revisar estructura, navegación y descarga antes de conectar la generación final con IA.</p>
        <dl>
          <div><dt>Fecha</dt><dd>${generatedAt}</dd></div>
          <div><dt>Créditos</dt><dd>${params.creditsCharged}</dd></div>
          <div><dt>Estado</dt><dd>Listo para revisión</dd></div>
        </dl>
      </header>
      <section>
        <h2>Resumen ejecutivo</h2>
        <p>El objetivo detectado fue: <strong>${params.prompt}</strong>. El reporte organiza hallazgos, prioridades y próximos pasos para que el usuario pueda actuar sin perder contexto.</p>
      </section>
      <section>
        <h2>Hallazgos principales</h2>
        <ul>
          <li>Perfil evaluado con foco en claridad, compatibilidad y propuesta de valor.</li>
          <li>Recomendaciones separadas por impacto inmediato, ajuste de narrativa y preparación de siguiente acción.</li>
          <li>Entregable disponible en Mi Bóveda con descarga HTML y contenido estructurado.</li>
        </ul>
      </section>
      <section>
        <h2>Plan de acción</h2>
        <ol>
          <li>Completar datos faltantes o archivos reales cuando aplique.</li>
          <li>Revisar el contenido optimizado y ajustar tono, métricas y logros.</li>
          <li>Exportar el reporte y usarlo como base para la versión DOCX/PDF final.</li>
        </ol>
      </section>
    </article>
  `;
}

function buildMockArtifact(moduleId: SkillId, input: OrchestratorInput, creditsCharged: number): Omit<Artifact, "id" | "version" | "status" | "createdAt" | "updatedAt"> {
  const skill = skillRegistry[moduleId];
  const type = skill.outputTypes[0];
  const title = `${skill.name} · ${input.prompt.slice(0, 54)}${input.prompt.length > 54 ? "..." : ""}`;
  const isClio = moduleId === "clio";
  const contentJson = {
    moduleId,
    prompt: input.prompt,
    summary: isClio ? "Lectura simbólica de tres cartas para reflexionar y avanzar con esperanza." : `Resultado mock de ${skill.name} para Fase 1.`,
    recommendations: isClio ? ["El Carro: reconoce tu impulso", "La Estrella: conecta con una posibilidad", "El Mundo: define tu siguiente acción", "Esta lectura es simbólica y motivacional; tu futuro se construye con tus decisiones."] : ["Validar datos faltantes antes de producción", "Conectar aiService con OpenAI en Fase 2", "Versionar y descargar el entregable desde Mi Bóveda"],
  };
  const htmlContent = isClio
    ? `<article><h1>${title}</h1><p>Lectura simbólica y motivacional.</p><section><h2>El Carro · Raíz</h2><p>Tu experiencia ya contiene impulso y dirección.</p></section><section><h2>La Estrella · Presente</h2><p>Hay espacio para recuperar esperanza y visibilidad.</p></section><section><h2>El Mundo · Próximo paso</h2><p>Elige una acción concreta y complétala esta semana.</p></section><p><strong>Esta lectura es simbólica y motivacional; tu futuro se construye con tus decisiones.</strong></p></article>`
    : buildFormattedReport({ moduleName: skill.name, title, type, prompt: input.prompt, creditsCharged });
  return { userId: input.userId, projectId: input.projectId, type, title, description: skill.description, moduleId, prompt: input.prompt, contentJson, htmlContent, creditsCharged };
}

export async function analyzePrompt(rawInput: unknown): Promise<OrchestratorResponse> {
  const input = orchestratorInputSchema.parse(rawInput);
  const { modules, intent } = detectModules(input.prompt, input.selectedModule);
  const estimatedCredits = estimateCredits(modules);
  const missingInputs = missingInputsFor(modules, input);
  const baseResponse = { detectedIntent: intent, requiredModules: modules, missingInputs, estimatedCredits, executionPlan: executionPlanFor(modules), artifactsCreated: [] as Artifact[] };
  if (missingInputs.length > 0) {
    return { ...baseResponse, status: "needs_input", message: `Para continuar necesito: ${missingInputs.join(", ")}.` };
  }
  try {
    assertSufficientCredits(input.userId, estimatedCredits);
  } catch {
    return { ...baseResponse, status: "insufficient_credits", message: `Necesitas ${estimatedCredits} créditos para ejecutar este plan.` };
  }
  if (!input.execute) return { ...baseResponse, status: "ready", message: "Plan listo para ejecutar." };

  const artifactsCreated: Artifact[] = [];
  const moduleRunId = newId();
  const run: ModuleRun = { id: moduleRunId, userId: input.userId, projectId: input.projectId, moduleId: "career_orchestrator", inputJson: input, outputJson: undefined, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, estimatedCostMxn: 0, creditsCharged: estimatedCredits, status: "running", createdAt: now() };
  getStore().moduleRuns.push(run);
  for (const moduleId of modules) {
    const aiResult = await runMockAgent(buildMockArtifact(moduleId, input, skillRegistry[moduleId].baseCredits));
    artifactsCreated.push(createArtifact(aiResult.output));
    run.inputTokens += aiResult.inputTokens;
    run.outputTokens += aiResult.outputTokens;
  }
  run.status = "success";
  run.outputJson = { artifactsCreated: artifactsCreated.map((artifact) => artifact.id) };
  chargeCredits(input.userId, estimatedCredits, `Ejecución de plan: ${modules.join(", ")}`, moduleRunId);
  getStore().auditLogs.push({ id: newId(), userId: input.userId, action: "ai.execute", entityType: "module_run", entityId: moduleRunId, metadataJson: { modules, estimatedCredits }, createdAt: now() });
  return { ...baseResponse, status: "completed", message: "Plan ejecutado y entregables guardados en Mi Bóveda.", artifactsCreated };
}
