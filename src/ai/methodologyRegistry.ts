import { type SkillId } from "./skillRegistry";

export type MethodologyStage = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  accentClass: string;
  agentIds: SkillId[];
};

export const methodologyStages: MethodologyStage[] = [
  {
    id: "discovery",
    number: 1,
    title: "Discovery",
    subtitle: "Define tu propósito y prioridades",
    description:
      "Comprende de dónde partes, qué te motiva y qué debes equilibrar para construir una búsqueda laboral alineada con la vida que deseas.",
    accentClass: "from-cyan-400 to-emerald-400",
    agentIds: ["lumo", "boost_me", "recharge", "mr_ikigai"],
  },
  {
    id: "strategic-cv",
    number: 2,
    title: "Crea un CV estratégico",
    subtitle: "Haz visible tu valor profesional",
    description:
      "Evalúa, construye y perfecciona un CV compatible con ATS, estructura Harvard y logros de alto impacto.",
    accentClass: "from-violet-400 to-blue-500",
    agentIds: ["scorex", "optim", "scorex_360"],
  },
  {
    id: "linkedin",
    number: 3,
    title: "Presencia estratégica en LinkedIn",
    subtitle: "Posiciona tu marca profesional",
    description:
      "Optimiza tu perfil, tu estrategia de networking y tu imagen para proyectar una presencia profesional consistente.",
    accentClass: "from-sky-400 to-cyan-500",
    agentIds: ["mr_boost_linked", "tommy_lee_picture"],
  },
  {
    id: "prospecting",
    number: 4,
    title: "Prospección de vacantes",
    subtitle: "Convierte la búsqueda en estrategia",
    description:
      "Define empresas y puestos objetivo, explora oportunidades reales y transforma cada contacto en una posibilidad.",
    accentClass: "from-emerald-400 to-lime-400",
    agentIds: ["new_job_challenge", "indiana_jobs"],
  },
  {
    id: "hire-me",
    number: 5,
    title: "Hire Me System",
    subtitle: "Persuasión, propósito y confianza en acción",
    description:
      "Comunica tu valor con impacto y entrena tus entrevistas hasta sentirte seguro y listo para ganar.",
    accentClass: "from-amber-300 to-orange-500",
    agentIds: ["mr_wow", "miss_quest"],
  },
];
