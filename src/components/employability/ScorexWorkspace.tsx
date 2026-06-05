"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Download, FileCheck2, FileUp, Printer, Scale, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

type ScorexPhase = "initial" | "final" | "comparative" | "vacancy";
type CategoryScore = { area: string; score: number; ideal: number; deviation: number; strengths: string[]; improvements: string[] };
type AiReport = { score: number; title: string; executiveSummary: string; html: string; keywords: string[]; findings: string[]; recommendations: string[]; successProbability: string; categories?: CategoryScore[] };
type ScorexRecord = {
  id: string;
  createdAt: string;
  name: string;
  originalCvName: string;
  optimizedCvName?: string;
  vacancyName?: string;
  vacancyText?: string;
  initialScore?: number;
  finalScore?: number;
  vacancyScore?: number;
  activePhase?: ScorexPhase;
  reports?: Partial<Record<ScorexPhase, AiReport>>;
};

const STORAGE_KEY = "empleate-ya-scorex-records";
const SELECTED_KEY = "empleate-ya-scorex-selected";
const phaseLabels: Record<ScorexPhase, string> = { initial: "ScoreX inicial", final: "ScoreX final", comparative: "ScoreX comparativo", vacancy: "Evaluación vs vacante" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function scoreLabel(score?: number) {
  return score === undefined ? "Pendiente" : `${Math.round(score)}%`;
}

export function ScorexWorkspace() {
  const [records, setRecords] = useState<ScorexRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [evaluationName, setEvaluationName] = useState("");
  const [originalCv, setOriginalCv] = useState<File>();
  const [optimizedCv, setOptimizedCv] = useState<File>();
  const [vacancyFile, setVacancyFile] = useState<File>();
  const [vacancyText, setVacancyText] = useState("");
  const [runningPhase, setRunningPhase] = useState<ScorexPhase>();
  const [errorMessage, setErrorMessage] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const storedRecords = JSON.parse(stored) as ScorexRecord[];
    setRecords(storedRecords);
    const previousSelection = window.localStorage.getItem(SELECTED_KEY);
    const selectedStillExists = storedRecords.some((record) => record.id === previousSelection);
    setSelectedId(selectedStillExists ? previousSelection ?? undefined : storedRecords.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.id);
  }, []);

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }, [records]);
  useEffect(() => { if (selectedId) window.localStorage.setItem(SELECTED_KEY, selectedId); }, [selectedId]);

  const selected = records.find((record) => record.id === selectedId);
  const orderedRecords = useMemo(() => records.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)), [records]);

  function createEvaluation() {
    if (!evaluationName.trim() || !originalCv) return;
    const record: ScorexRecord = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), name: evaluationName.trim(), originalCvName: originalCv.name };
    setRecords((current) => [record, ...current]);
    setSelectedId(record.id);
    setEvaluationName("");
  }

  function updateSelected(changes: Partial<ScorexRecord>) {
    if (!selectedId) return;
    setRecords((current) => current.map((record) => record.id === selectedId ? { ...record, ...changes } : record));
  }

  async function runPhase(phase: ScorexPhase) {
    if (!selected) return;
    setErrorMessage("");
    setRunningPhase(phase);
    try {
      const formData = new FormData();
      formData.append("phase", phase);
      formData.append("evaluationName", selected.name);
      formData.append("vacancyText", vacancyText || selected.vacancyText || "");
      formData.append("previousInitial", selected.reports?.initial ? JSON.stringify(selected.reports.initial) : "");
      formData.append("previousFinal", selected.reports?.final ? JSON.stringify(selected.reports.final) : "");
      if (phase === "initial" && originalCv) formData.append("cvFile", originalCv);
      if (phase === "final" && optimizedCv) formData.append("cvFile", optimizedCv);
      if (phase === "vacancy") {
        if (optimizedCv) formData.append("cvFile", optimizedCv);
        else if (originalCv) formData.append("cvFile", originalCv);
        if (vacancyFile) formData.append("vacancyFile", vacancyFile);
      }

      const response = await fetch("/api/scorex/evaluate", { method: "POST", body: formData });
      const report = await response.json() as AiReport & { error?: string };
      if (!response.ok) throw new Error(report.error ?? "No se pudo generar la evaluación con IA.");

      const reports = { ...selected.reports, [phase]: report };
      if (phase === "initial") updateSelected({ initialScore: report.score, activePhase: phase, reports });
      if (phase === "final") updateSelected({ optimizedCvName: optimizedCv?.name, finalScore: report.score, activePhase: phase, reports });
      if (phase === "comparative") updateSelected({ activePhase: phase, reports });
      if (phase === "vacancy") updateSelected({ vacancyName: vacancyFile?.name, vacancyText: vacancyText.trim(), vacancyScore: report.score, activePhase: phase, reports });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error inesperado al evaluar con IA.");
    } finally {
      setRunningPhase(undefined);
    }
  }

  async function selectVacancyFile(file?: File) {
    setVacancyFile(file);
    if (file?.type.startsWith("text/") || (file && /\.txt$/i.test(file.name))) setVacancyText(await file.text());
  }

  function downloadWord() {
    if (!selected || !previewRef.current) return;
    const url = URL.createObjectURL(new Blob([`<html><meta charset="utf-8"><style>${reportStyles}</style><body>${previewRef.current.innerHTML}</body></html>`], { type: "application/msword" }));
    downloadUrl(url, `${selected.name}-${selected.activePhase ?? "scorex"}.doc`);
  }

  function downloadPdf() {
    printPreview();
  }

  function printPreview() {
    if (!previewRef.current) return;
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;
    popup.document.write(`<html><head><title>ScoreX</title><style>body{font-family:Arial;padding:36px;color:#111827}${reportStyles}</style></head><body>${previewRef.current.innerHTML}</body></html>`);
    popup.document.close(); popup.focus(); popup.print();
  }

  return (
    <div className="space-y-7">
      <header><span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--brand-primary)]">Workspace de evaluación</span><h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">ScoreX</h1><p className="mt-3 max-w-4xl text-slate-600">Registra cada evaluación y genera reportes reales con IA para visualizar, imprimir y descargar.</p></header>
      {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

      <section className="rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">Historial de evaluaciones</h2><p className="mt-1 text-sm text-slate-500">Selecciona un registro para continuar sus fases.</p></div><span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary-strong)]">{records.length} registros</span></div>
        <div className="mt-4 max-h-[270px] overflow-auto rounded-2xl border border-slate-200"><table className="min-w-[850px] w-full text-left text-sm"><thead className="sticky top-0 bg-slate-950 text-white"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Nombre de evaluación</th><th className="px-4 py-3">% primera evaluación</th><th className="px-4 py-3">% segunda evaluación</th><th className="px-4 py-3">% evaluación vs vacante</th></tr></thead><tbody>{orderedRecords.map((record) => <tr key={record.id} onClick={() => setSelectedId(record.id)} className={`cursor-pointer border-t border-slate-100 transition hover:bg-violet-50 ${selectedId === record.id ? "bg-[var(--brand-primary-soft)]" : ""}`}><td className="whitespace-nowrap px-4 py-3">{formatDate(record.createdAt)}</td><td className="px-4 py-3 font-bold">{record.name}</td><td className="px-4 py-3">{scoreLabel(record.initialScore)}</td><td className="px-4 py-3">{scoreLabel(record.finalScore)}</td><td className="px-4 py-3">{scoreLabel(record.vacancyScore)}</td></tr>)}{!records.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Todavía no hay evaluaciones. Crea la primera debajo.</td></tr> : null}</tbody></table></div>
      </section>

      <section className="grid gap-5 rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm lg:grid-cols-[1fr_1fr]">
        <div><h2 className="flex items-center gap-2 text-xl font-black"><FileUp size={20} className="text-[var(--brand-primary)]" /> Nueva evaluación</h2><label className="mt-4 block text-sm font-bold text-slate-700">Nombre de la evaluación<Input value={evaluationName} onChange={(event) => setEvaluationName(event.target.value)} className="mt-2" placeholder="Ej. CV Gerencia Comercial 2026" /></label><label className="mt-4 block text-sm font-bold text-slate-700">CV original<Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => setOriginalCv(event.target.files?.[0])} className="mt-2" /></label><Button onClick={createEvaluation} disabled={!evaluationName.trim() || !originalCv} className="mt-4 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]">Registrar archivo y evaluación</Button></div>
        <div><h2 className="flex items-center gap-2 text-xl font-black"><SearchCheck size={20} className="text-[var(--brand-primary)]" /> Evaluación contra vacante</h2><label className="mt-4 block text-sm font-bold text-slate-700">Pega el contenido de la vacante<Textarea value={vacancyText} onChange={(event) => setVacancyText(event.target.value)} className="mt-2 min-h-24" placeholder="Responsabilidades, requisitos y palabras clave..." /></label><label className="mt-3 block text-sm font-bold text-slate-700">O sube TXT, Word o PDF<Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => selectVacancyFile(event.target.files?.[0])} className="mt-2" /></label><Button onClick={() => runPhase("vacancy")} disabled={!selected || runningPhase === "vacancy" || (!vacancyText.trim() && !vacancyFile)} className="mt-4 bg-amber-500 text-slate-950 hover:bg-amber-400">{runningPhase === "vacancy" ? "Evaluando con IA..." : "Evaluar vs vacante"}</Button><p className={`mt-3 text-sm font-bold ${selected && (vacancyText.trim() || vacancyFile) ? "text-emerald-700" : "text-amber-700"}`}>{!selected ? "Selecciona un registro del historial para evaluar la vacante." : vacancyText.trim() || vacancyFile ? `Vacante lista para evaluar${vacancyFile ? `: ${vacancyFile.name}` : "."}` : "Pega el contenido o sube un archivo para habilitar la evaluación."}</p></div>
      </section>

      <section className="rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Fases de ScoreX</h2><p className="mt-1 text-sm text-slate-500">{selected ? `Registro activo: ${selected.name}` : "Selecciona o crea una evaluación para habilitar las fases."}</p><div className="mt-4 grid gap-3 md:grid-cols-3"><Button onClick={() => runPhase("initial")} disabled={!selected || runningPhase === "initial"} className="gap-2 bg-blue-600 text-white hover:bg-blue-500"><BarChart3 size={17} /> {runningPhase === "initial" ? "Evaluando..." : "ScoreX inicial"}</Button><div className="rounded-2xl border border-slate-200 p-3"><Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => setOptimizedCv(event.target.files?.[0])} /><Button onClick={() => runPhase("final")} disabled={!selected || !optimizedCv || runningPhase === "final"} className="mt-2 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-500"><FileCheck2 size={17} /> {runningPhase === "final" ? "Evaluando..." : "ScoreX final"}</Button></div><Button onClick={() => runPhase("comparative")} disabled={!selected?.initialScore || !selected?.finalScore || runningPhase === "comparative"} className="gap-2 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]"><Scale size={17} /> {runningPhase === "comparative" ? "Evaluando..." : "ScoreX comparativo"}</Button></div></section>

      <section className="overflow-hidden rounded-[2rem] border border-[var(--brand-border)] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4"><div><h2 className="text-xl font-black">Preview del reporte</h2><p className="text-xs text-slate-500">Visor de solo lectura. Copiar y pegar está deshabilitado.</p></div><div className="flex flex-wrap gap-2"><Button onClick={downloadWord} disabled={!selected?.activePhase} className="gap-2 bg-blue-600 text-white hover:bg-blue-500"><Download size={16} /> Word</Button><Button onClick={downloadPdf} disabled={!selected?.activePhase} className="gap-2 bg-rose-600 text-white hover:bg-rose-500"><Download size={16} /> PDF</Button><Button onClick={printPreview} disabled={!selected?.activePhase} className="gap-2 bg-slate-800 text-white hover:bg-slate-700"><Printer size={16} /> Imprimir</Button></div></div><style>{reportStyles}</style><div ref={previewRef} onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()} onPaste={(event) => event.preventDefault()} className="scorex-preview min-h-[420px] select-none p-7 text-slate-700">{selected?.activePhase ? <ReportView record={selected} /> : <div className="flex min-h-[360px] items-center justify-center text-center text-slate-400">Ejecuta una fase para visualizar aquí su reporte.</div>}</div></section>
    </div>
  );
}

