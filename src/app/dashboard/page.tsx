"use client";

import { useEffect, useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AgentCards } from "@/components/employability/AgentCards";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const dashboardCopy = {
  es: {
    hello: "Hola, profesional 👋",
    title: "Dashboard de empleabilidad",
    description: "Escribe una meta en lenguaje natural y el orquestador propondrá agentes, créditos, insumos faltantes y entregables.",
    balance: "Bolsa de créditos",
    note: "Saldo disponible para usuario online, alumno de coach, cliente de Coach Partner o ex-empleado de outplacement.",
    enough: "Suficiente para continuar",
    medium: "Cuida tu consumo",
    low: "Recarga recomendada",
    loading: "Consultando saldo...",
    agents: "Personajes/agentes",
  },
  en: {
    hello: "Hello, professional 👋",
    title: "Employability dashboard",
    description: "Write a goal in natural language and the orchestrator will propose agents, credits, missing inputs, and deliverables.",
    balance: "Credit pool",
    note: "Available balance for online users, coach students, Coach Partner clients, or outplacement former employees.",
    enough: "Enough to continue",
    medium: "Watch your usage",
    low: "Top-up recommended",
    loading: "Checking balance...",
    agents: "Characters/agents",
  },
} as const;

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = dashboardCopy[language];
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/credits/balance")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("BALANCE_ERROR")))
      .then((data: { wallet?: { balance?: number } }) => {
        if (active) setCredits(data.wallet?.balance ?? 0);
      })
      .catch(() => {
        if (active) setCredits(0);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentCredits = credits ?? 0;
  const fuelPercent = Math.min(100, Math.max(0, Math.round((currentCredits / 500) * 100)));
  const status = currentCredits >= 250 ? t.enough : currentCredits >= 100 ? t.medium : t.low;

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
          <p className="mt-2 text-4xl font-black text-[var(--brand-primary)]">{credits === null ? t.loading : `${currentCredits.toLocaleString(language === "es" ? "es-MX" : "en-US")} ${language === "es" ? "créditos" : "credits"}`}</p>
          <CreditFuelGauge percent={fuelPercent} status={status} />
          <p className="mt-2 text-sm text-slate-600">{t.note}</p>
        </div>
      </section>
      <div className="mt-8"><PromptGatewayClient compact /></div>
      <h2 className="mb-4 mt-10 text-2xl font-black">{t.agents}</h2>
      <AgentCards />
    </EmployabilityShell>
  );
}

function CreditFuelGauge({ percent, status }: { percent: number; status: string }) {
  const color = percent >= 50 ? "bg-emerald-500" : percent >= 20 ? "bg-amber-400" : "bg-rose-500";

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        <span>{status}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-7 flex-1 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-1 shadow-inner">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
        </div>
        <div className="h-5 w-2 rounded-r-md bg-slate-300" />
      </div>
      <div className="mt-2 grid grid-cols-3 text-[11px] font-bold text-slate-400">
        <span>0</span>
        <span className="text-center">250</span>
        <span className="text-right">500+</span>
      </div>
    </div>
  );
}
