import { notFound } from "next/navigation";
import { skillRegistry, type SkillId } from "@/ai/skillRegistry";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { ModuleIntroClient } from "@/components/employability/ModuleIntroClient";

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(id in skillRegistry)) notFound();

  return (
    <EmployabilityShell>
      <ModuleIntroClient skillId={id as SkillId} />
    </EmployabilityShell>
  );
}
