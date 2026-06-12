"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Coins, FileText, Sparkles } from "lucide-react";
import { personaRegistry, type PersonaId } from "@/ai/personaRegistry";
import { skillRegistry, type SkillId } from "@/ai/skillRegistry";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const copy = {
  es: {
    back: "Volver a los agentes",
    specialized: "Agente especializado",
    investment: "Inversión base",
    credits: "créditos",
    howHelps: "Cómo puede ayudarte",
    headline: "Antes de empezar, conoce qué hará este agente por ti.",
    needs: "Lo que necesitamos",
    outputs: "Lo que recibirás",
    ready: "¿Listo para comenzar?",
    readyHelp: "Primero revisa esta ficha. Después entra al espacio de trabajo para ejecutar el flujo.",
    start: "Continuar con",
    gatewayStart: "Preparar en Gateway",
    comingSoon: "Este agente usará el Gateway mientras activamos su workspace dedicado.",
    toneLead: "Un acompañamiento",
    toneTail: "para ayudarte a avanzar con claridad.",
    optional: "Opcional",
    required: "Requerido",
  },
  en: {
    back: "Back to agents",
    specialized: "Specialized agent",
    investment: "Base investment",
    credits: "credits",
    howHelps: "How it can help",
    headline: "Before starting, understand what this agent will do for you.",
    needs: "What we need",
    outputs: "What you will receive",
    ready: "Ready to begin?",
    readyHelp: "Review this profile first. Then enter the workspace to run the flow.",
    start: "Continue with",
    gatewayStart: "Prepare in Gateway",
    comingSoon: "This agent will use the Gateway while its dedicated workspace is activated.",
    toneLead: "A",
    toneTail: "companion to help you move forward with clarity.",
    optional: "Optional",
    required: "Required",
  },
} as const;

const localizedDescriptions: Partial<Record<SkillId, { es: string; en: string }>> = {
  lumo: {
    es: "Lumo te ayuda a revisar tus pilares personales, motivaciones y prioridades para entender desde dónde estás buscando trabajo y qué dirección tiene más sentido para ti.",
    en: "Lumo helps you review personal pillars, motivations, and priorities to understand where you are searching from and which direction makes the most sense.",
  },
  boost_me: {
    es: "BoostMe convierte tus prioridades y objetivos en un plan de acción personal, medible y sostenible para avanzar con energía realista.",
    en: "BoostMe turns your priorities and goals into a personal, measurable, sustainable action plan so you can move forward with realistic energy.",
  },
  clio: {
    es: "Clío ofrece una lectura simbólica y motivacional de tu momento profesional para transformar incertidumbre en reflexión, esperanza y acciones concretas.",
    en: "Clio offers a symbolic, motivational reading of your professional moment to transform uncertainty into reflection, hope, and concrete actions.",
  },
  scorex: {
    es: "ScoreX evalúa tu CV, revisa claridad, compatibilidad ATS y probabilidad contra vacantes. Después podrás ejecutar fases de evaluación inicial, final, comparativo y ajuste contra vacante.",
    en: "ScoreX evaluates your resume, reviews clarity, ATS compatibility, and job-fit probability. Then you can run initial, final, comparative, and job-fit phases.",
  },
  optim: {
    es: "Optim crea un CV desde cero, optimiza un CV existente o lo adapta a una vacante específica con formato Harvard tradicional, cartas y revisión realista de palabras clave.",
    en: "Optim creates a resume from scratch, optimizes an existing resume, or tailors it to a specific job posting using a traditional Harvard format, letters, and realistic keyword review.",
  },
  scorex_360: {
    es: "ScoreX 360 — Cíclope audita tu CV desde todos los ángulos: ATS, estructura, claridad, narrativa, brechas y oportunidades de mejora.",
    en: "ScoreX 360 — Cyclops audits your resume from every angle: ATS, structure, clarity, narrative, gaps, and improvement opportunities.",
  },
  mr_boost_linked: {
    es: "Optimiza tu presencia en LinkedIn: titular, acerca de, experiencia, habilidades, tono y estrategia de posicionamiento profesional.",
    en: "Optimize your LinkedIn presence: headline, about section, experience, skills, tone, and professional positioning strategy.",
  },
  tommy_lee_picture: {
    es: "Prepara una fotografía profesional para LinkedIn con criterios de imagen, intención, encuadre y consentimiento.",
    en: "Prepare a professional LinkedIn photo with image criteria, intention, framing, and consent.",
  },
  miss_quest: {
    es: "Practica entrevistas por competencias, fortalece respuestas y recibe recomendaciones para hablar con evidencia y confianza.",
    en: "Practice competency interviews, strengthen answers, and receive recommendations to speak with evidence and confidence.",
  },
  mr_wow: {
    es: "Construye mensajes breves y memorables para presentarte en entrevistas, networking, LinkedIn y conversaciones clave.",
    en: "Build brief, memorable messages to introduce yourself in interviews, networking, LinkedIn, and key conversations.",
  },
  new_job_challenge: {
    es: "Analiza tu mercado, brechas, oportunidades y próximos pasos para una búsqueda laboral más estratégica.",
    en: "Analyze your market, gaps, opportunities, and next steps for a more strategic job search.",
  },
  indiana_jobs: {
    es: "Organiza y prioriza vacantes contra tu perfil para decidir dónde enfocar mejor tu energía.",
    en: "Organize and prioritize job postings against your profile to decide where to focus your energy.",
  },
  recharge: {
    es: "Detecta señales de desgaste o desánimo y propone microacciones para sostener tu avance.",
    en: "Detect signs of fatigue or discouragement and propose micro-actions to sustain progress.",
  },
  mr_ikigai: {
    es: "Cruza motivación, habilidades, mercado e ingresos para orientar mejor tu dirección profesional.",
    en: "Connect motivation, skills, market, and income to better orient your professional direction.",
  },
};

