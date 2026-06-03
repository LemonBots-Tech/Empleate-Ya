import Link from "next/link";
import { personaRegistry } from "@/ai/personaRegistry";
import { skills } from "@/ai/skillRegistry";

export function AgentCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {skills.map((skill) => {
        const persona = personaRegistry[skill.personaId];

        return (
          <Link
            key={skill.id}
            href={`/modules/${skill.id}`}
            className="group rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-amber-300/60 hover:bg-white/10"
          >
            <div className={`mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${persona.themeClass} shadow-lg`} />
            <h3 className="font-bold text-white">{skill.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-slate-300">{skill.description}</p>
            <p className="mt-3 text-sm font-semibold text-amber-200">{skill.baseCredits} créditos base</p>
          </Link>
        );
      })}
    </div>
  );
}
