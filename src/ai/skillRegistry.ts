import { type PersonaId } from "./personaRegistry";

export type SkillId = PersonaId;

export type ArtifactType =
  | "diagnostico_7_pilares"
  | "plan_accion_personal"
  | "lectura_tarot_laboral"
  | "plan_recharge"
  | "mapa_ikigai"
  | "cv_original"
  | "cv_optimizado"
  | "cv_adaptado"
  | "scorex_inicial"
  | "scorex_final"
  | "scorex_comparativo"
  | "scorex_360"
  | "linkedin_optimizado"
  | "foto_linkedin"
  | "estudio_mercado"
  | "vacantes_guardadas"
  | "elevator_pitch"
  | "reporte_entrevista";

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
    description:
      "Evalúa los siete pilares esenciales de tu vida para comprender tu punto de partida, descubrir qué te motiva y definir tus verdaderas prioridades antes de buscar empleo.",
    personaId: "lumo",
    baseCredits: 80,
    requiredInputs: ["reflection_answers"],
    optionalInputs: ["current_context"],
    outputTypes: ["diagnostico_7_pilares"],
    systemPrompt: "lumo.md",
    enabled: true,
  },
  boost_me: {
    id: "boost_me",
    name: "BoostMe: Impúlsame",
    description:
      "Convierte tus prioridades y objetivos en un plan de acción personal, claro y sostenible para avanzar con enfoque durante tu búsqueda de empleo.",
    personaId: "boost_me",
    baseCredits: 60,
    requiredInputs: ["goals"],
    optionalInputs: ["diagnostico_7_pilares", "available_time"],
    outputTypes: ["plan_accion_personal"],
    systemPrompt: "boost_me.md",
    enabled: true,
  },
  clio: {
    id: "clio",
    name: "Clío Tarot",
    description:
      "Escribiendo la historia de tu próximo éxito laboral mediante una lectura simbólica y positiva que convierte incertidumbre en reflexión, esperanza y acciones concretas.",
    personaId: "clio",
    baseCredits: 30,
    requiredInputs: ["oracle_question"],
    optionalInputs: ["cv_file", "job_posting", "career_stage"],
    outputTypes: ["lectura_tarot_laboral"],
    systemPrompt: "clio.md",
    enabled: true,
  },
  recharge: {
    id: "recharge",
    name: "Recharge",
    description:
      "Tu coach de energía para cuidar cuerpo, mente, espíritu y emociones, fortalecer tu resiliencia y prevenir el agotamiento durante la búsqueda laboral.",
    personaId: "recharge",
    baseCredits: 20,
    requiredInputs: ["mood_signal"],
    optionalInputs: ["recent_activity", "current_habits"],
    outputTypes: ["plan_recharge"],
    systemPrompt: "recharge.md",
    enabled: true,
  },
  mr_ikigai: {
    id: "mr_ikigai",
    name: "Sensei Ikigai",
    description:
      "Genera un mapa de dirección profesional cruzando motivación, habilidades, necesidades del mercado y posibilidades de ingreso.",
    personaId: "mr_ikigai",
    baseCredits: 120,
    requiredInputs: ["reflection_answers"],
    optionalInputs: ["market_preferences"],
    outputTypes: ["mapa_ikigai"],
    systemPrompt: "mr_ikigai.md",
    enabled: true,
  },
  scorex: {
    id: "scorex",
    name: "ScoreX",
    description:
      "Evalúa tu CV en compatibilidad ATS, formato, claridad, logros y brevedad, mostrando dónde estás fallando y cómo mejorarlo.",
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
    description:
      "Crea y adapta un CV estratégico, ATS friendly y con estructura Harvard, utilizando lenguaje de impacto y logros redactados con metodología STAR.",
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
    description:
      "Audita tu CV con parámetros de sistemas ATS utilizados en México, Estados Unidos, Europa y Latinoamérica para prepararte para procesos internacionales.",
    personaId: "scorex_360",
    baseCredits: 90,
    requiredInputs: ["cv_file"],
    optionalInputs: ["target_country", "job_posting"],
    outputTypes: ["scorex_360"],
    systemPrompt: "scorex_360.md",
    enabled: true,
  },
  mr_boost_linked: {
    id: "mr_boost_linked",
    name: "Mr. Boost Linked",
    description:
      "Crea un documento con todas las secciones de LinkedIn y una estrategia para optimizar tu perfil, posicionamiento y networking profesional.",
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
    description:
      "Utiliza tu fotografía y tu CV para crear una imagen profesional de LinkedIn con poses, estilo y consistencia alineados con tu objetivo laboral.",
    personaId: "tommy_lee_picture",
    baseCredits: 100,
    requiredInputs: ["photo_file", "image_processing_consent"],
    optionalInputs: ["cv_file", "style_reference"],
    outputTypes: ["foto_linkedin"],
    systemPrompt: "tommy_lee_picture.md",
    enabled: true,
  },
  new_job_challenge: {
    id: "new_job_challenge",
    name: "New Job Challenge",
    description:
      "Define con claridad tu nuevo reto profesional y construye un inventario estratégico de puestos, empresas objetivo y prioridades de búsqueda.",
    personaId: "new_job_challenge",
    baseCredits: 150,
    requiredInputs: ["target_role"],
    optionalInputs: ["country", "industry", "values"],
    outputTypes: ["estudio_mercado"],
    systemPrompt: "new_job_challenge.md",
    enabled: true,
  },
  indiana_jobs: {
    id: "indiana_jobs",
    name: "Indiana Jobs",
    description:
      "El arqueólogo de sueños que explora, filtra, compara y prioriza vacantes reales de acuerdo con tu perfil y estrategia profesional.",
    personaId: "indiana_jobs",
    baseCredits: 100,
    requiredInputs: ["target_role"],
    optionalInputs: ["location", "salary_range", "company_preferences"],
    outputTypes: ["vacantes_guardadas"],
    systemPrompt: "indiana_jobs.md",
    enabled: true,
  },
  mr_wow: {
    id: "mr_wow",
    name: "Mr. Wow",
    description:
      "Transforma tu historia profesional en mensajes claros y persuasivos para CV, LinkedIn, networking, presentaciones de 30 segundos y mensajes directos.",
    personaId: "mr_wow",
    baseCredits: 40,
    requiredInputs: ["professional_profile"],
    optionalInputs: ["target_audience", "target_context"],
    outputTypes: ["elevator_pitch"],
    systemPrompt: "mr_wow.md",
    enabled: true,
  },
  miss_quest: {
    id: "miss_quest",
    name: "Miss Quest",
    description:
      "Tu entrenadora personal de entrevistas: practica preguntas reales, recibe retroalimentación objetiva y fortalece tu confianza para conquistar tu meta.",
    personaId: "miss_quest",
    baseCredits: 120,
    requiredInputs: ["target_role"],
    optionalInputs: ["job_posting", "cv_file"],
    outputTypes: ["reporte_entrevista"],
    systemPrompt: "miss_quest.md",
    enabled: true,
  },
};

export const skills = Object.values(skillRegistry);

export const modulePricingSeed = skills.map((skill) => ({
  moduleId: skill.id,
  name: skill.name,
  baseCredits: skill.baseCredits,
  isActive: true,
}));
