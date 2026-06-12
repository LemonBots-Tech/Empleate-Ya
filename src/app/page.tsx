"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Compass, MessageCircle, Sparkles } from "lucide-react";
import { AgentCards } from "@/components/employability/AgentCards";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";
import { appLanguageOptions, useLanguage } from "@/lib/i18n/LanguageProvider";

const landingCopy = {
  es: {
    login: "Iniciar sesión",
    register: "Crear cuenta",
    badge: "Tu carrera, con claridad",
    title: "Encuentra el trabajo que también se sienta bien para ti.",
    description: "Una metodología humana acompañada por inteligencia artificial para descubrir tu dirección, fortalecer tu perfil y avanzar con confianza.",
    primary: "Comenzar mi recorrido",
    secondary: "Explorar plataforma",
    benefits: ["Ruta personalizada", "Entregables guardados", "Avanza a tu ritmo"],
    routeEyebrow: "Tu ruta profesional",
    routeTitle: "Pequeños pasos, gran dirección.",
    steps: [
      ["01", "Discovery", "Lumo, BoostMe: Impúlsame, Clío Tarot, Recharge y Sensei Ikigai."],
      ["02", "Currículum estratégico", "ScoreX, Optim y ScoreX 360 — Cíclope."],
      ["03", "LinkedIn", "Mr. Boost Linked y Tommy Lee Picture."],
      ["04", "Prospección", "New Job Challenge e Indiana Jobs."],
      ["05", "Persuasión", "Mr. Wow y Miss Quest."],
    ],
    teamEyebrow: "Tu equipo personal",
    teamTitle: "Agentes expertos, una sola experiencia.",
    teamDescription: "Elige por dónde comenzar. Cada agente tiene una misión clara y te acompaña con resultados accionables.",
    testimonialsEyebrow: "Historias reales",
    testimonialsTitle: "Acompañamiento humano con herramientas inteligentes.",
    testimonialsNote: "Los testimonios publicados deberán contar con autorización validada, folio y vigencia antes de mostrarse en producción.",
    footer: "© 2026 Empléate YA. Diseñado para avanzar con confianza.",
    privacy: "Privacidad",
    settings: "Configuración",
    whatsapp: "WhatsApp",
    whatsappMessage: "Hola, quiero información sobre Empléate YA.",
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
      ["01", "Discovery", "Lumo, BoostMe: Impúlsame, Clío Tarot, Recharge, and Sensei Ikigai."],
      ["02", "Strategic resume", "ScoreX, Optim, and ScoreX 360 — Cíclope."],
      ["03", "LinkedIn", "Mr. Boost Linked and Tommy Lee Picture."],
      ["04", "Prospecting", "New Job Challenge and Indiana Jobs."],
      ["05", "Persuasion", "Mr. Wow and Miss Quest."],
    ],
    teamEyebrow: "Your personal team",
    teamTitle: "Expert agents, one experience.",
    teamDescription: "Choose where to begin. Each agent has a clear mission and supports you with actionable results.",
    testimonialsEyebrow: "Real stories",
    testimonialsTitle: "Human guidance supported by intelligent tools.",
    testimonialsNote: "Published testimonials must have validated authorization, folio, and validity before production display.",
    footer: "© 2026 Empléate YA. Designed to move forward with confidence.",
    privacy: "Privacy",
    settings: "Settings",
    whatsapp: "WhatsApp",
    whatsappMessage: "Hello, I would like information about Empléate YA.",
  },
} as const;

const testimonials = [
  { image: "/testimonials/testimonial-1.png", name: "Candidata area salud", quote: "Me ayudo a ordenar mi historia profesional y presentar mejor mis logros." },
  { image: "/testimonials/testimonial-2.png", name: "Lider comercial", quote: "ScoreX me mostro puntos ciegos de mi CV antes de enviarlo a una vacante clave." },
  { image: "/testimonials/testimonial-3.png", name: "Director en transicion", quote: "La metodologia hizo mas claro mi siguiente paso y mi mensaje de valor." },
  { image: "/testimonials/testimonial-4.png", name: "Profesional senior", quote: "Los agentes me dieron estructura para avanzar sin perder confianza." },
] as const;

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const t = landingCopy[language];
  const whatsappHref = `https://wa.me/525545881648?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] text-[var(--brand-ink)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-xl font-black tracking-tight text-[var(--brand-ink)]">
          Empléate <span className="text-[var(--brand-primary)]">YA</span>
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
              alt="Mujer profesional acompañada por bots de Empléate YA"
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

      <section className="relative z-20 mx-auto -mt-4 max-w-5xl px-5 pb-16 md:-mt-24 md:pb-20">
        <PromptGatewayClient compact homeChat />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:pb-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.testimonialsEyebrow}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{t.testimonialsTitle}</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">{t.testimonialsNote}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((item) => (
            <article key={item.image} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative h-64 bg-slate-50">
                <Image src={item.image} alt={item.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-contain object-bottom" />
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-950">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">&quot;{item.quote}&quot;</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white/70">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.teamEyebrow}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{t.teamTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{t.teamDescription}</p>
          </div>
          <AgentCards />
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
