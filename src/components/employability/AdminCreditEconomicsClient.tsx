"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, CircleDollarSign, Gauge, MessageSquareText, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminControlNav } from "./AdminControlNav";

type AiModelCost = {
  provider: string;
  model: string;
  inputUsdPer1m: number;
  outputUsdPer1m: number;
  useCase: string;
  isDefault?: boolean;
};

type ScreenTokenBudget = {
  screenKey: string;
  label: string;
  moduleId?: string;
  absorptionMode: "absorbed" | "charged" | "included_in_license";
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  minCredits: number;
  recommendedCredits: number;
  notes?: string;
};

type CreditPolicy = {
  name: string;
  usdToMxnRate: number;
  creditValueMxn: number;
  grossMarginPct: number;
  sourceNote: string;
  modelCosts: AiModelCost[];
  screenBudgets: ScreenTokenBudget[];
};

type CreditReportRow = {
  id: string;
  userName: string;
  userEmail?: string;
  type: "purchase" | "usage" | "refund" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  currentBalance: number;
  createdAt: string;
};

const copy = {
  es: {
    eyebrow: "Economía de créditos",
    title: "Costo, tokens y margen",
    description: "Controla cuánto cuesta cada pantalla/agente, qué se absorbe como marketing y qué se descuenta del balance del usuario, empresa o emprendedor.",
    loading: "Cargando política de créditos...",
    denied: "Necesitas super admin para ver esta información.",
    devLogin: "Activar demo admin",
    refreshRate: "Consultar tipo de cambio",
    liveRate: "Tipo de cambio en línea",
    fallbackRate: "Usando valor guardado",
    exchange: "Tipo de cambio",
    creditValue: "Valor de 1 crédito",
    margin: "Margen objetivo",
    absorbed: "Costo absorbido",
    charged: "Descuenta créditos",
    included_in_license: "Incluido en licencia",
    models: "Modelos y costos de referencia",
    screens: "Presupuesto por pantalla/agente",
    screen: "Pantalla",
    tokens: "Tokens estimados",
    mode: "Modo",
    min: "Mín.",
    recommended: "Recomendado",
    calculated: "Costo calculado",
    note: "Nota",
    baseline: "Baseline por ciclo completo",
    report: "Consumo reciente",
    user: "Usuario",
    date: "Fecha/hora",
    movement: "Movimiento",
    balance: "Saldo",
  },
  en: {
    eyebrow: "Credit economics",
    title: "Cost, tokens, and margin",
    description: "Control how much each screen/agent costs, what is absorbed as marketing, and what is deducted from the user, company, or entrepreneur balance.",
    loading: "Loading credit policy...",
    denied: "Super admin is required to view this information.",
    devLogin: "Activate admin demo",
    refreshRate: "Fetch exchange rate",
    liveRate: "Live exchange rate",
    fallbackRate: "Using stored value",
    exchange: "Exchange rate",
    creditValue: "1 credit value",
    margin: "Target margin",
    absorbed: "Absorbed cost",
    charged: "Deducts credits",
    included_in_license: "Included in license",
    models: "Models and reference costs",
    screens: "Budget by screen/agent",
    screen: "Screen",
    tokens: "Estimated tokens",
    mode: "Mode",
    min: "Min.",
    recommended: "Recommended",
    calculated: "Calculated cost",
    note: "Note",
    baseline: "Full-cycle baseline",
    report: "Recent consumption",
    user: "User",
    date: "Date/time",
    movement: "Movement",
    balance: "Balance",
  },
} as const;

const baselinePlans = [
  { label: "Usuario online", credits: 750, note: "Entrada individual con ScoreX, discovery, Mr. Wow y recarga puntual." },
  { label: "Cliente emprendedor", credits: 1600, note: "Ciclo completo con discovery, CV estrategico, LinkedIn, prospeccion y entrevista." },
  { label: "Ex-empleado outplacement", credits: 1900, note: "Ciclo completo con margen para repeticion controlada y seguimiento de campana." },
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);
}

function estimateCostMxn(policy: CreditPolicy, model: AiModelCost, inputTokens: number, outputTokens: number) {
  const usd = (inputTokens / 1_000_000) * model.inputUsdPer1m + (outputTokens / 1_000_000) * model.outputUsdPer1m;
  return usd * policy.usdToMxnRate * (1 + policy.grossMarginPct);
}

