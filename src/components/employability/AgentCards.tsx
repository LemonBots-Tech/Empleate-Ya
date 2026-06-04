import Image from "next/image";
import Link from "next/link";
import { methodologyStages } from "@/ai/methodologyRegistry";
import { personaRegistry } from "@/ai/personaRegistry";
import { skillRegistry } from "@/ai/skillRegistry";

export function AgentCards() {
  return (
    <div className="space-y-14">
      {methodologyStages.map((stage) => (
        <section
          key={stage.id}
          id={stage.id}
          className="scroll-mt-6 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl md:p-8"
        >
          <div className="grid gap-5 lg:grid-cols-[160px_1fr] lg:items-start">
            <div>
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${stage.accentClass} text-2xl font-black text-slate-950 shadow-xl`}
              >
                {stage.number}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
                Etapa {stage.number}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-black text-white md:text-4xl">{stage.title}</h2>
              <p className="mt-2 text-lg font-bold text-amber-200">{stage.subtitle}</p>
              <p className="mt-3 max-w-4xl leading-7 text-slate-300">{stage.description}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stage.agentIds.map((agentId) => {
              const skill = skillRegistry[agentId];
              const persona = personaRegistry[skill.personaId];

              return (
                <Link
                  key={skill.id}
                  href={`/modules/${skill.id}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-2xl hover:shadow-amber-300/10"
                >
                  <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${persona.themeClass}`}>
                    <Image
                      src={persona.avatarPath}
                      alt={`Avatar de ${persona.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/90 to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur">
                      {skill.baseCredits} créditos base
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-black text-white">{skill.name}</h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-300">{skill.description}</p>
                    <p className="mt-5 text-sm font-bold text-amber-300">Conocer al agente →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
