import { NextResponse } from "next/server";
import { canUseDevAdminLogin, getCurrentUser, getOrCreateDemoUser } from "@/services/authService";
import { assertAvatarAccess, chargeCredits, getModulePrice, recordAvatarTrial } from "@/services/creditService";

type OptimMode = "scratch" | "optimize" | "adapt";
type OptimLanguage = "es" | "en";
type OpenAiContent = { type: "input_text"; text: string } | { type: "input_file"; filename: string; file_data: string };
type OptimResponse = {
  assistantMessage: string;
  cvTitle: string;
  cvHtml: string;
  coverLetterHtml: string;
  thankYouLetterHtml: string;
  keywords: string[];
  atsWarnings: string[];
  nextQuestions: string[];
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const mode = normalizeMode(String(formData.get("mode") ?? "scratch"));
    const language = normalizeLanguage(String(formData.get("language") ?? "es"));
    const targetRole = String(formData.get("targetRole") ?? "");
    const profileLevel = String(formData.get("profileLevel") ?? "");
    const userInstructions = String(formData.get("userInstructions") ?? "");
    const collectedAnswers = String(formData.get("collectedAnswers") ?? "");
    const vacancyText = String(formData.get("vacancyText") ?? "");
    const currentCv = formData.get("currentCv");
    const vacancyFile = formData.get("vacancyFile");
    const user = (await getCurrentUser()) ?? (canUseDevAdminLogin() ? getOrCreateDemoUser() : undefined);
    if (!user) return NextResponse.json({ error: "Necesitas iniciar sesion para usar Optim." }, { status: 401 });

    const access = assertAvatarAccess(user.id, ["optim"], getModulePrice("optim"));
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const fallback = buildFallbackResponse({ mode, language, targetRole, profileLevel, userInstructions });
      if (access.mode === "trial") recordAvatarTrial(user.id, ["optim"]);
      chargeCredits(user.id, access.creditsToCharge, `Optim ${mode}`);
      return NextResponse.json({ ...fallback, accessMode: access.mode, creditsCharged: access.creditsToCharge });
    }

    const content: OpenAiContent[] = [{ type: "input_text", text: buildOptimPrompt({ mode, language, targetRole, profileLevel, userInstructions, collectedAnswers, vacancyText }) }];
    if (currentCv instanceof File) content.push(await fileToInput(currentCv, "CV actual del candidato"));
    if (vacancyFile instanceof File) content.push(await fileToInput(vacancyFile, "Vacante objetivo"));

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "optim_cv_response",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["assistantMessage", "cvTitle", "cvHtml", "coverLetterHtml", "thankYouLetterHtml", "keywords", "atsWarnings", "nextQuestions"],
              properties: {
                assistantMessage: { type: "string" },
                cvTitle: { type: "string" },
                cvHtml: { type: "string" },
                coverLetterHtml: { type: "string" },
                thankYouLetterHtml: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                atsWarnings: { type: "array", items: { type: "string" } },
                nextQuestions: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ error: payload.error?.message ?? "No se pudo generar Optim." }, { status: response.status });
    const optimResponse = JSON.parse(extractResponseText(payload)) as OptimResponse;
    if (access.mode === "trial") recordAvatarTrial(user.id, ["optim"]);
    chargeCredits(user.id, access.creditsToCharge, `Optim ${mode}`);
    return NextResponse.json({ ...optimResponse, accessMode: access.mode, creditsCharged: access.creditsToCharge });
  } catch (error) {
    if (error instanceof Error && error.message === "AVATAR_TRIAL_USED") return NextResponse.json({ error: "Ya usaste tu prueba gratuita de Optim. Compra creditos para usar este avatar cuantas veces lo necesites." }, { status: 402 });
    if (error instanceof Error && error.message === "STAR_AVATAR_REQUIRES_PURCHASE") return NextResponse.json({ error: "Optim es un avatar estrella. Compra creditos para desbloquearlo." }, { status: 402 });
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") return NextResponse.json({ error: "No tienes creditos suficientes para usar Optim." }, { status: 402 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error inesperado en Optim." }, { status: 500 });
  }
}

async function fileToInput(file: File, label: string): Promise<OpenAiContent> {
  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  if (file.type.startsWith("text/") || /\.txt$/i.test(file.name)) return { type: "input_text", text: `${label} (${file.name}):\n${Buffer.from(bytes, "base64").toString("utf8")}` };
  return { type: "input_file", filename: file.name, file_data: `data:${file.type || "application/octet-stream"};base64,${bytes}` };
}

