"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

type CreatedArtifact = {
  id: string;
  title: string;
  type: string;
  moduleId: string;
  htmlContent?: string;
  creditsCharged: number;
};

type GatewayResult = {
  status: string;
  message: string;
  detectedIntent: string;
  requiredModules: string[];
  missingInputs: string[];
  estimatedCredits: number;
  executionPlan: string[];
  artifactsCreated?: CreatedArtifact[];
  error?: string;
};

export function PromptGatewayClient({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState("Quiero optimizar mi CV para una vacante de gerente comercial y prepararme para entrevista.");
  const [result, setResult] = useState<GatewayResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(execute: boolean) {
    setLoading(true);
    try {
      const response = await fetch(execute ? "/api/ai/execute" : "/api/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, files: [{ id: "demo-cv", fileType: "cv_file", originalName: "CV-demo.pdf" }] }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setResult({
          status: "error",
          message: data.error ?? "No se pudo procesar el prompt.",
          detectedIntent: "request_error",
          requiredModules: [],
          missingInputs: [],
          estimatedCredits: 0,
          executionPlan: [],
          error: data.error,
        });
        return;
      }
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-slate-900 to-blue-950 p-5 shadow-2xl">
      <label className="text-sm font-bold uppercase tracking-[0.3em] text-amber-200">Prompt Gateway</label>
      <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-3 min-h-32 border-white/10 bg-white/95 text-slate-900" placeholder="¿Qué quieres lograr hoy?" />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={loading} onClick={() => submit(false)} className="bg-amber-400 text-slate-950 hover:bg-amber-300">Analizar plan</Button>
        <Button disabled={loading} onClick={() => submit(true)} className="bg-blue-600 hover:bg-blue-500">Ejecutar mock</Button>
      </div>
      {result ? (
        <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-300 px-3 py-1 font-bold text-slate-950">{result.status}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{result.estimatedCredits} créditos</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{result.detectedIntent}</span>
          </div>
          <p className="mt-3 text-slate-100">{result.message}</p>
          {!compact && (
            <>
              <h4 className="mt-4 font-bold text-white">Plan propuesto</h4>
              {result.executionPlan?.length ? (
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-200">{result.executionPlan.map((step) => <li key={step}>{step}</li>)}</ol>
              ) : null}
              {result.error ? <p className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 font-semibold text-red-100">{result.message}</p> : null}
              {result.missingInputs?.length > 0 && <p className="mt-3 text-amber-200">Falta: {result.missingInputs.join(", ")}</p>}
              {result.artifactsCreated?.length ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-white">Reportes creados</h4>
                    <a href="/vault" className="text-xs font-bold text-amber-200 underline-offset-4 hover:underline">Abrir Mi Bóveda</a>
                  </div>
                  {result.artifactsCreated.map((artifact) => (
                    <article key={artifact.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{artifact.type.replaceAll("_", " ")}</p>
                          <h5 className="mt-1 font-black">{artifact.title}</h5>
                        </div>
                        <a href={`/api/artifacts/${artifact.id}/download`} className="rounded-full bg-slate-950 px-3 py-2 text-xs font-extrabold text-white">Descargar HTML</a>
                      </div>
                      {artifact.htmlContent ? (
                        <div className="artifact-report max-h-80 overflow-auto p-4" dangerouslySetInnerHTML={{ __html: artifact.htmlContent }} />
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