const inputLabels: Record<string, { es: string; en: string }> = {
  cv_file: { es: "CV en archivo", en: "Resume file" },
  job_posting: { es: "Vacante objetivo", en: "Target job posting" },
  target_role: { es: "Puesto objetivo", en: "Target role" },
  professional_profile: { es: "Perfil profesional", en: "Professional profile" },
  linkedin_url_or_profile: { es: "URL o perfil de LinkedIn", en: "LinkedIn URL or profile" },
  industry: { es: "Industria", en: "Industry" },
  photo_file: { es: "Fotografía", en: "Photo file" },
  image_processing_consent: { es: "Consentimiento de imagen", en: "Image processing consent" },
  style_reference: { es: "Referencia visual", en: "Visual reference" },
  country: { es: "País", en: "Country" },
  location: { es: "Ubicación", en: "Location" },
  salary_range: { es: "Rango salarial", en: "Salary range" },
  mood_signal: { es: "Señal de ánimo", en: "Mood signal" },
  recent_activity: { es: "Actividad reciente", en: "Recent activity" },
  reflection_answers: { es: "Respuestas de reflexión", en: "Reflection answers" },
  market_preferences: { es: "Preferencias de mercado", en: "Market preferences" },
  target_audience: { es: "Audiencia objetivo", en: "Target audience" },
};

const outputLabels: Record<string, { es: string; en: string }> = {
  mapa_prioridades: { es: "Mapa de prioridades", en: "Priority map" },
  plan_accion_personal: { es: "Plan de acción personal", en: "Personal action plan" },
  lectura_clio: { es: "Lectura simbólica Clío", en: "Clio symbolic reading" },
  cv_original: { es: "CV original", en: "Original resume" },
  cv_optimizado: { es: "CV optimizado", en: "Optimized resume" },
  cv_adaptado: { es: "CV adaptado", en: "Tailored resume" },
  scorex_inicial: { es: "Reporte ScoreX inicial", en: "Initial ScoreX report" },
  scorex_final: { es: "Reporte ScoreX final", en: "Final ScoreX report" },
  scorex_comparativo: { es: "Comparativo ScoreX", en: "ScoreX comparison" },
  scorex_360: { es: "Reporte ScoreX 360", en: "ScoreX 360 report" },
  carta_presentacion: { es: "Carta de presentación", en: "Cover letter" },
  carta_agradecimiento: { es: "Carta de agradecimiento", en: "Thank-you letter" },
  linkedin_optimizado: { es: "LinkedIn optimizado", en: "Optimized LinkedIn" },
  elevator_pitch: { es: "Elevator pitch", en: "Elevator pitch" },
  reporte_entrevista: { es: "Reporte de entrevista", en: "Interview report" },
  estudio_mercado: { es: "Estudio de mercado", en: "Market study" },
  vacantes_guardadas: { es: "Vacantes priorizadas", en: "Prioritized jobs" },
  plan_recharge: { es: "Plan Recharge", en: "Recharge plan" },
  mapa_ikigai: { es: "Mapa Ikigai", en: "Ikigai map" },
  foto_linkedin: { es: "Foto para LinkedIn", en: "LinkedIn photo" },
};