function ReportView({ record }: { record: ScorexRecord }) {
  const phase = record.activePhase ?? "initial";
  const report = record.reports?.[phase];
  if (report?.html) return <div dangerouslySetInnerHTML={{ __html: report.html }} />;
  return <article><p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">{phaseLabels[phase]}</p><h1 className="mt-2 text-3xl font-black text-slate-950">{record.name}</h1><p className="mt-8 text-slate-500">Ejecuta esta fase para generar un reporte con IA.</p></article>;
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

const reportStyles = `
.scorex-preview .scorex-report{max-width:860px;margin:0 auto;color:#172033;font-family:Arial, sans-serif;line-height:1.55}
.scorex-preview h1{font-size:30px;line-height:1.1;margin:0 0 16px;color:#0066CC;font-weight:900}
.scorex-preview h2{margin:30px 0 10px;color:#0066CC;font-size:18px;font-weight:900;letter-spacing:.02em}
.scorex-preview h3{margin:16px 0 6px;color:#0066CC;font-size:14px;font-weight:900}
.scorex-preview ul{margin:8px 0 16px;padding-left:22px}
.scorex-preview li{margin:6px 0}
.scorex-preview .ey-kicker{font-size:12px;text-transform:uppercase;letter-spacing:.22em;color:#0066CC;font-weight:900}
.scorex-preview .scorex-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;background:#f8f5ff;border:1px solid #e9d5ff;border-radius:18px;padding:16px;margin:14px 0}
.scorex-preview .scorex-meta p{margin:0}
.scorex-preview .scorex-global{display:flex;align-items:center;justify-content:space-between;border-radius:20px;background:#0066CC;color:white;padding:18px 22px;margin:18px 0}
.scorex-preview .scorex-global span{text-transform:uppercase;letter-spacing:.16em;font-size:12px;font-weight:800}
.scorex-preview .scorex-global strong{font-size:42px;line-height:1}
.scorex-preview .scorex-summary{font-size:16px;color:#334155}
.scorex-preview .scorex-section{border-top:1px solid #ede9fe;padding-top:12px}
.scorex-preview .scorex-table{width:100%;border-collapse:collapse;margin:12px 0 22px;font-size:14px}
.scorex-preview .scorex-table th{background:#0066CC;color:white;text-align:left;padding:12px}
.scorex-preview .scorex-table td{border:1px solid #e5e7eb;padding:11px}
.scorex-preview .scorex-table tr:nth-child(even) td{background:#faf5ff}
.scorex-preview .scorex-radar{display:block;width:100%;max-width:560px;margin:8px auto 22px;border:1px solid #dbeafe;border-radius:20px;background:#fff}
`;
