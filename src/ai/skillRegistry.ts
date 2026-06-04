import { type PersonaId } from "./personaRegistry";

export type SkillId = PersonaId;
export type ArtifactType =
  | "cv_original"
  | "cv_optimizado"
  | "cv_adaptado"
  | "scorex_inicial"
  | "scorex_final"
  | "scorex_comparativo"
  | "carta_presentacion"
  | "carta_agradecimiento"
  | "linkedin_optimizado"
  | "elevator_pitch"
  | "reporte_entrevista"
  | "estudio_mercado"
  | "vacantes_guardadas"
  | "plan_recharge"
  | "mapa_ikigai"
  | "foto_linkedin";

export type SkillDefinition = {
  id: SkillId;
  name: string;
  description: string;
  personaId: PersonaId;
  baseCredits: number;
  requiredInputs: string[];
  optionalInputs: string[];
  outputTypes: ArtifactType[];
  systemPrompt: string;
  enabled: boolean;
};

export const skillRegistry: Record<SkillId, SkillDefinition> = {
  scorex: {
    id: "scorex",
    name: "ScoreX",
    description: "Evalúa CVs, compatibilidad ATS y comparación contra vacantes con reportes antes/después.",
    personaId: "scorex",
    baseCredits: 35,
    requiredInputs: ["cv_file"],
    optionalInputs: ["job_posting", "target_role"],
    outputTypes: ["scorex_inicial", "scorex_final", "scorex_comparativo"],
    systemPrompt: "scorex.md",
    enabled: true,
  },
  optim: {
    id: "optim",
    name: "Optim",
    description: "Crea, optimiza y adapta CVs a vacantes, convirtiendo funciones en logros medibles.",
    personaId: "optim",
    baseCredits: 180,
    requiredInputs: ["cv_file"],
    optionalInputs: ["job_posting", "professional_profile"],
    outputTypes: ["cv_optimizado", "cv_adaptado"],
    systemPrompt: "optim.md",
    enabled: true,
  },
  mr_boost_linked: {
    id: "mr_boost_linked",
    name: "Mr. Boost Linked",
    description: "Optimiza titular, acerca de, experiencia, habilidades y estrategia de LinkedIn.",
    personaId: "mr_boost_linked",
    baseCredits: 180,
    requiredInputs: ["linkedin_url_or_profile"],
    optionalInputs: ["target_role", "industry"],
    outputTypes: ["linkedin_optimizado"],
    systemPrompt: "mr_boost_linked.md",
    enabled: true,
  },
  tommy_lee_picture: {
    id: "tommy_lee_picture",
    name: "Tommy Lee Picture",
    description: "Prepara flujo de fotografía profesional para LinkedIn con consentimiento de imagen.",
    personaId: "tommy_lee_picture",
    baseCredits: 100,
    requiredInputs: ["photo_file", "image_processing_consent"],
    optionalInputs: ["style_reference"],
    outputTypes: ["foto_linkedin"],
    systemPrompt: "tommy_lee_picture.md",
    enabled: true,
  },
  miss_quest: {
    id: "miss_quest",
    name: "Miss Quest",
    description: "Simula entrevistas por competencias, evalúa respuestas y genera reportes finales.",
    personaId: "miss_quest",
    baseCredits: 120,
    requiredInputs: ["target_role"],
    optionalInputs: ["job_posting", "cv_file"],
    outputTypes: ["reporte_entrevista"],
    systemPrompt: "miss_quest.md",
    enabled: true,
  },
  mr_wow: {
    id: "mr_wow",
    name: "Mr. Wow",
    description: "Crea elevator pitches de 30, 60 y 90 segundos para múltiples contextos.",
    personaId: "mr_wow",
    baseCredits: 40,
    requiredInputs: ["professional_profile"],
    optionalInputs: ["target_audience"],
    outputTypes: ["elevator_pitch"],
    systemPrompt: "mr_wow.md",
    enabled: true,
  },
  new_job_challenge: {
    id: "new_job_challenge",
    name: "New Job Challenge",
    description: "Analiza mercado laboral, tendencias, brechas y plan estratégico de búsqueda.",
    personaId: "new_job_challenge",
    baseCredits: 150,
    requiredInputs: ["target_role"],
    optionalInputs: ["country", "industry"],
    outputTypes: ["estudio_mercado"],
    systemPrompt: "new_job_challenge.md",
    enabled: true,
  },
  indiana_jobs: {
    id: "indiana_jobs",
    name: "Indiana Jobs",
    description: "Busca, analiza, compara y prioriza vacantes contra el perfil del usuario.",
    personaId: "indiana_jobs",
    baseCredits: 100,
    requiredInputs: ["target_role"],
    optionalInputs: ["location", "salary_range"],
    outputTypes: ["vacantes_guardadas"],
    systemPrompt: "indiana_jobs.md",
    enabled: true,
  },
  recharge: {
    id: "recharge",
    name: "Recharge",
    description: "Detecta desánimo y recomienda microacciones para sostener la búsqueda laboral.",
    personaId: "recharge",
    baseCredits: 20,
    requiredInputs: ["mood_signal"],
    optionalInputs: ["recent_activity"],
    outputTypes: ["plan_recharge"],
    systemPrompt: "recharge.md",
    enabled: true,
  },
  mr_ikigai: {
    id: "mr_ikigai",
    name: "Mr. Ikigai",
    description: "Genera un mapa de dirección profesional cruzando motivación, habilidades, mercado e ingresos.",
    personaId: "mr_ikigai",
    baseCredits: 120,
    requiredInputs: ["reflection_answers"],
    optionalInputs: ["market_preferences"],
    outputTypes: ["mapa_ikigai"],
    systemPrompt: "mr_ikigai.md",
    enabled: true,
  },
};

export const skills = Object.values(skillRegistry);
export const modulePricingSeed = skills.map((skill) => ({ moduleId: skill.id, name: skill.name, baseCredits: skill.baseCredits, isActive: true }));
