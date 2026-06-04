import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { personaRegistry } from "@/ai/personaRegistry";
import { skillRegistry } from "@/ai/skillRegistry";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

const formatLabel = (value: string) => value.replaceAll("_", " ");

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = skillRegistry[id as keyof typeof skillRegistry];
  if (!skill) notFound();
  const persona = personaRegistry[skill.personaId];

  return (
    <EmployabilityShell>
      <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[var(--brand-primary-strong)]">
        <ArrowLeft size={16} /> Volver a los agentes
      </Link>

      <section className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="relative overflow-hidden rounded-[2rem] border border-[var(--brand-border)] bg-gradient-to-br from-[var(--brand-primary-soft)] via-white to-[var(--brand-highlight-soft)] p-7 shadow-[0_25px_80px_-45px_rgba(109,40,217,0.4)] md:p-9">
          <div className="absolute -right-14 -top-12 h-44 w-44 rounded-full bg-white/70 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--brand-primary)] shadow-sm">
              <Sparkles size={13} /> Agente especializado
            </span>
            <div className="mt-10 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-[var(--brand-primary)] text-4xl font-black text-white shadow-xl shadow-[var(--brand-shadow)] ring-[10px] ring-white/70">
              {skill.name.slice(0, 2).toUpperCase()}
            </div>
            <h1 className="mt-8 text-4xl font-black tracking-[-0.045em] text-slate-950 md:text-5xl">{skill.name}</h1>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-600">Un acompañamiento {persona.tone} para ayudarte a avanzar con claridad.</p>
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-white bg-white/65 p-4 backdrop-blur">
              <span className="text-sm font-semibold text-slate-500">Inversión base</span>
              <span className="font-black text-[var(--brand-primary-strong)]">{skill.baseCredits} créditos</span>
            </div>
          </div>
        </aside>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(71,85,105,0.45)] md:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Cómo puede ayudarte</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950">Convierte tu objetivo en un siguiente paso concreto.</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{skill.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-[#fcfbff] p-5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900"><CheckCircle2 size={18} className="text-emerald-500" /> Lo que necesitamos</div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                {skill.requiredInputs.map((input) => <li key={input} className="capitalize">• {formatLabel(input)}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-[#fffdf8] p-5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900"><FileText size={18} className="text-amber-500" /> Lo que recibirás</div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                {skill.outputTypes.map((output) => <li key={output} className="capitalize">• {formatLabel(output)}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white md:flex md:items-center md:justify-between">
            <div><p className="font-extrabold">¿Listo para comenzar?</p><p className="mt-1 text-sm text-slate-300">El Gateway preparará un plan antes de usar tus créditos.</p></div>
            <Link href={`/gateway?module=${skill.id}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-[var(--brand-primary-soft)] md:mt-0">
              Comenzar con {skill.name} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </EmployabilityShell>
  );
}
