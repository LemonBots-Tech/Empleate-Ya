"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Compass, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { appLanguageOptions, useLanguage } from "@/lib/i18n/LanguageProvider";

const landingCopy = {
  es: {
    login: "Iniciar sesion",
    register: "Crear cuenta",
    badge: "Tu carrera, con claridad",
    title: "Encuentra el trabajo que tambien se sienta bien para ti.",
    description: "Una metodologia humana acompanada por inteligencia artificial para descubrir tu direccion, fortalecer tu perfil y avanzar con confianza.",
    primary: "Comenzar mi recorrido",
    secondary: "Explorar plataforma",
    benefits: ["Ruta personalizada", "Entregables guardados", "Avanza a tu ritmo"],
    routeEyebrow: "Tu ruta profesional",
    routeTitle: "Pequenos pasos, gran direccion.",
    steps: [
      ["01", "Discovery", "Lumo, BoostMe: Impulsame, Clio Tarot, Recharge y Sensei Ikigai."],
      ["02", "Curriculum estrategico", "ScoreX, Optim y ScoreX 360 - Ciclope."],
      ["03", "LinkedIn", "Mr. Boost Linked y Tommy Lee Picture."],
      ["04", "Prospeccion", "New Job Challenge e Indiana Jobs."],
      ["05", "Persuasion", "Mr. Wow y Miss Quest."],
    ],
    testimonialsEyebrow: "Historias reales",
    testimonialsTitle: "Acompanamiento humano con herramientas inteligentes.",
    testimonialsNote: "Los testimonios publicados deberan contar con autorizacion validada, folio y vigencia antes de mostrarse en produccion.",
    methodologyEyebrow: "Metodologia Empleate YA",
    methodologyTitle: "Cinco etapas en forma de embudo.",
    methodologyDescription: "La plataforma no solo entrega documentos: acompana el proceso completo para entenderte, construir tu propuesta, buscar oportunidades y comunicarte mejor.",
    methodology: [
      {
        avatar: "/avatars/lumo.png",
        name: "Lumo",
        stage: "Discovery",
        title: "Entender tu punto de partida",
        objective: "Claridad personal y direccion profesional",
        description: "Identifica prioridades, energia, motivadores y direccion profesional antes de moverte. Esta etapa evita buscar empleo desde la urgencia y ayuda a elegir mejor el siguiente paso.",
        avatarHint: "Clarifica prioridades, motivacion, energia y direccion profesional.",
        color: "#FDE2E4",
        accent: "#E11D48",
      },
      {
        avatar: "/avatars/scorex.png",
        name: "ScoreX",
        stage: "CV estrategico",
        title: "Diagnosticar y fortalecer tu CV",
        objective: "CV claro, medible y competitivo",
        description: "Evalua claridad, estructura, compatibilidad ATS y fuerza del perfil para saber que ajustar antes de competir por una vacante.",
        avatarHint: "Evalua claridad del CV, compatibilidad ATS y probabilidad contra vacantes.",
        color: "#FFE8CC",
        accent: "#F97316",
      },
      {
        avatar: "/avatars/mr-boost-linked.png",
        name: "Mr. Boost Linked",
        stage: "LinkedIn",
        title: "Alinear tu presencia profesional",
        objective: "Marca profesional coherente",
        description: "Conecta tu narrativa de CV con tu perfil publico para que tu propuesta sea consistente en busquedas, mensajes y networking.",
        avatarHint: "Optimiza titular, acerca de, experiencia, habilidades y estrategia de LinkedIn.",
        color: "#FEF3C7",
        accent: "#D97706",
      },
      {
        avatar: "/avatars/new-job-challenge.png",
        name: "New Job Challenge",
        stage: "Prospeccion",
        title: "Buscar oportunidades con intencion",
        objective: "Pipeline de oportunidades reales",
        description: "Ordena acciones, seguimiento y foco comercial para generar conversaciones, postulaciones y oportunidades reales.",
        avatarHint: "Convierte la busqueda de empleo en una rutina semanal medible y accionable.",
        color: "#DCFCE7",
        accent: "#16A34A",
      },
      {
        avatar: "/avatars/mr-wow.png",
        name: "Mr. Wow",
        stage: "Persuasion",
        title: "Prepararte para conversar y convencer",
        objective: "Mensaje potente y defendible",
        description: "Convierte tu historia profesional en mensajes breves, potentes y defendibles para entrevistas, networking y decisiones clave.",
        avatarHint: "Crea mensajes de impacto para pitch, networking y conversaciones decisivas.",
        color: "#DBEAFE",
        accent: "#2563EB",
      },
      {
        avatar: "/avatars/boost-me-impulsame.png",
        name: "Empleate YA",
        stage: "Trabajo ideal",
        title: "Elegir y sostener el siguiente paso",
        objective: "Decidir con confianza y avanzar",
        description: "Integra claridad, CV, presencia digital, prospeccion y persuasion para acercarte a un trabajo que sea viable, coherente y deseable para tu momento profesional.",
        avatarHint: "Cierre del proceso: convertir avances en una decision profesional concreta.",
        color: "#EDE9FE",
        accent: "#7C3AED",
      },
    ],
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Lo esencial antes de comenzar.",
    faqDescription: "Resuelve rapidamente las dudas mas comunes sobre Empleate YA, creditos, privacidad, coaching y servicios para empresas.",
    faqs: [
      ["Que es Empleate YA?", "Es una plataforma de empleabilidad con metodologia humana e inteligencia artificial para diagnosticar, optimizar y acompanar tu busqueda de empleo."],
      ["Como funcionan los creditos?", "Cada avatar consume creditos segun el uso de IA, documentos generados y complejidad del entregable. En tu estado de cuenta podras ver fecha, avatar, consumo y saldo."],
      ["Puedo usar la plataforma si soy empresa o emprendedor?", "Si. Empresas y emprendedores tendran licencias, usuarios asignados, campanas, seguimiento de avance y reportes autorizados."],
      ["Mi informacion esta protegida?", "El usuario conserva la propiedad de su informacion. El acceso se controla por roles, permisos, bitacora y politicas de privacidad."],
      ["Que pasa si necesito ayuda personalizada?", "Puedes contratar coaching 1o1, cursos o servicios de outplacement segun tu caso. Tambien puedes escribirnos por WhatsApp desde esta pantalla."],
    ],
    footer: "2026 Empleate YA. Disenado para avanzar con confianza.",
    privacy: "Privacidad",
    settings: "Configuracion",
    whatsapp: "WhatsApp",
    whatsappMessage: "Hola, quiero informacion sobre Empleate YA.",
    heroAlt: "Mujer profesional acompanada por bots de Empleate YA",
  },
  en: {
    login: "Sign in",
    register: "Create account",
    badge: "Your career, with clarity",
    title: "Find work that also feels right for you.",
    description: "A human employability method supported by artificial intelligence to discover your direction, strengthen your profile, and move forward with confidence.",
    primary: "Start my journey",
    secondary: "Explore platform",
    benefits: ["Personalized path", "Saved deliverables", "Move at your pace"],
    routeEyebrow: "Your professional path",
    routeTitle: "Small steps, strong direction.",
    steps: [
      ["01", "Discovery", "Lumo, BoostMe: Impulsame, Clio Tarot, Recharge, and Sensei Ikigai."],
      ["02", "Strategic resume", "ScoreX, Optim, and ScoreX 360 - Ciclope."],
      ["03", "LinkedIn", "Mr. Boost Linked and Tommy Lee Picture."],
      ["04", "Prospecting", "New Job Challenge and Indiana Jobs."],
      ["05", "Persuasion", "Mr. Wow and Miss Quest."],
    ],
    testimonialsEyebrow: "Real stories",
    testimonialsTitle: "Human guidance supported by intelligent tools.",
    testimonialsNote: "Published testimonials must have validated authorization, folio, and validity before production display.",
    methodologyEyebrow: "Empleate YA methodology",
    methodologyTitle: "Five funnel stages to move forward with structure.",
    methodologyDescription: "The platform does more than generate documents: it supports the full process so you can understand yourself, build your value proposition, find opportunities, and communicate better.",
    methodology: [
      {
        avatar: "/avatars/lumo.png",
        name: "Lumo",
        stage: "Discovery",
        title: "Understand your starting point",
        objective: "Personal clarity and professional direction",
        description: "Identify priorities, energy, motivators, and professional direction before taking action. This stage helps you avoid searching from urgency and choose the next step more wisely.",
        avatarHint: "Clarifies priorities, motivation, energy, and professional direction.",
        color: "#FDE2E4",
        accent: "#E11D48",
      },
      {
        avatar: "/avatars/scorex.png",
        name: "ScoreX",
        stage: "Strategic resume",
        title: "Diagnose and strengthen your resume",
        objective: "Clear, measurable, competitive resume",
        description: "Evaluate clarity, structure, ATS compatibility, and profile strength so you know what to improve before competing for a role.",
        avatarHint: "Evaluates resume clarity, ATS compatibility, and job-fit probability.",
        color: "#FFE8CC",
        accent: "#F97316",
      },
      {
        avatar: "/avatars/mr-boost-linked.png",
        name: "Mr. Boost Linked",
        stage: "LinkedIn",
        title: "Align your professional presence",
        objective: "Consistent professional brand",
        description: "Connect your resume narrative with your public profile so your value proposition is consistent across search, messaging, and networking.",
        avatarHint: "Optimizes headline, about, experience, skills, and LinkedIn strategy.",
        color: "#FEF3C7",
        accent: "#D97706",
      },
      {
        avatar: "/avatars/new-job-challenge.png",
        name: "New Job Challenge",
        stage: "Prospecting",
        title: "Search for opportunities with intention",
        objective: "Pipeline of real opportunities",
        description: "Organize actions, follow-up, and commercial focus to create conversations, applications, and real opportunities.",
        avatarHint: "Turns job search into a measurable weekly action routine.",
        color: "#DCFCE7",
        accent: "#16A34A",
      },
      {
        avatar: "/avatars/mr-wow.png",
        name: "Mr. Wow",
        stage: "Persuasion",
        title: "Prepare to speak and persuade",
        objective: "Powerful and defensible message",
        description: "Turn your professional story into short, powerful, and defensible messages for interviews, networking, and key decisions.",
        avatarHint: "Creates high-impact messages for pitches, networking, and decisive conversations.",
        color: "#DBEAFE",
        accent: "#2563EB",
      },
      {
        avatar: "/avatars/boost-me-impulsame.png",
        name: "Empleate YA",
        stage: "Ideal job",
        title: "Choose and sustain the next step",
        objective: "Decide with confidence and move forward",
        description: "Bring together clarity, resume, digital presence, prospecting, and persuasion to move closer to work that is viable, coherent, and desirable for your professional moment.",
        avatarHint: "Process close: turn progress into a concrete professional decision.",
        color: "#EDE9FE",
        accent: "#7C3AED",
      },
    ],
    faqEyebrow: "Frequently asked questions",
    faqTitle: "The essentials before you start.",
    faqDescription: "Quick answers about Empleate YA, credits, privacy, coaching, and company services.",
    faqs: [
      ["What is Empleate YA?", "It is an employability platform that combines a human methodology with artificial intelligence to diagnose, improve, and support your job search."],
      ["How do credits work?", "Each avatar consumes credits based on AI usage, generated documents, and deliverable complexity. Your statement will show date, avatar, credits used, and remaining balance."],
      ["Can companies or entrepreneurs use the platform?", "Yes. Companies and entrepreneurs will have licenses, assigned users, campaigns, progress tracking, and authorized reports."],
      ["Is my information protected?", "Users own their information. Access is controlled through roles, permissions, audit logs, and privacy policies."],
      ["What if I need personalized help?", "You can hire 1:1 coaching, courses, or outplacement services depending on your case. You can also contact us by WhatsApp from this page."],
    ],
    footer: "2026 Empleate YA. Designed to move forward with confidence.",
    privacy: "Privacy",
    settings: "Settings",
    whatsapp: "WhatsApp",
    whatsappMessage: "Hello, I would like information about Empleate YA.",
    heroAlt: "Professional woman supported by Empleate YA bots",
  },
} as const;