function buildOptimPrompt(input: { mode: OptimMode; language: OptimLanguage; targetRole: string; profileLevel: string; userInstructions: string; collectedAnswers: string; vacancyText: string }) {
  const outputLanguage = input.language === "en" ? "English" : "Spanish";
  const modeInstruction = {
    scratch: "Create a Harvard Traditional CV from scratch using the collected answers. Ask only for missing mandatory data in nextQuestions.",
    optimize: "Optimize the supplied CV. Convert responsibilities into truthful STAR achievements. Keep the CV ideally to two pages; allow up to three only when senior experience requires it.",
    adapt: "Adapt the supplied CV to the vacancy. Identify keywords and align language only where the candidate can defend it in an interview. Do not fabricate skills, tools, results, certifications, or scope.",
  }[input.mode];

  return `You are Optim, an employability CV coach. Generate a recruiter-friendly Harvard Traditional CV and companion letters.

Output language: ${outputLanguage}. Write every visible heading, bullet, letter, warning, and question in ${outputLanguage}.
Mode: ${input.mode}
Instruction: ${modeInstruction}
Target role: ${input.targetRole || "Not provided"}
Candidate level: ${input.profileLevel || "Not provided"}
User instructions: ${input.userInstructions || "Not provided"}
Collected chat answers: ${input.collectedAnswers || "Not provided"}
Vacancy text: ${input.vacancyText || "Not provided"}

Mandatory CV format:
- Return cvHtml as clean HTML only, no markdown, with class "optim-cv".
- Harvard Traditional CV, ATS-compatible: no photos, icons, tables, graphics, decorative lines, or columns made with tables.
- Arial font. Section headings uppercase, bold, blue RGB(0,102,204).
- Candidate name centered, uppercase, bold, blue.
- Target role centered, uppercase, bold, black.
- Include: contact header, target role, keywords separated by vertical bars, one-line personal brand, Professional Summary, Key Achievements, Key Skills, Professional Experience, Education, Additional Training when relevant, Languages when available.
- Achievements must be STAR-style and truthful. If a metric is missing, use a qualitative result and ask for the metric in nextQuestions.
- For experience older than 10 years with repetitive achievements, summarize briefly unless the user asks for more.
- Cover letter and thank-you letter must be separate clean HTML documents in coverLetterHtml and thankYouLetterHtml.
- Return keywords found/targeted, atsWarnings, and nextQuestions.`;
}

