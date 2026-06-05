import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";

export default async function GatewayPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { module } = await searchParams;
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black tracking-tight text-slate-950">Gateway orquestador</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Cuéntanos qué necesitas una sola vez. El Gateway detecta tu intención, valida insumos y créditos, y combina uno o más asistentes para construir el plan adecuado.</p>
      <div className="mt-8"><PromptGatewayClient selectedModule={module} /></div>
    </EmployabilityShell>
  );
}
