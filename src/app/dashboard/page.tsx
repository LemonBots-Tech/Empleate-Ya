"use client";

import { useEffect, useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AgentCards } from "@/components/employability/AgentCards";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";
import { skills } from "@/ai/skillRegistry";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const dashboardCopy = {
  es: {
    hello: "Hola, profesional",
    title: "Dashboard de empleabilidad",
    description: "Escribe una meta en lenguaje natural y el orquestador propondra agentes, creditos, insumos faltantes y entregables.",
    balance: "Bolsa de creditos",
    note: "Saldo disponible para usuario online, alumno de coach, cliente de Coach Partner o ex-empleado de outplacement.",
    enough: "Suficiente para continuar",
    medium: "Cuida tu consumo",
    low: "Recarga recomendada",
    loading: "Consultando saldo...",
    gaugeFull: "Tanque lleno = creditos para ejecutar una vez todos los agentes",
    agents: "Personajes/agentes",
    enabledAgents: "Avatares habilitados por permisos de perfil",
    credits: "creditos",
  },
  en: {
    hello: "Hello, professional",
    title: "Employability dashboard",
    description: "Write a goal in natural language and the orchestrator will propose agents, credits, missing inputs, and deliverables.",
    balance: "Credit pool",
    note: "Available balance for online users, coach students, Coach Partner clients, or outplacement former employees.",
    enough: "Enough to continue",
    medium: "Watch your usage",
    low: "Top-up recommended",
    loading: "Checking balance...",
    gaugeFull: "Full tank = enough credits to run every agent once",
    agents: "Characters/agents",
    enabledAgents: "Avatars enabled by profile permissions",
    credits: "credits",
  },
} as const;

const enabledDashboardSkillIds = ["lumo", "recharge", "scorex", "mr_ikigai", "new_job_challenge", "mr_wow"];
const fullTankCredits = skills.reduce((total, skill) => total + skill.baseCredits, 0);

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
  const fuelPercent = Math.min(100, Math.max(0, Math.round((currentCredits / fullTankCredits) * 100)));
  const status = currentCredits >= fullTankCredits * 0.5 ? t.enough : currentCredits >= fullTankCredits * 0.2 ? t.medium : t.low;

  return (
    <EmployabilityShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="font-bold text-[var(--brand-primary)]">{t.hello}</p>
          <h1 className="mt-2 text-4xl font-black">{t.title}</h1>
          <p className="mt-3 text-slate-600">{t.description}</p>
        </div>
        <div className="rounded-3xl border border-[var(--brand-border)] bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t.balance}</p>
          <p className="mt-2 text-4xl font-black text-[var(--brand-primary)]">
            {credits === null ? t.loading : `${currentCredits.toLocaleString(language === "es" ? "es-MX" : "en-US")} ${t.credits}`}
          </p>
          <CreditFuelGauge percent={fuelPercent} status={status} />
          <p className="mt-2 text-sm text-slate-600">{t.note}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">{t.gaugeFull}: {fullTankCredits.toLocaleString(language === "es" ? "es-MX" : "en-US")} {t.credits}</p>
        </div>
      </section>
      <div className="mt-8"><PromptGatewayClient compact /></div>
      <div className="mb-4 mt-10">
        <h2 className="text-2xl font-black">{t.agents}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{t.enabledAgents}</p>
      </div>
      <AgentCards enabledSkillIds={enabledDashboardSkillIds} />
    </EmployabilityShell>
  );
}

function CreditFuelGauge({ percent, status }: { percent: number; status: string }) {
  const angle = -90 + (percent / 100) * 180;

  return (
    <div className="mt-5">
      <div className="relative mx-auto h-28 w-56 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-56 rounded-full border-[14px] border-slate-800"
          style={{ background: "conic-gradient(from 270deg, #ef4444 0deg 36deg, #facc15 36deg 78deg, #d9f99d 78deg 116deg, #86efac 116deg 150deg, #22c55e 150deg 180deg, transparent 180deg 360deg)" }}
        />
        <div className="absolute inset-x-7 bottom-0 h-40 rounded-t-full bg-white" />
        <div className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-slate-800" />
        <div
          className="absolute bottom-2 left-1/2 h-20 w-1 origin-bottom rounded-full bg-slate-950 shadow"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        <span>{status}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-2 grid grid-cols-3 text-[11px] font-bold text-slate-400">
        <span>0</span>
        <span className="text-center">50%</span>
        <span className="text-right">100%</span>
      </div>
    </div>
  );
}
