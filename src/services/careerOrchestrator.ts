import { z } from "zod";
import { skillRegistry, type SkillId } from "@/ai/skillRegistry";
import { estimateCredits, assertAvatarAccess, chargeCredits, recordAvatarTrial } from "@/services/creditService";
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
  creditsCharged: number;
  accessMode?: "trial" | "paid";
  trialModules?: SkillId[];
  executionPlan: string[];
  artifactsCreated: Artifact[];
};

const keywordRules: Array<{ moduleId: SkillId; keywords: string[]; intent: string }> = [
  { moduleId: "optim", keywords: ["optim", "cv", "curriculum", "resume"], intent: "cv_optimization" },
  { moduleId: "scorex", keywords: ["evalu", "score", "ats", "compatibilidad"], intent: "cv_scoring" },
  { moduleId: "miss_quest", keywords: ["entrevista", "interview", "preguntas"], intent: "interview_prep" },
  { moduleId: "mr_wow", keywords: ["pitch", "presentarme", "elevator"], intent: "pitch" },
  { moduleId: "mr_boost_linked", keywords: ["linkedin", "perfil"], intent: "linkedin" },
  { moduleId: "new_job_challenge", keywords: ["mercado", "tendencias", "brechas"], intent: "market_study" },
  { moduleId: "indiana_jobs", keywords: ["empleos", "vacantes", "trabajos", "buscar empleo"], intent: "job_search" },
  { moduleId: "recharge", keywords: ["desanimo", "frustr", "motiva", "cansado", "abandono"], intent: "resilience" },
  { moduleId: "mr_ikigai", keywords: ["ikigai", "norte", "proposito", "direccion profesional"], intent: "professional_direction" },
  { moduleId: "tommy_lee_picture", keywords: ["foto", "fotografia", "headshot", "imagen"], intent: "linkedin_photo" },
];

const artifactLabels: Record<string, string> = {
  scorex_inicial: "Reporte ScoreX inicial",
  scorex_final: "Reporte ScoreX final",
  scorex_comparativo: "Comparativo antes/despues",
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
  return true;
}

function missingInputsFor(modules: SkillId[], input: OrchestratorInput) {
  return unique(modules.flatMap((moduleId) => skillRegistry[moduleId].requiredInputs.filter((required) => !hasInput(required, input))));
}

function executionPlanFor(modules: SkillId[]) {
  return modules.map((moduleId, index) => {
    if (moduleId === "scorex" && index === 0) return "ScoreX evaluacion inicial";
    if (moduleId === "scorex") return "ScoreX evaluacion final / comparativo";
    if (moduleId === "optim") return "Optim optimizacion de CV";
    if (moduleId === "mr_wow") return "Mr. Wow elevator pitch";
    if (moduleId === "miss_quest") return "Miss Quest preparacion de entrevista";
    return skillRegistry[moduleId].name;
  });
}

function buildFormattedReport(params: { moduleName: string; title: string; type: string; prompt: string; creditsCharged: number }) {
  const generatedAt = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const artifactLabel = artifactLabels[params.type] ?? params.type.replaceAll("_", " ");

  return `
    <article class="report-document">
      <header class="report-hero">
        <p class="report-kicker">${params.moduleName} - ${artifactLabel}</p>
        <h1>${params.title}</h1>
        <p>Entregable mock generado para revisar estructura, navegacion y descarga antes de conectar la generacion final con IA.</p>
        <dl>
          <div><dt>Fecha</dt><dd>${generatedAt}</dd></div>
          <div><dt>Creditos</dt><dd>${params.creditsCharged}</dd></div>
          <div><dt>Estado</dt><dd>Listo para revision</dd></div>
        </dl>
      </header>
      <section>
        <h2>Resumen ejecutivo</h2>
        <p>El objetivo detectado fue: <strong>${params.prompt}</strong>. El reporte organiza hallazgos, prioridades y proximos pasos para que el usuario pueda actuar sin perder contexto.</p>
      </section>
      <section>
        <h2>Hallazgos principales</h2>
        <ul>
          <li>Perfil evaluado con foco en claridad, compatibilidad y propuesta de valor.</li>
          <li>Recomendaciones separadas por impacto inmediato, ajuste de narrativa y preparacion de siguiente accion.</li>
          <li>Entregable disponible en Mi Boveda con descarga HTML y contenido estructurado.</li>
        </ul>
      </section>
      <section>
        <h2>Plan de accion</h2>
        <ol>
          <li>Completar datos faltantes o archivos reales cuando aplique.</li>
          <li>Revisar el contenido optimizado y ajustar tono, metricas y logros.</li>
          <li>Exportar el reporte y usarlo como base para la version DOCX/PDF final.</li>
        </ol>
      </section>
    </article>
  `;
}

