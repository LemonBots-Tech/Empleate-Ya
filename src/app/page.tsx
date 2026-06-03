import Link from "next/link";
import { AgentCards } from "@/components/employability/AgentCards";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">SaaS de empleabilidad con IA</p>
          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">Empléate YA AI Platform</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Backend central con orquestador, sistema de créditos y agentes internos para evaluar, optimizar, guardar y descargar
            entregables profesionales.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-2xl bg-amber-300 px-5 py-3 font-bold text-slate-950 hover:bg-amber-200">
              Ver MVP navegable
            </Link>

            <Link href="/gateway" className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white hover:border-amber-300">
              Probar Prompt Gateway
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h2 className="text-2xl font-black">Fase 1 MVP técnico</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            <li>• Skill registry y persona registry.</li>
            <li>• Prompt Gateway central.</li>
            <li>• ScoreX y Optim mock.</li>
            <li>• Créditos mock con ledger.</li>
            <li>• Artifacts guardados en memoria para desarrollo.</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <AgentCards />
      </section>
    </main>
  );
}
