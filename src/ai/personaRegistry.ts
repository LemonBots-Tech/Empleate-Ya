export type PersonaId =
  | "lumo"
  | "boost_me"
  | "clio"
  | "scorex"
  | "optim"
  | "scorex_360"
  | "mr_boost_linked"
  | "tommy_lee_picture"
  | "miss_quest"
  | "mr_wow"
  | "new_job_challenge"
  | "indiana_jobs"
  | "recharge"
  | "mr_ikigai";

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
    tone: "reflexivo, cálido y orientado a prioridades",
    color: "teal/plata",
    themeClass: "from-teal-600 to-slate-300",
    avatarPath: "/avatars/lumo.png",
  },
  boost_me: {
    id: "boost_me",
    name: "BoostMe: Impúlsame",
    tone: "motivador, práctico y orientado a acción",
    color: "turquesa/azul",
    themeClass: "from-cyan-700 to-sky-400",
    avatarPath: "/avatars/boost-me-impulsame.png",
  },
  clio: {
    id: "clio",
    name: "Clío Tarot",
    tone: "simbólico, esperanzador y motivacional",
    color: "rosa/blanco",
    themeClass: "from-pink-500 to-rose-200",
    avatarPath: "/avatars/clio.png",
  },
  scorex: {
    id: "scorex",
    name: "ScoreX",
    tone: "analítico, objetivo y técnico",
    color: "azul/amarillo",
    themeClass: "from-blue-700 to-amber-400",
    avatarPath: "/avatars/scorex.png",
  },
  optim: {
    id: "optim",
    name: "Optim",
    tone: "estratégico, claro y profesional",
    color: "azul oscuro/blanco",
    themeClass: "from-slate-900 to-blue-600",
    avatarPath: "/avatars/optim.png",
  },
  scorex_360: {
    id: "scorex_360",
    name: "ScoreX 360 — Cíclope",
    tone: "integral, auditor y profundamente analítico",
    color: "índigo/cian",
    themeClass: "from-indigo-700 to-cyan-400",
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
    color: "violeta/plata",
    themeClass: "from-violet-700 to-slate-300",
    avatarPath: "/avatars/tommy-lee-picture.png",
  },
  miss_quest: {
    id: "miss_quest",
    name: "Miss Quest",
    tone: "profesional, empático y retador",
    color: "fucsia/índigo",
    themeClass: "from-fuchsia-600 to-indigo-600",
    avatarPath: "/avatars/miss-quest.png",
  },
  mr_wow: {
    id: "mr_wow",
    name: "Mr. Wow",
    tone: "carismático, persuasivo y memorable",
    color: "naranja/dorado",
    themeClass: "from-orange-500 to-yellow-400",
    avatarPath: "/avatars/mr-wow.png",
  },
  new_job_challenge: {
    id: "new_job_challenge",
    name: "New Job Challenge",
    tone: "estratégico, analítico y de mercado",
    color: "verde/teal",
    themeClass: "from-emerald-600 to-teal-400",
    avatarPath: "/avatars/new-job-challenge.png",
  },
  indiana_jobs: {
    id: "indiana_jobs",
    name: "Indiana Jobs",
    tone: "explorador, práctico y orientado a oportunidades",
    color: "ámbar/café",
    themeClass: "from-amber-700 to-orange-400",
    avatarPath: "/avatars/indiana-jobs.png",
  },
  recharge: {
    id: "recharge",
    name: "Recharge",
    tone: "motivador, resiliente y humano",
    color: "verde lima",
    themeClass: "from-lime-600 to-green-400",
    avatarPath: "/avatars/recharge.png",
  },
  mr_ikigai: {
    id: "mr_ikigai",
    name: "Sensei Ikigai",
    tone: "reflexivo, profundo y orientador",
    color: "rose/púrpura",
    themeClass: "from-rose-500 to-purple-600",
    avatarPath: "/avatars/sensei-ikigai.png",
  },
};

export const personas = Object.values(personaRegistry);
