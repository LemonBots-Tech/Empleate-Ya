import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AgentCards } from "@/components/employability/AgentCards";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";

export default function DashboardPage() {
  return (
    <EmployabilityShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="font-bold text-[var(--brand-primary)]">Hola, profesional 👋</p>
          <h1 className="mt-2 text-4xl font-black">Dashboard de empleabilidad</h1>
          <p className="mt-3 text-slate-600">Escribe una meta en lenguaje natural y el orquestador propondrá agentes, créditos, insumos faltantes y entregables.</p>
        </div>
        <div className="rounded-3xl border border-[var(--brand-border)] bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Balance demo</p>
          <p className="mt-2 text-4xl font-black text-[var(--brand-primary)]">250 créditos</p>
          <p className="mt-2 text-sm text-slate-600">Incluye compra mock desde la pantalla Créditos.</p>
        </div>
      </section>
      <div className="mt-8"><PromptGatewayClient compact /></div>
      <h2 className="mb-4 mt-10 text-2xl font-black">Personajes/agentes</h2>
      <AgentCards />
    </EmployabilityShell>
  );
}