function workspaceHref(skillId: SkillId) {
  if (skillId === "scorex") return "/scorex";
  if (skillId === "optim") return "/optim";
  return `/gateway?module=${skillId}`;
}

function labelFor(value: string, dictionary: Record<string, { es: string; en: string }>, language: "es" | "en") {
  return dictionary[value]?.[language] ?? value.replaceAll("_", " ");
}

export function ModuleIntroClient({ skillId }: { skillId: SkillId }) {
  const { language } = useLanguage();
  const t = copy[language];
  const skill = skillRegistry[skillId];
  const persona = personaRegistry[skill.personaId as PersonaId];
  const href = workspaceHref(skill.id);
  const usesGateway = href.startsWith("/gateway");

  return (
    <>
      <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[var(--brand-primary-strong)]">
        <ArrowLeft size={16} /> {t.back}
      </Link>

      <section className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className={`relative overflow-hidden rounded-[2rem] border border-[var(--brand-border)] bg-gradient-to-br ${persona.themeClass} p-7 text-white shadow-[0_25px_80px_-45px_rgba(109,40,217,0.4)] md:p-9`}>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--brand-primary)] shadow-sm">
              <Sparkles size={13} /> {t.specialized}
            </span>
            <div className="mt-9 flex justify-center">
              <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-2xl ring-[12px] ring-white/25">
                <Image src={persona.avatarPath} alt={persona.name} fill sizes="192px" className="object-cover" priority />
              </div>
            </div>
            <h1 className="mt-8 text-4xl font-black tracking-[-0.045em] md:text-5xl">{skill.name}</h1>
            <p className="mt-4 text-base font-semibold leading-7 text-white/88">{t.toneLead} {persona.tone} {t.toneTail}</p>
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/30 bg-white/88 p-4 text-slate-950 backdrop-blur">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Coins size={17} /> {t.investment}</span>
              <span className="font-black text-[var(--brand-primary-strong)]">{skill.baseCredits} {t.credits}</span>
            </div>
          </div>
        </aside>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(71,85,105,0.45)] md:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-primary)]">{t.howHelps}</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950">{t.headline}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{localizedDescriptions[skill.id]?.[language] ?? skill.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-[#fcfbff] p-5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900"><CheckCircle2 size={18} className="text-emerald-500" /> {t.needs}</div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                {skill.requiredInputs.map((input) => <li key={input}><strong className="text-slate-900">{t.required}:</strong> {labelFor(input, inputLabels, language)}</li>)}
                {skill.optionalInputs.slice(0, 3).map((input) => <li key={input}><strong className="text-slate-900">{t.optional}:</strong> {labelFor(input, inputLabels, language)}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-[#fffdf8] p-5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900"><FileText size={18} className="text-amber-500" /> {t.outputs}</div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                {skill.outputTypes.map((output) => <li key={output}>{labelFor(output, outputLabels, language)}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white md:flex md:items-center md:justify-between">
            <div>
              <p className="font-extrabold">{t.ready}</p>
              <p className="mt-1 text-sm text-slate-300">{usesGateway ? t.comingSoon : t.readyHelp}</p>
            </div>
            <Link href={href} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-[var(--brand-primary-soft)] md:mt-0">
              {usesGateway ? t.gatewayStart : `${t.start} ${skill.name}`} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
