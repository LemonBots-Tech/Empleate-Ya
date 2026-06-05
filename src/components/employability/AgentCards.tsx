import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { skills } from "@/ai/skillRegistry";
import { personaRegistry } from "@/ai/personaRegistry";

export function AgentCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => {
        const persona = personaRegistry[skill.personaId];
        return (
          <Link
            key={skill.id}
            href={`/modules/${skill.id}`}
            className="group min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(71,85,105,0.5)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-border)] hover:shadow-[0_24px_60px_-30px_rgba(109,40,217,0.22)]"
          >
            <div className={`relative flex min-h-52 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${persona.themeClass}`}>
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/70 blur-xl" />
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/90 bg-white shadow-xl ring-8 ring-white/40 sm:h-44 sm:w-44">
                <Image
                  src={persona.avatarPath}
                  alt={`Avatar de ${persona.name}`}
                  fill
                  sizes="176px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-600 backdrop-blur">
                <Sparkles size={12} /> IA especializada
              </span>
            </div>
            <div className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Agente de empleabilidad</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{skill.name}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-[var(--brand-primary)] group-hover:text-white">
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{skill.description}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
                <span className="font-semibold text-slate-500">Tono {persona.tone.split(",")[0]}</span>
                <span className="font-extrabold text-[var(--brand-primary)]">{skill.baseCredits} créditos</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
