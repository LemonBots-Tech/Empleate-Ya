import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { methodologyStages } from "@/ai/methodologyRegistry";
import { personaRegistry } from "@/ai/personaRegistry";
import { skillRegistry } from "@/ai/skillRegistry";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = skillRegistry[id as keyof typeof skillRegistry];

  if (!skill) {
    notFound();
  }

  const persona = personaRegistry[skill.personaId];
  const stage = methodologyStages.find((item) => item.agentIds.includes(skill.id));

  return (
    <EmployabilityShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="font-bold text-amber-300 hover:text-amber-200">
            Metodología
          </Link>
          <span>/</span>
          <span>Etapa {stage?.number}</span>
          <span>/</span>
          <span className="text-white">{skill.name}</span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <aside
            className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${persona.themeClass} text-slate-950 shadow-2xl`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-white/85">
              <Image
                src={persona.avatarPath}
                alt={`Avatar de ${persona.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-contain"
              />
            </div>

            <div className="p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Etapa {stage?.number}: {stage?.title}
              </p>
              <h1 className="mt-3 text-4xl font-black">{skill.name}</h1>
              <p className="mt-3 font-semibold">Tono: {persona.tone}</p>
              <p className="mt-5 inline-flex rounded-full bg-white/60 px-4 py-2 text-sm font-bold">
                {skill.baseCredits} créditos base
              </p>
            </div>
          </aside>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">{stage?.subtitle}</p>
            <h2 className="mt-3 text-3xl font-black">Qué hace {skill.name}</h2>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">{skill.description}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <h3 className="font-bold text-white">Información necesaria</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {skill.requiredInputs.map((input) => (
                    <li key={input}>• {formatLabel(input)}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <h3 className="font-bold text-white">Entregables</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {skill.outputTypes.map((output) => (
                    <li key={output}>• {formatLabel(output)}</li>
                  ))}
                </ul>
              </div>
            </div>

            {skill.optionalInputs.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <h3 className="font-bold text-white">Información opcional para personalizar el resultado</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skill.optionalInputs.map((input) => (
                    <span key={input} className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                      {formatLabel(input)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/gateway"
                className="inline-flex rounded-2xl bg-amber-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-200"
              >
                Usar en Prompt Gateway
              </Link>

              <Link
                href={`/#${stage?.id ?? "discovery"}`}
                className="inline-flex rounded-2xl border border-white/20 px-5 py-3 font-bold text-white transition hover:border-amber-300"
              >
                Volver a la etapa
              </Link>
            </div>
          </div>
        </section>
      </div>
    </EmployabilityShell>
  );
}
