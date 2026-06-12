"use client";

import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AgentCards } from "@/components/employability/AgentCards";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const dashboardCopy = {
  es: {
    hello: "Hola, profesional 👋",
    title: "Dashboard de empleabilidad",
    description: "Escribe una meta en lenguaje natural y el orquestador propondrá agentes, créditos, insumos faltantes y entregables.",
    balance: "Balance demo",
    credits: "250 créditos",
    note: "Incluye compra mock desde la pantalla Créditos.",
    agents: "Personajes/agentes",
  },
  en: {
    hello: "Hello, professional 👋",
    title: "Employability dashboard",
    description: "Write a goal in natural language and the orchestrator will propose agents, credits, missing inputs, and deliverables.",
    balance: "Demo balance",
    credits: "250 credits",
    note: "Includes a mock purchase from the Credits screen.",
    agents: "Characters/agents",
  },
} as const;

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = dashboardCopy[language];

  return (
    <EmployabilityShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="font-bold text-[var(--brand-primary)]">{t.hello}</p>
          <h1 className="mt-2 text-4xl font-black">{t.title}</h1>
          <p className="mt-3 text-slate-600">{t.description}</p>
        </div>
        <div className="rounded-3xl border border-[var(--brand-border)] bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t.balance}</p>
          <p className="mt-2 text-4xl font-black text-[var(--brand-primary)]">{t.credits}</p>
          <p className="mt-2 text-sm text-slate-600">{t.note}</p>
        </div>
      </section>
      <div className="mt-8"><PromptGatewayClient compact /></div>
      <h2 className="mb-4 mt-10 text-2xl font-black">{t.agents}</h2>
      <AgentCards />
    </EmployabilityShell>
  );
}