export function AdminCreditEconomicsClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [policy, setPolicy] = useState<CreditPolicy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchangeMessage, setExchangeMessage] = useState<string | null>(null);
  const [reportRows, setReportRows] = useState<CreditReportRow[]>([]);

  useEffect(() => {
    async function loadPolicy() {
      const response = await fetch("/api/admin/credit-economics");
      const data = await response.json();
      if (!response.ok) {
        setError(t.denied);
        return;
      }
      setPolicy(data.policy);
    }
    void loadPolicy();
  }, [t.denied]);

  useEffect(() => {
    async function loadReport() {
      const response = await fetch("/api/admin/credits/report");
      const data = await response.json();
      if (response.ok) setReportRows(data.report.rows.slice(0, 8));
    }
    void loadReport();
  }, []);

  async function activateDevAdmin() {
    const response = await fetch("/api/auth/dev-admin-login", { method: "POST" });
    if (!response.ok) {
      setError(t.denied);
      return;
    }
    setError(null);
    const policyResponse = await fetch("/api/admin/credit-economics");
    const data = await policyResponse.json();
    if (policyResponse.ok) setPolicy(data.policy);
  }

  async function refreshExchangeRate() {
    const response = await fetch("/api/admin/exchange-rate");
    const data = await response.json();
    if (!response.ok) {
      setExchangeMessage(t.denied);
      return;
    }
    setPolicy((current) => current ? { ...current, usdToMxnRate: data.rate, sourceNote: `${data.fallback ? t.fallbackRate : t.liveRate}: ${data.source}` } : current);
    setExchangeMessage(`${data.fallback ? t.fallbackRate : t.liveRate}: 1 USD = ${data.rate.toFixed(4)} MXN`);
  }

  const defaultModel = useMemo(() => policy?.modelCosts.find((model) => model.isDefault) ?? policy?.modelCosts[0], [policy]);
  const absorbedMonthlyEstimate = useMemo(() => {
    if (!policy || !defaultModel) return 0;
    const homeFaq = policy.screenBudgets.find((screen) => screen.screenKey === "home_faq");
    if (!homeFaq) return 0;
    return estimateCostMxn(policy, defaultModel, homeFaq.estimatedInputTokens, homeFaq.estimatedOutputTokens) * 1000;
  }, [defaultModel, policy]);

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6">
        <p className="font-bold text-red-700">{error}</p>
        <Button type="button" onClick={activateDevAdmin} className="mt-4 bg-slate-950 text-white">{t.devLogin}</Button>
      </div>
    );
  }
  if (!policy || !defaultModel) return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-600">{t.loading}</div>;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]"><CircleDollarSign size={15} /> {t.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">{t.description}</p>
        </div>
        <Button type="button" onClick={refreshExchangeRate} className="bg-slate-950 text-white"><RefreshCw size={16} /> {t.refreshRate}</Button>
      </header>

      <AdminControlNav />

      {exchangeMessage ? <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{exchangeMessage}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<TrendingUp />} label={t.exchange} value={`$${policy.usdToMxnRate.toFixed(2)} MXN/USD`} />
        <Metric icon={<CircleDollarSign />} label={t.creditValue} value={formatCurrency(policy.creditValueMxn)} />
        <Metric icon={<Gauge />} label={t.margin} value={`${Math.round(policy.grossMarginPct * 100)}%`} />
        <Metric icon={<MessageSquareText />} label={t.absorbed} value={`${formatCurrency(absorbedMonthlyEstimate)} / 1k FAQs`} />
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">{t.baseline}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {baselinePlans.map((plan) => (
            <article key={plan.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-500">{plan.label}</p>
              <strong className="mt-2 block text-3xl font-black text-[var(--brand-primary)]">{plan.credits.toLocaleString()} creditos</strong>
              <p className="mt-2 text-sm leading-6 text-slate-600">{plan.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">{t.report}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead><tr><Th>{t.date}</Th><Th>{t.user}</Th><Th>{t.movement}</Th><Th>{t.balance}</Th><Th>{t.note}</Th></tr></thead>
            <tbody>
              {reportRows.length ? reportRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <Td>{new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(row.createdAt))}</Td>
                  <Td><strong className="block text-slate-950">{row.userName}</strong><span className="text-xs text-slate-500">{row.userEmail}</span></Td>
                  <Td><strong className={row.amount < 0 ? "text-rose-700" : "text-emerald-700"}>{row.amount} creditos</strong><Pill>{row.type}</Pill></Td>
                  <Td>{row.balanceBefore} -&gt; {row.balanceAfter}</Td>
                  <Td>{row.description}</Td>
                </tr>
              )) : (
                <tr><Td>No hay movimientos recientes.</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950"><Calculator className="text-[var(--brand-primary)]" /> {t.models}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr><Th>Modelo</Th><Th>Input USD / 1M</Th><Th>Output USD / 1M</Th><Th>Uso</Th></tr></thead>
            <tbody>{policy.modelCosts.map((model) => <tr key={model.model} className="border-b border-slate-100 last:border-0"><Td><strong className="text-slate-950">{model.model}</strong>{model.isDefault ? <Pill>default</Pill> : null}</Td><Td>${model.inputUsdPer1m}</Td><Td>${model.outputUsdPer1m}</Td><Td>{model.useCase}</Td></tr>)}</tbody>
          </table>
        </div>
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">{policy.sourceNote}</p>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">{t.screens}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead><tr><Th>{t.screen}</Th><Th>{t.mode}</Th><Th>{t.tokens}</Th><Th>{t.calculated}</Th><Th>{t.min}</Th><Th>{t.recommended}</Th><Th>{t.note}</Th></tr></thead>
            <tbody>
              {policy.screenBudgets.map((screen) => {
                const calculated = estimateCostMxn(policy, defaultModel, screen.estimatedInputTokens, screen.estimatedOutputTokens);
                return (
                  <tr key={screen.screenKey} className="border-b border-slate-100 last:border-0">
                    <Td><strong className="block text-slate-950">{screen.label}</strong><span className="text-xs text-slate-500">{screen.screenKey}</span></Td>
                    <Td><Pill>{t[screen.absorptionMode]}</Pill></Td>
                    <Td>{screen.estimatedInputTokens.toLocaleString()} in / {screen.estimatedOutputTokens.toLocaleString()} out</Td>
                    <Td>{formatCurrency(calculated)}</Td>
                    <Td>{screen.minCredits}</Td>
                    <Td><strong className="text-slate-950">{screen.recommendedCredits}</strong></Td>
                    <Td>{screen.notes}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><span className="inline-flex rounded-2xl bg-[var(--brand-primary-soft)] p-3 text-[var(--brand-primary)]">{icon}</span><p className="mt-4 text-sm font-bold text-slate-500">{label}</p><strong className="mt-1 block text-2xl font-black text-slate-950">{value}</strong></div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-slate-600">{children}</td>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="ml-2 inline-flex rounded-full bg-[var(--brand-primary-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--brand-primary)]">{children}</span>;
}
