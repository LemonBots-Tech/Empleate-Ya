import { type PersonaId } from "./personaRegistry";

export type SkillId = PersonaId;
export type ArtifactType =
  | "mapa_prioridades"
  | "plan_accion_personal"
  | "lectura_clio"
  | "cv_original"
  | "cv_optimizado"
  | "cv_adaptado"
  | "scorex_inicial"
  | "scorex_final"
  | "scorex_comparativo"
  | "scorex_360"
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
  lumo: {
    id: "lumo",
    name: "Lumo",
    description: "Evalúa los siete pilares esenciales de tu vida para comprender tu punto de partida, descubrir qué te motiva y definir tus verdaderas prioridades antes de buscar empleo.",
    personaId: "lumo",
    baseCredits: 80,
    requiredInputs: ["reflection_answers"],
    optionalInputs: ["mood_signal", "recent_activity"],
    outputTypes: ["mapa_prioridades"],
    systemPrompt: "lumo.md",
    enabled: true,
  },
  boost_me: {
    id: "boost_me",
    name: "BoostMe: Impúlsame",
    description: "Convierte tus prioridades y objetivos en un plan de acción personal, claro y sostenible para avanzar con enfoque durante tu búsqueda de empleo.",
    personaId: "boost_me",
    baseCredits: 60,
    requiredInputs: ["target_role"],
    optionalInputs: ["reflection_answers", "recent_activity"],
    outputTypes: ["plan_accion_personal"],
    systemPrompt: "boost_me.md",
    enabled: true,
  },
  clio: {
    id: "clio",
    name: "Clío Tarot",
    description: "Escribe la historia de tu próximo éxito laboral mediante una lectura simbólica y positiva que convierte incertidumbre en reflexión, esperanza y acciones concretas.",
    personaId: "clio",
    baseCredits: 30,
    requiredInputs: ["reflection_answers"],
    optionalInputs: ["target_role", "job_posting"],
    outputTypes: ["lectura_clio"],
    systemPrompt: "clio.md",
    enabled: true,
  },
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
  scorex_360: {
    id: "scorex_360",
    name: "ScoreX 360 — Cíclope",
    description: "Audita tu CV con una vista 360: ATS, claridad, estructura, brechas, narrativa, palabras clave y oportunidades de mejora.",
    personaId: "scorex_360",
    baseCredits: 220,
    requiredInputs: ["cv_file"],
    optionalInputs: ["job_posting", "target_role", "professional_profile"],
    outputTypes: ["scorex_360"],
    systemPrompt: "scorex_360.md",
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
    name: "Sensei Ikigai",
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