function buildMockArtifact(moduleId: SkillId, input: OrchestratorInput, creditsCharged: number): Omit<Artifact, "id" | "version" | "status" | "createdAt" | "updatedAt"> {
  const skill = skillRegistry[moduleId];
  const type = skill.outputTypes[0];
  const title = `${skill.name} - ${input.prompt.slice(0, 54)}${input.prompt.length > 54 ? "..." : ""}`;
  const contentJson = {
    moduleId,
    prompt: input.prompt,
    summary: `Resultado mock de ${skill.name} para Fase 1.`,
    recommendations: ["Validar datos faltantes antes de produccion", "Conectar aiService con OpenAI en Fase 2", "Versionar y descargar el entregable desde Mi Boveda"],
  };
  const htmlContent = buildFormattedReport({ moduleName: skill.name, title, type, prompt: input.prompt, creditsCharged });
  return { userId: input.userId, projectId: input.projectId, type, title, description: skill.description, moduleId, prompt: input.prompt, contentJson, htmlContent, creditsCharged };
}

export async function analyzePrompt(rawInput: unknown): Promise<OrchestratorResponse> {
  const input = orchestratorInputSchema.parse(rawInput);
  const { modules, intent } = detectModules(input.prompt, input.selectedModule);
  const estimatedCredits = estimateCredits(modules);
  const missingInputs = missingInputsFor(modules, input);
  const baseResponse = { detectedIntent: intent, requiredModules: modules, missingInputs, estimatedCredits, creditsCharged: estimatedCredits, executionPlan: executionPlanFor(modules), artifactsCreated: [] as Artifact[] };

  if (missingInputs.length > 0) {
    return { ...baseResponse, status: "needs_input", message: `Para continuar necesito: ${missingInputs.join(", ")}.` };
  }

  let access: ReturnType<typeof assertAvatarAccess>;
  try {
    access = assertAvatarAccess(input.userId, modules, estimatedCredits);
  } catch (error) {
    if (error instanceof Error && error.message === "AVATAR_TRIAL_USED") {
      const blockedModules = ((error.cause as { blockedModules?: string[] } | undefined)?.blockedModules ?? [])
        .map((moduleId) => skillRegistry[moduleId as SkillId]?.name ?? moduleId);
      return { ...baseResponse, status: "insufficient_credits", message: `Ya usaste tu prueba gratuita de ${blockedModules.join(", ")}. Compra creditos para usar este avatar cuantas veces lo necesites.` };
    }
    if (error instanceof Error && error.message === "STAR_AVATAR_REQUIRES_PURCHASE") {
      const blockedModules = ((error.cause as { blockedModules?: string[] } | undefined)?.blockedModules ?? [])
        .map((moduleId) => skillRegistry[moduleId as SkillId]?.name ?? moduleId);
      return { ...baseResponse, status: "insufficient_credits", message: `${blockedModules.join(", ")} es un avatar estrella. Compra creditos para desbloquearlo.` };
    }
    return { ...baseResponse, status: "insufficient_credits", message: `Necesitas ${estimatedCredits} creditos para ejecutar este plan, o una prueba gratuita disponible por avatar.` };
  }

  const accessResponse = { ...baseResponse, creditsCharged: access.creditsToCharge, accessMode: access.mode, trialModules: access.trialModules as SkillId[] };
  if (!input.execute) {
    return {
      ...accessResponse,
      status: "ready",
      message: access.mode === "trial" ? "Plan listo para ejecutar con acceso de prueba. Tambien descontara los creditos del avatar y solo puede usarse una vez antes de comprar." : "Plan listo para ejecutar con creditos.",
    };
  }

  const artifactsCreated: Artifact[] = [];
  const moduleRunId = newId();
  const run: ModuleRun = { id: moduleRunId, userId: input.userId, projectId: input.projectId, moduleId: "career_orchestrator", inputJson: input, outputJson: undefined, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, estimatedCostMxn: 0, creditsCharged: access.creditsToCharge, status: "running", createdAt: now() };
  getStore().moduleRuns.push(run);

  for (const moduleId of modules) {
    const aiResult = await runMockAgent(buildMockArtifact(moduleId, input, skillRegistry[moduleId].baseCredits));
    artifactsCreated.push(createArtifact(aiResult.output));
    run.inputTokens += aiResult.inputTokens;
    run.outputTokens += aiResult.outputTokens;
  }

  run.status = "success";
  run.outputJson = { artifactsCreated: artifactsCreated.map((artifact) => artifact.id) };
  if (access.mode === "trial") recordAvatarTrial(input.userId, modules, moduleRunId);
  chargeCredits(input.userId, access.creditsToCharge, `Ejecucion de plan: ${modules.join(", ")}`, moduleRunId);

  getStore().auditLogs.push({ id: newId(), userId: input.userId, action: "ai.execute", entityType: "module_run", entityId: moduleRunId, metadataJson: { modules, estimatedCredits, creditsCharged: access.creditsToCharge, accessMode: access.mode }, createdAt: now() });
  return {
    ...accessResponse,
    status: "completed",
    message: access.mode === "trial" ? "Plan ejecutado con acceso de prueba, creditos descontados y entregables guardados en Mi Boveda." : "Plan ejecutado y entregables guardados en Mi Boveda.",
    artifactsCreated,
  };
}
