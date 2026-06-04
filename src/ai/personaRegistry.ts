export type PersonaId =
  | "lumo"
  | "boost_me"
  | "recharge"
  | "mr_ikigai"
  | "scorex"
  | "optim"
  | "scorex_360"
  | "mr_boost_linked"
  | "tommy_lee_picture"
  | "new_job_challenge"
  | "indiana_jobs"
  | "mr_wow"
  | "miss_quest";

export type Persona = {
  id: PersonaId;
  name: string;
  tone: string;
  color: string;
  themeClass: string;
  avatarPath: string;
};

export const personaRegistry: Record<PersonaId, Persona> = {
  lumo: {
    id: "lumo",
    name: "Lumo",
    tone: "reflexivo, empático y revelador",
    color: "cian/plata",
    themeClass: "from-cyan-500 to-slate-500",
    avatarPath: "/avatars/lumo.png",
  },
  boost_me: {
    id: "boost_me",
    name: "BoostMe: Impúlsame",
    tone: "motivador, práctico y orientado a la acción",
    color: "teal/plata",
    themeClass: "from-teal-500 to-slate-500",
    avatarPath: "/avatars/boost-me-impulsame.png",
  },
  recharge: {
    id: "recharge",
    name: "Recharge",
    tone: "motivador, resiliente y humano",
    color: "verde lima",
    themeClass: "from-lime-500 to-emerald-600",
    avatarPath: "/avatars/recharge.png",
  },
  mr_ikigai: {
    id: "mr_ikigai",
    name: "Sensei Ikigai",
    tone: "reflexivo, profundo y orientador",
    color: "rojo/púrpura",
    themeClass: "from-rose-500 to-purple-600",
    avatarPath: "/avatars/sensei-ikigai.png",
  },
  scorex: {
    id: "scorex",
    name: "ScoreX",
    tone: "analítico, objetivo y técnico",
    color: "morado/blanco",
    themeClass: "from-violet-600 to-purple-400",
    avatarPath: "/avatars/scorex.png",
  },
  optim: {
    id: "optim",
    name: "Optim",
    tone: "estratégico, claro y profesional",
    color: "rojo/blanco",
    themeClass: "from-red-600 to-slate-300",
    avatarPath: "/avatars/optim.png",
  },
  scorex_360: {
    id: "scorex_360",
    name: "ScoreX 360 — Cíclope",
    tone: "exigente, internacional y orientado a sistemas ATS",
    color: "azul/dorado",
    themeClass: "from-blue-800 to-amber-400",
    avatarPath: "/avatars/scorex-360-ciclope.png",
  },
  mr_boost_linked: {
    id: "mr_boost_linked",
    name: "Mr. Boost Linked",
    tone: "ejecutivo, digital y de posicionamiento profesional",
    color: "azul LinkedIn",
    themeClass: "from-sky-700 to-cyan-400",
    avatarPath: "/avatars/mr-boost-linked.png",
  },
  tommy_lee_picture: {
    id: "tommy_lee_picture",
    name: "Tommy Lee Picture",
    tone: "creativo, visual y elegante",
    color: "negro/rojo",
    themeClass: "from-slate-900 to-red-600",
    avatarPath: "/avatars/tommy-lee-picture.png",
  },
  new_job_challenge: {
    id: "new_job_challenge",
    name: "New Job Challenge",
    tone: "estratégico, analítico y de mercado",
    color: "verde/blanco",
    themeClass: "from-emerald-700 to-lime-400",
    avatarPath: "/avatars/new-job-challenge.png",
  },
  indiana_jobs: {
    id: "indiana_jobs",
    name: "Indiana Jobs",
    tone: "explorador, práctico y orientado a oportunidades",
    color: "verde explorador",
    themeClass: "from-green-900 to-lime-500",
    avatarPath: "/avatars/indiana-jobs.png",
  },
  mr_wow: {
    id: "mr_wow",
    name: "Mr. Wow",
    tone: "carismático, persuasivo y memorable",
    color: "azul/dorado",
    themeClass: "from-blue-800 to-amber-400",
    avatarPath: "/avatars/mr-wow.png",
  },
  miss_quest: {
    id: "miss_quest",
    name: "Miss Quest",
    tone: "profesional, empático y retador",
    color: "rosa/índigo",
    themeClass: "from-pink-500 to-indigo-600",
    avatarPath: "/avatars/miss-quest.png",
  },
};

export const personas = Object.values(personaRegistry);
