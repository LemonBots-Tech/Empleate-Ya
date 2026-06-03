import Link from "next/link";
import { notFound } from "next/navigation";
import { personaRegistry } from "@/ai/personaRegistry";
import { skillRegistry } from "@/ai/skillRegistry";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = skillRegistry[id as keyof typeof skillRegistry];

  if (!skill) {
    notFound();
  }

  const persona = personaRegistry[skill.personaId];
  const hasAvatar = skill.personaId === "mr_ikigai";

  return (
    <EmployabilityShell>
      <section className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className={`rounded-[2rem] bg-gradient-to-br ${persona.themeClass} p-8 text-slate-950 shadow-2xl`}>
          <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-3xl bg-white/50 p-2 shadow-xl">
            {hasAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/avatars/sensei-ikigai.png" alt={persona.name} className="block h-full w-full object-contain" />
            ) : null}
          </div>

          <h1 className="mt-6 text-4xl font-black">{skill.name}</h1>
          <p className="mt-3 font-semibold">Tono: {persona.tone}</p>
          <p className="mt-3 rounded-full bg-white/50 px-4 py-2 text-sm font-bold">{skill.baseCredits} créditos base</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-black">Qué hace</h2>
          <p className="mt-3 text-slate-300">{skill.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <h3 className="font-bold">Inputs requeridos</h3>
              <p className="mt-2 text-sm text-slate-300">{skill.requiredInputs.join(", ") || "Ninguno"}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <h3 className="font-bold">Outputs</h3>
              <p className="mt-2 text-sm text-slate-300">{skill.outputTypes.join(", ")}</p>
            </div>
          </div>

          <Link href="/gateway" className="mt-8 inline-flex rounded-2xl bg-amber-300 px-5 py-3 font-bold text-slate-950">
            Usar en Prompt Gateway
          </Link>
        </div>
      </section>
    </EmployabilityShell>
  );
}
