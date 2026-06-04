import Link from "next/link";
import { methodologyStages } from "@/ai/methodologyRegistry";
import { AgentCards } from "@/components/employability/AgentCards";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
              Metodología de empleabilidad con IA
            </p>

            <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
              Tu próxima oportunidad se construye con estrategia
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Recorre cinco etapas acompañadas por agentes especializados que te ayudarán a descubrir tu dirección,
              fortalecer tu CV, posicionarte, prospectar oportunidades y comunicar tu valor.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#discovery"
                className="rounded-2xl bg-amber-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-200"
              >
                Comenzar metodología
              </Link>

              <Link
                href="/gateway"
                className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white transition hover:border-amber-300"
              >
                Hablar con el Prompt Gateway
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">Tu ruta estratégica</p>
            <h2 className="mt-3 text-2xl font-black">Cinco etapas. Trece agentes. Una meta.</h2>

            <div className="mt-6 space-y-3">
              {methodologyStages.map((stage) => (
                <Link
                  key={stage.id}
                  href={`#${stage.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-3 transition hover:border-amber-300/60"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stage.accentClass} font-black text-slate-950`}
                  >
                    {stage.number}
                  </span>
                  <span>
                    <strong className="block text-white">{stage.title}</strong>
                    <span className="text-sm text-slate-400">{stage.subtitle}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-300">Conoce la metodología</p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">Avanza etapa por etapa</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Cada agente tiene una misión concreta y genera entregables que podrás conservar, revisar y mejorar durante
            tu proceso profesional.
          </p>
        </div>

        <AgentCards />
      </section>
    </main>
  );
}
