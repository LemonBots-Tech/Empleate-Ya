import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { skills } from "@/ai/skillRegistry";
import { personaRegistry, type PersonaId } from "@/ai/personaRegistry";

const agentAccents: Record<PersonaId, { surface: string; badge: string; initials: string }> = {
  scorex: { surface: "from-violet-100 to-blue-50", badge: "bg-violet-600", initials: "SX" },
  optim: { surface: "from-rose-100 to-orange-50", badge: "bg-rose-500", initials: "OP" },
  mr_boost_linked: { surface: "from-sky-100 to-cyan-50", badge: "bg-sky-600", initials: "BL" },
  tommy_lee_picture: { surface: "from-fuchsia-100 to-pink-50", badge: "bg-fuchsia-500", initials: "TP" },
  miss_quest: { surface: "from-indigo-100 to-violet-50", badge: "bg-indigo-600", initials: "MQ" },
  mr_wow: { surface: "from-amber-100 to-orange-50", badge: "bg-amber-500", initials: "MW" },
  new_job_challenge: { surface: "from-emerald-100 to-teal-50", badge: "bg-emerald-600", initials: "NJ" },
  indiana_jobs: { surface: "from-lime-100 to-emerald-50", badge: "bg-lime-600", initials: "IJ" },
  recharge: { surface: "from-teal-100 to-cyan-50", badge: "bg-teal-600", initials: "RE" },
  mr_ikigai: { surface: "from-rose-100 to-violet-50", badge: "bg-rose-500", initials: "IK" },
};

export function AgentCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => {
        const persona = personaRegistry[skill.personaId];
        const accent = agentAccents[skill.personaId];

        return (
          <Link
            key={skill.id}
            href={`/modules/${skill.id}`}
            className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(71,85,105,0.5)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-border)] hover:shadow-[0_24px_60px_-30px_rgba(109,40,217,0.22)]"
          >
            <div className={`relative flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${accent.surface}`}>
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/70 blur-xl" />
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-[1.6rem] ${accent.badge} text-2xl font-black tracking-tight text-white shadow-lg ring-8 ring-white/70`}>
                {accent.initials}
              </div>
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-600 backdrop-blur">
                <Sparkles size={12} /> IA especializada
              </span>
            </div>

            <div className="pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Agente de empleabilidad</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{skill.name}</h3>
                </div>
                <span className="rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-[var(--brand-primary)] group-hover:text-white">
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{skill.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
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
