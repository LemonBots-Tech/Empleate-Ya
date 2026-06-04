import Link from "next/link";
import { ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { AgentCards } from "@/components/employability/AgentCards";

const steps = [
  ["01", "Descubre", "Aclara propósito, energía y prioridades."],
  ["02", "Construye", "Convierte tu experiencia en una historia profesional sólida."],
  ["03", "Conecta", "Proyecta tu valor y encuentra oportunidades con intención."],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] text-[var(--brand-ink)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-xl font-black tracking-tight text-[var(--brand-ink)]">
          Empléate <span className="text-[var(--brand-primary)]">YA</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white sm:inline-flex">
            Iniciar sesión
          </Link>
          <Link href="/register" className="rounded-full bg-[var(--brand-ink)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[var(--brand-primary)]">
            Crear cuenta
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute left-[-10%] top-16 h-72 w-72 rounded-full bg-[var(--brand-primary-soft)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-8%] top-0 h-80 w-80 rounded-full bg-[var(--brand-highlight-soft)] blur-3xl" />

        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-primary)] shadow-sm">
              <Sparkles size={14} /> Tu carrera, con claridad
            </span>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--brand-ink)] md:text-7xl">
              Encuentra el trabajo que también se sienta bien para ti.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Una metodología humana acompañada por inteligencia artificial para descubrir tu dirección, fortalecer tu perfil y avanzar con confianza.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-3.5 font-bold text-white shadow-xl shadow-[var(--brand-shadow)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-primary-strong)]">
                Comenzar mi recorrido <ArrowRight size={18} />
              </Link>
              <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm transition hover:border-[var(--brand-border)] hover:text-[var(--brand-primary-strong)]">
                Explorar plataforma
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
              {["Ruta personalizada", "Entregables guardados", "Avanza a tu ritmo"].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" />{item}</span>
              ))}
            </div>
          </div>

          <div className="relative rounded-[2.25rem] border border-white bg-white/75 p-5 shadow-[0_30px_90px_-45px_rgba(109,40,217,0.24)] backdrop-blur md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Tu ruta profesional</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Pequeños pasos, gran dirección.</h2>
              </div>
              <span className="rounded-2xl bg-[var(--brand-primary-soft)] p-3 text-[var(--brand-primary)]"><Compass size={24} /></span>
            </div>
            <div className="mt-7 space-y-3">
              {steps.map(([number, title, description]) => (
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
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--brand-primary)]">Tu equipo personal</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Agentes expertos, una sola experiencia.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Elige por dónde comenzar. Cada agente tiene una misión clara y te acompaña con resultados accionables.</p>
          </div>
          <AgentCards />
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Empléate YA. Diseñado para avanzar con confianza.</p>
        <div className="flex gap-5"><Link href="/privacy">Privacidad</Link><Link href="/account">Configuración</Link></div>
      </footer>
    </main>
  );
}
