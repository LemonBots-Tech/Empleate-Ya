"use client";

import { useEffect, useState } from "react";
import { Bot, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type CreatedArtifact = {
  id: string;
  title: string;
  type: string;
  moduleId: string;
  htmlContent?: string;
  creditsCharged: number;
};

type GatewayResult = {
  status: string;
  message: string;
  detectedIntent: string;
  requiredModules: string[];
  missingInputs: string[];
  estimatedCredits: number;
  creditsCharged?: number;
  accessMode?: "trial" | "paid";
  executionPlan: string[];
  artifactsCreated?: CreatedArtifact[];
  error?: string;
};

const gatewayWidgetCopy = {
  es: {
    defaultPrompt: "Quiero optimizar mi CV para una vacante y prepararme para entrevista.",
    faqDefaultPrompt: "Hola, quiero saber cómo funciona Empléate YA y qué opción me conviene.",
    eyebrow: "Gateway orquestador",
    faqEyebrow: "Chat online",
    title: "Una pregunta, el equipo correcto.",
    faqTitle: "Pregúntanos sobre Empléate YA.",
    description: "Describe tu objetivo. El Gateway detectará la intención y combinará uno o más asistentes antes de usar créditos.",
    faqDescription: "Resuelve dudas frecuentes sobre créditos, coaching, empresas, emprendedores, privacidad y agentes antes de comenzar.",
    placeholder: "¿Qué quieres lograr hoy?",
    faqPlaceholder: "Escribe tu pregunta sobre Empléate YA...",
    analyze: "Analizar plan",
    ask: "Enviar pregunta",
    execute: "Ejecutar demo",
    error: "No se pudo procesar el prompt.",
    faqStatus: "respuesta",
    credits: "créditos",
    charged: "Se cobrará",
    trial: "Acceso de prueba limitado",
    paid: "Uso con créditos",
    assistants: "Asistentes:",
    plan: "Plan propuesto",
    missing: "Falta:",
    reports: "Reportes creados",
    openVault: "Abrir Mi Bóveda",
    download: "Descargar HTML",
  },
  en: {
    defaultPrompt: "I want to optimize my resume for a job posting and prepare for an interview.",
    faqDefaultPrompt: "Hello, I want to understand how Empléate YA works and which option fits me best.",
    eyebrow: "Orchestrator Gateway",
    faqEyebrow: "Online chat",
    title: "One question, the right team.",
    faqTitle: "Ask us about Empléate YA.",
    description: "Describe your goal. The Gateway will detect intent and combine one or more assistants before using credits.",
    faqDescription: "Get quick answers about credits, coaching, companies, entrepreneurs, privacy, and agents before you start.",
    placeholder: "What do you want to achieve today?",
    faqPlaceholder: "Write your question about Empléate YA...",
    analyze: "Analyze plan",
    ask: "Send question",
    execute: "Run demo",
    error: "The prompt could not be processed.",
    faqStatus: "answer",
    credits: "credits",
    charged: "Will charge",
    trial: "Limited trial access",
    paid: "Paid credit use",
    assistants: "Assistants:",
    plan: "Proposed plan",
    missing: "Missing:",
    reports: "Created reports",
    openVault: "Open My Vault",
    download: "Download HTML",
  },
} as const;

const faqAnswers = {
  es: [
    {
      keywords: ["precio", "costo", "credito", "pago", "stripe"],
      answer: "Empléate YA funcionará con créditos para usuarios online y licencias para coaching, empresas y emprendedores. Los créditos se usarán para ejecutar agentes y generar entregables; los planes empresariales y de franquicia se definirán con licencia mensual y reglas propias.",
    },
    {
      keywords: ["coach", "coaching", "asesor", "asesoria", "1o1"],
      answer: "El servicio Coaching 1o1 combina acceso a la plataforma con acompañamiento de un coach de Empléate YA. Será un plan premium porque incluye seguimiento humano, sesiones, notas, evaluación de calidad y entregables.",
    },
    {
      keywords: ["empresa", "outplacement", "ex empleado", "ex-empleado", "colaborador"],
      answer: "Para empresas, la plataforma permitirá administrar campañas de outplacement, asignar ex-colaboradores, revisar avances autorizados y combinar acceso digital con coaching online o presencial cuando aplique.",
    },
    {
      keywords: ["emprendedor", "franquicia", "franquiciatario", "licencia"],
      answer: "Los emprendedores podrán operar como franquiciatarios con licencia mínima de 6 meses, curso online de metodología y clientes propios dentro de Empléate YA. Ellos administrarán a sus usuarios y podrán dar acompañamiento con nuestra metodología.",
    },
    {
      keywords: ["privacidad", "datos", "borrar", "eliminar", "consentimiento"],
      answer: "La información será del usuario. El modelo contempla consentimientos, auditoría de movimientos, separación por organización y solicitudes de borrado revisadas antes de eliminar información sensible.",
    },
    {
      keywords: ["scorex", "optim", "cv", "curriculum", "vacante"],
      answer: "ScoreX evalúa CVs y compatibilidad contra vacantes. Optim ayuda a crear, optimizar o adaptar CVs en formato Harvard, con cartas de presentación y agradecimiento.",
    },
    {
      keywords: ["whatsapp", "contacto", "telefono", "hablar"],
      answer: "Puedes contactarnos por WhatsApp desde el botón de esta pantalla. Por ahora el enlace abre una conversación al 55 4588 1648.",
    },
  ],
  en: [
    {
      keywords: ["price", "cost", "credit", "payment", "stripe"],
      answer: "Empléate YA will use credits for online users and licenses for coaching, companies, and entrepreneurs. Credits will run agents and generate deliverables; business and franchise plans will use monthly licenses with their own rules.",
    },
    {
      keywords: ["coach", "coaching", "advisor", "1o1", "one on one"],
      answer: "Coaching 1o1 combines platform access with a personal Empléate YA coach. It will be a premium plan because it includes human follow-up, sessions, notes, quality surveys, and deliverables.",
    },
    {
      keywords: ["company", "business", "outplacement", "employee", "former employee"],
      answer: "For companies, the platform will manage outplacement campaigns, assign former employees, review authorized progress, and combine digital access with online or in-person coaching when needed.",
    },
    {
      keywords: ["entrepreneur", "franchise", "license", "franchisee"],
      answer: "Entrepreneurs will operate as franchisees with a minimum 6-month license, online methodology training, and their own clients inside Empleate YA.",
    },
    {
      keywords: ["privacy", "data", "delete", "consent", "security"],
      answer: "User information belongs to the user. The model includes consent records, audit logs, organization-level separation, and reviewed deletion requests before sensitive data is removed.",
    },
    {
      keywords: ["scorex", "optim", "resume", "cv", "job posting", "vacancy"],
      answer: "ScoreX evaluates resumes and job-fit. Optim helps create, optimize, or tailor Harvard-format resumes with cover letters and thank-you letters.",
    },
    {
      keywords: ["whatsapp", "contact", "phone", "talk"],
      answer: "You can contact us through the WhatsApp button on this page. For now it opens a chat with +52 55 4588 1648.",
    },
  ],
} as const;

function normalizeText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buildFaqAnswer(language: keyof typeof faqAnswers, question: string) {
  const normalizedQuestion = normalizeText(question);
  const matched = faqAnswers[language].find((item) =>
    item.keywords.some((keyword) => normalizedQuestion.includes(normalizeText(keyword))),
  );

  if (matched) return matched.answer;

  return language === "es"
    ? "Puedo orientarte sobre agentes, créditos, coaching, empresas, emprendedores, privacidad y entregables. Cuéntame si buscas empleo, quieres mejorar tu CV, contratar coaching o explorar una solución para empresa."
    : "I can help with agents, credits, coaching, companies, entrepreneurs, privacy, and deliverables. Tell me if you are looking for a job, improving your resume, hiring coaching, or exploring a business solution.";
}

export function PromptGatewayClient({ compact = false, selectedModule, homeChat = false }: { compact?: boolean; selectedModule?: string; homeChat?: boolean }) {
  const { language } = useLanguage();
  const t = gatewayWidgetCopy[language];
  const defaultPrompt = homeChat ? t.faqDefaultPrompt : t.defaultPrompt;
  const [prompt, setPrompt] = useState<string>(defaultPrompt);
  const [promptEdited, setPromptEdited] = useState(false);
  const [result, setResult] = useState<GatewayResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!promptEdited) setPrompt(defaultPrompt);
  }, [defaultPrompt, promptEdited]);

  async function submit(execute: boolean) {
    setLoading(true);
    try {
      if (homeChat) {
        setResult({
          status: t.faqStatus,
          message: buildFaqAnswer(language, prompt),
          detectedIntent: "faq",
          requiredModules: [],
          missingInputs: [],
          estimatedCredits: 0,
          executionPlan: [],
        });
        return;
      }

      const response = await fetch(execute ? "/api/ai/execute" : "/api/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, selectedModule, files: [{ id: "demo-cv", fileType: "cv_file", originalName: "CV-demo.pdf" }] }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setResult({
          status: "error",
          message: data.error ?? t.error,
          detectedIntent: "request_error",
          requiredModules: [],
          missingInputs: [],
          estimatedCredits: 0,
          executionPlan: [],
          error: data.error,
        });
        return;
      }
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[var(--brand-border)] bg-gradient-to-br from-white via-white to-[var(--brand-primary-soft)] p-5 shadow-[0_24px_70px_-45px_rgba(109,40,217,0.38)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-primary)]"><Network size={15} /> {homeChat ? t.faqEyebrow : t.eyebrow}</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{homeChat ? t.faqTitle : t.title}</h2>
        </div>
        <Bot className="text-[var(--brand-primary)]" size={32} />
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{homeChat ? t.faqDescription : t.description}</p>
      <Textarea
        value={prompt}
        onChange={(event) => { setPromptEdited(true); setPrompt(event.target.value); }}
        className="mt-4 min-h-32 border-slate-200 bg-white text-slate-900"
        placeholder={homeChat ? t.faqPlaceholder : t.placeholder}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={loading} onClick={() => submit(false)} className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]"><Sparkles size={16} /> {homeChat ? t.ask : t.analyze}</Button>
        {!homeChat ? (
          <Button disabled={loading} onClick={() => submit(true)} className="border border-[var(--brand-border)] bg-white text-[var(--brand-primary-strong)] hover:bg-[var(--brand-primary-soft)]">{t.execute}</Button>
        ) : null}
      </div>
      {result ? (
        <div className="mt-5 rounded-2xl border border-white bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--brand-primary)] px-3 py-1 font-bold text-white">{result.status}</span>
            {!homeChat ? (
              <>
                <span className="rounded-full bg-slate-100 px-3 py-1">{result.estimatedCredits} {t.credits}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{t.charged}: {result.creditsCharged ?? result.estimatedCredits} {t.credits}</span>
                {result.accessMode ? <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">{result.accessMode === "trial" ? t.trial : t.paid}</span> : null}
                <span className="rounded-full bg-slate-100 px-3 py-1">{result.detectedIntent}</span>
              </>
            ) : null}
          </div>
          <p className="mt-3">{result.message}</p>
          {!homeChat ? <p className="mt-3 font-bold text-slate-900">{t.assistants} {result.requiredModules?.join(", ")}</p> : null}
          {!compact && (
            <>
              <h4 className="mt-4 font-bold text-slate-950">{t.plan}</h4>
              {result.executionPlan?.length ? (
                <ol className="mt-2 list-decimal space-y-1 pl-5">{result.executionPlan.map((step) => <li key={step}>{step}</li>)}</ol>
              ) : null}
              {result.error ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-700">{result.message}</p> : null}
              {result.missingInputs?.length > 0 && <p className="mt-3 text-amber-700">{t.missing} {result.missingInputs.join(", ")}</p>}
              {result.artifactsCreated?.length ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-slate-950">{t.reports}</h4>
                    <a href="/vault" className="text-xs font-bold text-[var(--brand-primary)] underline-offset-4 hover:underline">{t.openVault}</a>
                  </div>
                  {result.artifactsCreated.map((artifact) => (
                    <article key={artifact.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{artifact.type.replaceAll("_", " ")}</p>
                          <h5 className="mt-1 font-black">{artifact.title}</h5>
                        </div>
                        <a href={`/api/artifacts/${artifact.id}/download`} className="rounded-full bg-slate-950 px-3 py-2 text-xs font-extrabold text-white">{t.download}</a>
                      </div>
                      {artifact.htmlContent ? (
                        <div className="artifact-report max-h-80 overflow-auto p-4" dangerouslySetInnerHTML={{ __html: artifact.htmlContent }} />
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
