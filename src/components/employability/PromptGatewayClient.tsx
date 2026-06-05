"use client";

import { useState } from "react";
import { Bot, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

type GatewayResult = {
  status: string;
  message: string;
  detectedIntent: string;
  requiredModules: string[];
  missingInputs: string[];
  estimatedCredits: number;
  executionPlan: string[];
  artifactsCreated?: Array<{ id: string; title: string }>;
};

export function PromptGatewayClient({ compact = false, selectedModule }: { compact?: boolean; selectedModule?: string }) {
  const [prompt, setPrompt] = useState("Quiero optimizar mi CV para una vacante y prepararme para entrevista.");
  const [result, setResult] = useState<GatewayResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(execute: boolean) {
    setLoading(true);
    try {
      const response = await fetch(execute ? "/api/ai/execute" : "/api/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, selectedModule, files: [{ id: "demo-cv", fileType: "cv_file", originalName: "CV-demo.pdf" }] }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[var(--brand-border)] bg-gradient-to-br from-white via-white to-[var(--brand-primary-soft)] p-5 shadow-[0_24px_70px_-45px_rgba(109,40,217,0.38)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-primary)]"><Network size={15} /> Gateway orquestador</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Una pregunta, el equipo correcto.</h2>
        </div>
        <Bot className="text-[var(--brand-primary)]" size={32} />
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Describe tu objetivo. El Gateway detectará la intención y combinará uno o más asistentes antes de usar créditos.</p>
      <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-4 min-h-32 border-slate-200 bg-white text-slate-900" placeholder="¿Qué quieres lograr hoy?" />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={loading} onClick={() => submit(false)} className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]"><Sparkles size={16} /> Analizar plan</Button>
        <Button disabled={loading} onClick={() => submit(true)} className="border border-[var(--brand-border)] bg-white text-[var(--brand-primary-strong)] hover:bg-[var(--brand-primary-soft)]">Ejecutar demo</Button>
      </div>
      {result ? (
        <div className="mt-5 rounded-2xl border border-white bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--brand-primary)] px-3 py-1 font-bold text-white">{result.status}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{result.estimatedCredits} créditos</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{result.detectedIntent}</span>
          </div>
          <p className="mt-3">{result.message}</p>
          <p className="mt-3 font-bold text-slate-900">Asistentes: {result.requiredModules?.join(", ")}</p>
          {!compact && (
            <>
              <h4 className="mt-4 font-bold text-slate-950">Plan propuesto</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5">{result.executionPlan?.map((step) => <li key={step}>{step}</li>)}</ol>
              {result.missingInputs?.length > 0 && <p className="mt-3 text-amber-700">Falta: {result.missingInputs.join(", ")}</p>}
              {result.artifactsCreated?.length ? <p className="mt-3 text-emerald-700">Entregables creados: {result.artifactsCreated.length}. Revisa Mi Bóveda.</p> : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