function buildFallbackResponse(input: { mode: OptimMode; language: OptimLanguage; targetRole: string; profileLevel: string; userInstructions: string }): OptimResponse {
  const en = input.language === "en";
  const role = input.targetRole || (en ? "TARGET ROLE" : "PUESTO OBJETIVO");
  const name = en ? "CANDIDATE NAME" : "NOMBRE DEL CANDIDATO";
  const cvHtml = `<article class="optim-cv"><h1>${name}</h1><p class="contact">Disponibilidad geográfica | +52 000 000 0000 | correo@ejemplo.com | linkedin.com/in/perfil</p><h2 class="target">${escapeHtml(role)}</h2><p><strong>${en ? "Leadership" : "Liderazgo"}</strong> | <strong>${en ? "Process Improvement" : "Mejora de procesos"}</strong> | <strong>${en ? "Business Impact" : "Impacto de negocio"}</strong></p><p>${en ? "Driving measurable outcomes through strategic execution and clear professional value." : "Impulso resultados medibles mediante ejecución estratégica y una propuesta de valor profesional clara."}</p><h3>${en ? "PROFESSIONAL SUMMARY" : "RESUMEN PROFESIONAL"}</h3><p>${en ? "I am a results-oriented professional with experience aligning operational execution, stakeholder needs, and measurable business outcomes." : "Soy un profesional orientado a resultados, con experiencia alineando ejecución operativa, necesidades de los interesados e impacto medible para el negocio."}</p><h3>${en ? "KEY ACHIEVEMENTS" : "LOGROS DESTACADOS"}</h3><ul><li>${en ? "Improved operational visibility by organizing responsibilities into measurable STAR achievements." : "Mejoré la visibilidad profesional al organizar responsabilidades en logros medibles con metodología STAR."}</li><li>${en ? "Strengthened ATS alignment by prioritizing keywords, scope, tools, and business outcomes." : "Fortalecí la compatibilidad ATS al priorizar palabras clave, alcance, herramientas y resultados de negocio."}</li><li>${en ? "Reduced recruiter scanning friction by keeping older or repetitive experience concise." : "Reduje fricción de lectura para reclutadores al mantener experiencia antigua o repetitiva de forma concisa."}</li></ul><h3>${en ? "KEY SKILLS" : "HABILIDADES CLAVE"}</h3><p>${en ? "Process Optimization | Stakeholder Management | Strategic Communication" : "Optimización de procesos | Gestión de stakeholders | Comunicación estratégica"}</p><p>${en ? "KPI Tracking | Cross-Functional Collaboration | Continuous Improvement" : "Seguimiento de KPI | Colaboración multifuncional | Mejora continua"}</p><p>${en ? "Problem Solving | Leadership | Change Management" : "Solución de problemas | Liderazgo | Gestión del cambio"}</p><h3>${en ? "PROFESSIONAL EXPERIENCE" : "EXPERIENCIA PROFESIONAL"}</h3><p><strong>${en ? "Company Name" : "Nombre de empresa"}</strong><br>${escapeHtml(role)} | 2022 - ${en ? "Present" : "Actualidad"}</p><p>${en ? "Led role-related responsibilities with focus on measurable contribution, collaboration, and execution quality." : "Lideré responsabilidades relacionadas con el puesto, con foco en contribución medible, colaboración y calidad de ejecución."}</p><ul><li>${en ? "Delivered improvements by analyzing current processes, coordinating actions, and documenting business impact." : "Entregué mejoras al analizar procesos actuales, coordinar acciones y documentar impacto de negocio."}</li></ul><h3>${en ? "EDUCATION" : "EDUCACIÓN"}</h3><p>${en ? "Degree or certification pending confirmation." : "Grado académico o certificación pendiente de confirmar."}</p></article>`;
  return {
    assistantMessage: en ? "I prepared a first Harvard-format preview. Add real names, metrics, employers, and dates so Optim can make it stronger." : "Preparé un primer preview en formato Harvard. Agrega nombres reales, métricas, empresas y fechas para que Optim lo fortalezca.",
    cvTitle: role,
    cvHtml,
    coverLetterHtml: buildLetterHtml(en, "cover", role),
    thankYouLetterHtml: buildLetterHtml(en, "thanks", role),
    keywords: en ? ["Leadership", "Process Improvement", "Business Impact"] : ["Liderazgo", "Mejora de procesos", "Impacto de negocio"],
    atsWarnings: en ? ["Add exact tools and measurable KPIs.", "Confirm dates and employer names."] : ["Agrega herramientas exactas y KPI medibles.", "Confirma fechas y nombres de empresas."],
    nextQuestions: en ? ["What is your full name and contact line?", "Which three achievements can be quantified?", "What target role should appear in the CV?"] : ["¿Cuál es tu nombre completo y línea de contacto?", "¿Qué tres logros puedes cuantificar?", "¿Qué puesto objetivo debe aparecer en el CV?"],
  };
}

function buildLetterHtml(en: boolean, type: "cover" | "thanks", role: string) {
  const title = type === "cover" ? (en ? "COVER LETTER" : "CARTA DE PRESENTACIÓN") : (en ? "THANK-YOU LETTER" : "CARTA DE AGRADECIMIENTO");
  const body = type === "cover"
    ? (en ? `I am pleased to submit my profile for the ${role} opportunity. My experience, achievements, and professional focus align with the needs of the role, and I would welcome the opportunity to discuss how I can contribute.` : `Me permito presentar mi perfil para la oportunidad de ${role}. Mi experiencia, logros y enfoque profesional se alinean con las necesidades del puesto, y será un gusto conversar sobre cómo puedo contribuir.`)
    : (en ? `Thank you for the opportunity to discuss the ${role} position. I appreciate your time and remain interested in contributing with measurable impact, professionalism, and commitment.` : `Gracias por la oportunidad de conversar sobre la posición de ${role}. Aprecio su tiempo y reitero mi interés en contribuir con impacto medible, profesionalismo y compromiso.`);
  return `<article class="optim-letter"><h1>${title}</h1><p>${body}</p><p>Atentamente,<br><strong>${en ? "Candidate Name" : "Nombre del candidato"}</strong></p></article>`;
}

function extractResponseText(payload: unknown): string {
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (response.output_text) return response.output_text;
  const text = response.output?.flatMap((item) => item.content ?? []).map((part) => part.text).find(Boolean);
  if (!text) throw new Error("OpenAI no devolvió texto JSON.");
  return text;
}

function normalizeMode(value: string): OptimMode {
  if (value === "optimize" || value === "adapt") return value;
  return "scratch";
}

function normalizeLanguage(value: string): OptimLanguage {
  return value === "en" ? "en" : "es";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}
