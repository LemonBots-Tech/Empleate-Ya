import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { skills } from "@/ai/skillRegistry";
import { personaRegistry } from "@/ai/personaRegistry";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const cardsCopy = {
  es: { specialized: "IA especializada", agent: "Agente de empleabilidad", tone: "Tono", credits: "créditos" },
  en: { specialized: "Specialized AI", agent: "Employability agent", tone: "Tone", credits: "credits" },
} as const;

const descriptionCopy: Record<string, { es: string; en: string }> = {
  lumo: { es: "Evalúa tus pilares personales para entender prioridades, motivación y dirección antes de buscar empleo.", en: "Evaluate your personal pillars to understand priorities, motivation, and direction before job searching." },
  boost_me: { es: "Convierte objetivos y prioridades en un plan de acción personal claro y sostenible.", en: "Turn goals and priorities into a clear, sustainable personal action plan." },
  clio: { es: "Lectura simbólica y motivacional para convertir incertidumbre en reflexión y próximos pasos.", en: "A symbolic, motivational reading to turn uncertainty into reflection and next steps." },
  scorex: { es: "Evalúa CVs, compatibilidad ATS y comparación contra vacantes con reportes antes/después.", en: "Evaluate resumes, ATS compatibility, and job-posting fit with before/after reports." },
  optim: { es: "Crea, optimiza y adapta CVs a vacantes, convirtiendo funciones en logros medibles.", en: "Create, optimize, and tailor resumes to job postings by turning responsibilities into measurable achievements." },
  scorex_360: { es: "Evalúa tu CV con una vista integral de compatibilidad, claridad, brechas y oportunidades.", en: "Evaluate your resume with an integral view of compatibility, clarity, gaps, and opportunities." },
  mr_boost_linked: { es: "Optimiza titular, acerca de, experiencia, habilidades y estrategia de LinkedIn.", en: "Optimize headline, about section, experience, skills, and LinkedIn strategy." },
  tommy_lee_picture: { es: "Prepara flujo de fotografía profesional para LinkedIn con consentimiento de imagen.", en: "Prepare a professional LinkedIn photo flow with image consent." },
  miss_quest: { es: "Simula entrevistas por competencias, evalúa respuestas y genera reportes finales.", en: "Simulate competency interviews, evaluate answers, and generate final reports." },
  mr_wow: { es: "Crea elevator pitches de 30, 60 y 90 segundos para múltiples contextos.", en: "Create 30, 60, and 90-second elevator pitches for multiple contexts." },
  new_job_challenge: { es: "Analiza mercado laboral, tendencias, brechas y plan estratégico de búsqueda.", en: "Analyze the labor market, trends, gaps, and a strategic search plan." },
  indiana_jobs: { es: "Busca, analiza, compara y prioriza vacantes contra tu perfil.", en: "Search, analyze, compare, and prioritize jobs against your profile." },
  recharge: { es: "Detecta desánimo y recomienda microacciones para sostener la búsqueda laboral.", en: "Detect low motivation and recommend micro-actions to sustain the job search." },
  mr_ikigai: { es: "Genera un mapa de dirección profesional cruzando motivación, habilidades, mercado e ingresos.", en: "Generate a professional direction map across motivation, skills, market, and income." },
};

function routeForSkill(skillId: string) {
  return `/modules/${skillId}`;
}

export function AgentCards() {
  const { language } = useLanguage();
  const t = cardsCopy[language];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => {
        const persona = personaRegistry[skill.personaId];
        return (
          <Link
            key={skill.id}
            href={routeForSkill(skill.id)}
            className="group min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(71,85,105,0.5)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-border)] hover:shadow-[0_24px_60px_-30px_rgba(109,40,217,0.22)]"
          >
            <div className={`relative flex min-h-52 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${persona.themeClass}`}>
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/70 blur-xl" />
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-xl ring-8 ring-white/40 sm:h-44 sm:w-44">
                <Image
                  src={persona.avatarPath}
                  alt={`Avatar de ${persona.name}`}
                  fill
                  sizes="176px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-600 backdrop-blur">
                <Sparkles size={12} /> {t.specialized}
              </span>
            </div>
            <div className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">{t.agent}</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{skill.name}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-[var(--brand-primary)] group-hover:text-white">
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{descriptionCopy[skill.id]?.[language] ?? skill.description}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
                <span className="font-semibold text-slate-500">{t.tone} {persona.tone.split(",")[0]}</span>
                <span className="font-extrabold text-[var(--brand-primary)]">{skill.baseCredits} {t.credits}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
