"use client";

import { useEffect, useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Artifact = {
  id: string;
  type: string;
  title: string;
  description?: string;
  moduleId: string;
  htmlContent?: string;
  creditsCharged: number;
  status: string;
  createdAt: string;
};

const artifactTypes = ["CV optimizado", "Reporte ScoreX", "Comparativo antes/después", "LinkedIn optimizado", "Elevator pitch", "Reporte de entrevista", "Fotos profesionales"];

export function VaultClient() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadArtifacts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/artifacts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar los entregables.");
      setArtifacts(data.artifacts ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los entregables.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadArtifacts();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black">Mi Bóveda / Mis Entregables</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Los entregables generados por el orquestador se guardan con control de usuario, versión, estado y descargas seguras.</p>
        </div>
        <Button onClick={() => void loadArtifacts()} disabled={loading} className="inline-flex items-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]">
          <RefreshCw size={16} /> Actualizar
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {artifactTypes.map((type) => <span key={type} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">{type}</span>)}
      </div>

      <section className="mt-8">
        <div className="mb-5 flex items-center gap-2">
          <FileText size={20} className="text-[var(--brand-primary)]" />
          <h2 className="text-2xl font-black">Artifacts recientes</h2>
        </div>

        {loading ? <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">Cargando entregables...</p> : null}
        {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">{error}</p> : null}
        {!loading && !error && artifacts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            Ejecuta un plan desde Prompt Gateway para crear reportes formateados y verlos aquí.
          </div>
        ) : null}

        <div className="grid gap-5">
          {artifacts.map((artifact) => (
            <article key={artifact.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_-45px_rgba(71,85,105,0.6)]">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-primary)]">{artifact.type.replaceAll("_", " ")}</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">{artifact.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{artifact.description}</p>
                </div>
                <a href={`/api/artifacts/${artifact.id}/download`} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[var(--brand-primary)]">
                  <Download size={16} /> Descargar HTML
                </a>
              </div>
              {artifact.htmlContent ? (
                <div className="artifact-report max-h-[520px] overflow-auto p-5" dangerouslySetInnerHTML={{ __html: artifact.htmlContent }} />
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