const testimonials = [
  {
    image: "/testimonials/testimonial-1.png",
    es: { name: "Candidata area salud", quote: "Me ayudo a ordenar mi historia profesional y presentar mejor mis logros." },
    en: { name: "Healthcare candidate", quote: "It helped me organize my professional story and present my achievements more clearly." },
  },
  {
    image: "/testimonials/testimonial-2.png",
    es: { name: "Lider comercial", quote: "ScoreX me mostro puntos ciegos de mi CV antes de enviarlo a una vacante clave." },
    en: { name: "Commercial leader", quote: "ScoreX showed me blind spots in my resume before sending it to a key opening." },
  },
  {
    image: "/testimonials/testimonial-3.png",
    es: { name: "Director en transicion", quote: "La metodologia hizo mas claro mi siguiente paso y mi mensaje de valor." },
    en: { name: "Executive in transition", quote: "The methodology made my next step and value message much clearer." },
  },
  {
    image: "/testimonials/testimonial-4.png",
    es: { name: "Profesional senior", quote: "Los agentes me dieron estructura para avanzar sin perder confianza." },
    en: { name: "Senior professional", quote: "The agents gave me structure to keep moving forward without losing confidence." },
  },
] as const;

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const t = landingCopy[language];
  const whatsappHref = `https://wa.me/525545881648?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] text-[var(--brand-ink)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-xl font-black tracking-tight text-[var(--brand-ink)]">
          Empleate <span className="text-[var(--brand-primary)]">YA</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm">
            {appLanguageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className={`flex items-center justify-center gap-1 rounded-full px-3 py-2 font-black transition ${language === option.value ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-slate-600 hover:bg-[var(--brand-primary-soft)]"}`}
                aria-label={option.label}
                aria-pressed={language === option.value}
              >
                <span aria-hidden="true" className={`${option.flagClass} rounded-[3px] shadow-sm`} />
                {option.shortLabel}
              </button>
            ))}
          </div>
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white sm:inline-flex">
            {t.login}
          </Link>
          <Link href="/register" className="rounded-full bg-[var(--brand-ink)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[var(--brand-primary)]">
            {t.register}
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-[1500px] overflow-hidden px-5 pb-10 pt-8 md:pb-0 md:pt-12">
        <div className="relative grid min-h-[calc(100vh-96px)] gap-8 lg:grid-cols-[0.85fr_1.15fr_0.9fr] lg:items-center">
          <div className="relative z-10 pt-6 lg:pt-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-primary)] shadow-sm">
              <Sparkles size={14} /> {t.badge}
            </span>
            <h1 className="mt-7 max-w-[680px] text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--brand-ink)] md:text-7xl">
              {t.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">{t.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-3.5 font-bold text-white shadow-xl shadow-[var(--brand-shadow)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-primary-strong)]">
                {t.primary} <ArrowRight size={18} />
              </Link>
              <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm transition hover:border-[var(--brand-border)] hover:text-[var(--brand-primary-strong)]">
                {t.secondary}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
              {t.benefits.map((item) => (
                <span key={item} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" />{item}</span>
              ))}
            </div>
          </div>

          <div className="relative z-0 order-first mx-auto flex min-h-[420px] w-full max-w-[600px] items-end justify-center lg:order-none lg:-mx-12 lg:min-h-[760px] lg:max-w-none">
            <Image
              src="/images/home-hero-bots-cutout.png"
              alt={t.heroAlt}
              width={1080}
              height={1440}
              priority
              className="h-auto max-h-[800px] w-full object-contain object-bottom drop-shadow-[0_34px_42px_rgba(15,23,42,0.16)]"
              sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 44vw, 88vw"
            />
          </div>

          <div className="relative z-10 rounded-[2.25rem] border border-white bg-white/85 p-5 shadow-[0_30px_90px_-45px_rgba(109,40,217,0.24)] backdrop-blur md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">{t.routeEyebrow}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">{t.routeTitle}</h2>
              </div>
              <span className="rounded-2xl bg-[var(--brand-primary-soft)] p-3 text-[var(--brand-primary)]"><Compass size={24} /></span>
            </div>
            <div className="mt-7 space-y-3">
              {t.steps.map(([number, title, description]) => (
                <div key={number} className="flex gap-4 rounded-2xl border border-slate-100 bg-[#fcfbff] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-sm font-black text-white">{number}</span>
                  <div><h3 className="font-extrabold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.methodologyEyebrow}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{t.methodologyTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{t.methodologyDescription}</p>
          </div>
          <div className="space-y-4">
            {t.methodology.map((item, index) => (
              <div key={item.stage} className="flex w-full justify-center">
                <article
                  className="group/funnel relative min-h-[260px] w-full [perspective:1400px] md:min-h-[240px]"
                  style={{ maxWidth: `${1180 - index * 100}px` }}
                >
                  <div className="relative h-full min-h-[260px] w-full rounded-[2rem] transition duration-700 [transform-style:preserve-3d] group-hover/funnel:[transform:rotateY(180deg)] group-focus-within/funnel:[transform:rotateY(180deg)] md:min-h-[240px]">
                    <button
                      type="button"
                      className="absolute inset-0 flex h-full w-full flex-col justify-center rounded-[2rem] border border-white/80 p-6 text-left shadow-[0_22px_70px_-45px_rgba(15,23,42,0.55)] outline-none [backface-visibility:hidden] md:p-8"
                      style={{ background: `linear-gradient(135deg, ${item.color}, #ffffff 78%)` }}
                      aria-label={`${item.stage}: ${item.objective}`}
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <span className="inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-black uppercase tracking-[0.14em]" style={{ color: item.accent }}>
                            {String(index + 1).padStart(2, "0")} - {item.stage}
                          </span>
                          <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{item.title}</h3>
                          <p className="mt-3 max-w-3xl text-lg font-black leading-7 text-slate-700">{item.objective}</p>
                        </div>
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/75 text-4xl font-black shadow-inner" style={{ color: item.accent }}>
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </button>

                    <div
                      className="absolute inset-0 flex h-full w-full flex-col gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] md:flex-row md:items-center md:p-6"
                      style={{ boxShadow: `0 26px 80px -48px ${item.accent}` }}
                    >
                      <div
                        className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center rounded-full bg-white ring-8 ring-white shadow-[0_22px_60px_-28px_rgba(15,23,42,0.38)] md:mx-0 md:h-52 md:w-52"
                        aria-label={`${item.name}: ${item.avatarHint}`}
                      >
                        <Image src={item.avatar} alt={item.name} fill sizes="208px" className="object-contain p-0" />
                      </div>
                      <div className="min-w-0 flex-1 text-center md:text-left">
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em]" style={{ background: item.color, color: item.accent }}>
                          {item.stage}
                        </span>
                        <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{item.name}</h3>
                        <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">{item.title}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base md:leading-7">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.testimonialsEyebrow}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{t.testimonialsTitle}</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">{t.testimonialsNote}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((item) => {
            const testimonial = item[language];
            return (
              <article key={item.image} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                <div className="relative h-64 bg-slate-50">
                  <Image src={item.image} alt={testimonial.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-contain object-bottom" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-slate-950">{testimonial.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">&quot;{testimonial.quote}&quot;</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.faqEyebrow}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{t.faqTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{t.faqDescription}</p>
          </div>
          <div className="space-y-3">
            {t.faqs.map(([question, answer], index) => (
              <article key={question} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[var(--brand-primary-soft)]"
                  aria-expanded={openFaq === index}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                      <HelpCircle size={18} />
                    </span>
                    <span className="text-base font-black text-slate-950 md:text-lg">{question}</span>
                  </span>
                  <ChevronDown className={`shrink-0 text-[var(--brand-primary)] transition ${openFaq === index ? "rotate-180" : ""}`} size={20} />
                </button>
                {openFaq === index ? (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    <p className="max-w-4xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">{answer}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{t.footer}</p>
        <div className="flex gap-5"><Link href="/privacy">{t.privacy}</Link><Link href="/account">{t.settings}</Link></div>
      </footer>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-[0_18px_45px_-20px_rgba(22,163,74,0.85)] transition hover:-translate-y-0.5 hover:bg-[#1fb85a]"
      >
        <MessageCircle size={19} />
        <span className="hidden sm:inline">{t.whatsapp}</span>
      </a>
    </main>
  );
}
