"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { BarChart3, Download, FileCheck2, FileUp, Printer, Scale, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ScorexPhase = "initial" | "final" | "comparative" | "vacancy";
type ScorexWorkspaceTab = "new" | "vacancy";
type ScorexProcessPhase = Exclude<ScorexPhase, "vacancy">;
type ReportLanguage = "es" | "en";
type VacancyCvTarget = "original" | "optimized";
type CategoryScore = { area: string; score: number; ideal: number; deviation: number; strengths: string[]; improvements: string[] };
type VacancyComparison = { originalProbability: number; optimizedProbability: number };
type AiReport = { score: number; title: string; executiveSummary: string; html: string; keywords: string[]; findings: string[]; recommendations: string[]; successProbability: string; categories?: CategoryScore[]; vacancyComparison?: VacancyComparison };
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
  vacancyOriginalScore?: number;
  vacancyOptimizedScore?: number;
  activePhase?: ScorexPhase;
  reports?: Partial<Record<ScorexPhase, AiReport>>;
};

const STORAGE_KEY = "empleate-ya-scorex-records";
const SELECTED_KEY = "empleate-ya-scorex-selected";
const scorexCopy = {
  es: {
    language: "Idioma",
    ariaReports: "Redactar reportes en",
    pending: "Pendiente",
    evaluating: "Evaluando...",
    workspaceEyebrow: "Workspace de evaluación",
    intro: "Registra cada evaluación y genera reportes reales con IA para visualizar, imprimir y descargar.",
    historyTitle: "Historial de evaluaciones",
    historyHelp: "Selecciona un registro para continuar sus fases.",
    records: "registros",
    date: "Fecha",
    name: "Nombre de evaluación",
    firstScore: "% primera evaluación",
    secondScore: "% segunda evaluación",
    vacancyScore: "% evaluación vs vacante",
    emptyHistory: "Todavía no hay evaluaciones. Crea la primera debajo.",
    newTab: "Nueva evaluación",
    newTabHelp: "CV y fases ScoreX",
    vacancyTab: "Evaluación contra vacante",
    vacancyTabHelp: "Solo vacante",
    evaluationName: "Nombre de la evaluación",
    evaluationPlaceholder: "Ej. CV Gerencia Comercial 2026",
    originalCv: "CV original",
    register: "Registrar archivo y evaluación",
    vacancyLanguageHelp: "El idioma elegido se aplicará al reporte contra vacante.",
    vacancyContent: "Pega el contenido de la vacante",
    vacancyPlaceholder: "Responsabilidades, requisitos y palabras clave...",
    vacancyHint: "Elige qué CV evaluar desde la gráfica inferior: original, optimizado o ambos.",
    uploadVacancy: "O sube TXT, Word o PDF",
    selectRecord: "Selecciona un registro del historial para evaluar la vacante.",
    vacancyReady: "Vacante lista para evaluar",
    enableVacancy: "Pega el contenido o sube un archivo para habilitar la evaluación.",
    phasesTitle: "Fases de ScoreX",
    activeRecord: "Registro activo",
    enablePhases: "Selecciona o crea una evaluación para habilitar las fases.",
    initialLabel: "ScoreX inicial",
    initialHelp: "Primera lectura del CV original.",
    finalLabel: "ScoreX final",
    finalHelp: "Evalúa el CV optimizado.",
    comparativeLabel: "ScoreX comparativo",
    comparativeReady: "Listo",
    comparativeHelp: "Compara el antes y después.",
    optimizedCv: "CV optimizado",
    previewReport: "Preview del reporte",
    previewVacancy: "Preview de evaluación contra vacante",
    emptyReport: "Ejecuta una fase para visualizar aquí su reporte.",
    emptyVacancy: "Evalúa contra una vacante para visualizar aquí su reporte.",
    runInitial: "Ejecutar ScoreX inicial",
    runFinal: "Ejecutar ScoreX final",
    runComparative: "Generar comparativo",
    readonly: "Visor de solo lectura con desplazamiento horizontal y vertical.",
    print: "Imprimir",
    vacancyChart: "Probabilidad contra vacante",
    vacancyChartHelp: "Comparación entre el CV original y el CV optimizado para apoyar la decisión.",
    lastOptimized: "Última selección: CV optimizado",
    lastOriginal: "Última selección: CV original",
    originalHelper: "Usado en ScoreX inicial",
    optimizedHelper: "Usado en ScoreX final",
    evaluateVacancy: "Evaluar vs vacante",
    firstBarHelp: "Ejecuta una evaluación contra vacante para desplegar la primera barra.",
    chartDisabledHelp: "Selecciona un registro y pega o sube la vacante para habilitar los botones.",
    noAiReport: "Ejecuta esta fase para generar un reporte con IA.",
    aiError: "No se pudo generar la evaluación con IA.",
    unexpectedError: "Error inesperado al evaluar con IA.",
    chartConversionError: "No se pudo convertir la gráfica para Word.",
  },
  en: {
    language: "Language",
    ariaReports: "Write reports in",
    pending: "Pending",
    evaluating: "Evaluating...",
    workspaceEyebrow: "Evaluation workspace",
    intro: "Register each evaluation and generate real AI reports to view, print, and download.",
    historyTitle: "Evaluation history",
    historyHelp: "Select a record to continue its phases.",
    records: "records",
    date: "Date",
    name: "Evaluation name",
    firstScore: "% first evaluation",
    secondScore: "% second evaluation",
    vacancyScore: "% job fit evaluation",
    emptyHistory: "There are no evaluations yet. Create the first one below.",
    newTab: "New evaluation",
    newTabHelp: "Resume and ScoreX phases",
    vacancyTab: "Job fit evaluation",
    vacancyTabHelp: "Job posting only",
    evaluationName: "Evaluation name",
    evaluationPlaceholder: "Ex. Commercial Management Resume 2026",
    originalCv: "Original resume",
    register: "Register file and evaluation",
    vacancyLanguageHelp: "The selected language will apply to the job fit report.",
    vacancyContent: "Paste the job posting content",
    vacancyPlaceholder: "Responsibilities, requirements, and keywords...",
    vacancyHint: "Choose which resume to evaluate from the chart below: original, optimized, or both.",
    uploadVacancy: "Or upload TXT, Word, or PDF",
    selectRecord: "Select a history record to evaluate the job posting.",
    vacancyReady: "Job posting ready to evaluate",
    enableVacancy: "Paste the content or upload a file to enable the evaluation.",
    phasesTitle: "ScoreX phases",
    activeRecord: "Active record",
    enablePhases: "Select or create an evaluation to enable the phases.",
    initialLabel: "Initial ScoreX",
    initialHelp: "First review of the original resume.",
    finalLabel: "Final ScoreX",
    finalHelp: "Evaluate the optimized resume.",
    comparativeLabel: "Comparative ScoreX",
    comparativeReady: "Ready",
    comparativeHelp: "Compare before and after.",
    optimizedCv: "Optimized resume",
    previewReport: "Report preview",
    previewVacancy: "Job fit evaluation preview",
    emptyReport: "Run a phase to view its report here.",
    emptyVacancy: "Evaluate against a job posting to view the report here.",
    runInitial: "Run Initial ScoreX",
    runFinal: "Run Final ScoreX",
    runComparative: "Generate comparison",
    readonly: "Read-only viewer with horizontal and vertical scrolling.",
    print: "Print",
    vacancyChart: "Job fit probability",
    vacancyChartHelp: "Comparison between the original resume and optimized resume to support the decision.",
    lastOptimized: "Last selection: optimized resume",
    lastOriginal: "Last selection: original resume",
    originalHelper: "Used in Initial ScoreX",
    optimizedHelper: "Used in Final ScoreX",
    evaluateVacancy: "Evaluate vs job",
    firstBarHelp: "Run a job fit evaluation to display the first bar.",
    chartDisabledHelp: "Select a record and paste or upload the job posting to enable the buttons.",
    noAiReport: "Run this phase to generate an AI report.",
    aiError: "The AI evaluation could not be generated.",
    unexpectedError: "Unexpected error while evaluating with AI.",
    chartConversionError: "The chart could not be converted for Word.",
  },
} as const;

type ScorexCopy = (typeof scorexCopy)[ReportLanguage];

const phaseLabels: Record<ReportLanguage, Record<ScorexPhase, string>> = {
  es: { initial: "ScoreX inicial", final: "ScoreX final", comparative: "ScoreX comparativo", vacancy: "Evaluación vs vacante" },
  en: { initial: "Initial ScoreX", final: "Final ScoreX", comparative: "Comparative ScoreX", vacancy: "Job fit evaluation" },
};
const languageOptions: Array<{ value: ReportLanguage; label: string; flagClass: string }> = [
  { value: "es", label: "Español", flagClass: "fi fi-mx" },
  { value: "en", label: "English", flagClass: "fi fi-us" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function scoreLabel(score: number | undefined, pendingLabel: string) {
  return score === undefined ? pendingLabel : `${Math.round(score)}%`;
}

function LanguageSelector({ value, label, ariaPrefix, onChange }: { value: ReportLanguage; label: string; ariaPrefix: string; onChange: (language: ReportLanguage) => void }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {languageOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-black transition ${value === option.value ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-slate-600 hover:bg-[var(--brand-primary-soft)]"}`}
            aria-pressed={value === option.value}
            aria-label={`${ariaPrefix} ${option.label}`}
            title={option.label}
          >
            <span aria-hidden="true" className={`${option.flagClass} rounded-[3px] shadow-sm`} />
            {option.value.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScorexWorkspace() {
  const { language: appLanguage, setLanguage: setAppLanguage } = useLanguage();
  const t = scorexCopy[appLanguage];
  const [records, setRecords] = useState<ScorexRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [evaluationName, setEvaluationName] = useState("");
  const [originalCv, setOriginalCv] = useState<File>();
  const [optimizedCv, setOptimizedCv] = useState<File>();
  const [vacancyFile, setVacancyFile] = useState<File>();
  const [vacancyText, setVacancyText] = useState("");
  const [vacancyCvTarget, setVacancyCvTarget] = useState<VacancyCvTarget>("optimized");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<ScorexWorkspaceTab>("new");
  const [activeProcessPhase, setActiveProcessPhase] = useState<ScorexProcessPhase>("initial");
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>(appLanguage);
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
  useEffect(() => { setReportLanguage(appLanguage); }, [appLanguage]);

  const selected = records.find((record) => record.id === selectedId);
  const orderedRecords = useMemo(() => records.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)), [records]);
  const visiblePhase: ScorexPhase | undefined = activeWorkspaceTab === "vacancy" ? "vacancy" : activeProcessPhase;
  const visibleReport = visiblePhase ? selected?.reports?.[visiblePhase] : undefined;
  const previewTitle = activeWorkspaceTab === "vacancy" ? t.previewVacancy : t.previewReport;
  const previewEmptyMessage = activeWorkspaceTab === "vacancy" ? t.emptyVacancy : t.emptyReport;

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

  async function runPhase(phase: ScorexPhase, vacancyTarget: VacancyCvTarget = vacancyCvTarget) {
    if (!selected) return;
    setErrorMessage("");
    setRunningPhase(phase);
    try {
      const formData = new FormData();
      formData.append("phase", phase);
      formData.append("language", reportLanguage);
      formData.append("evaluationName", selected.name);
      formData.append("vacancyCvTarget", vacancyTarget);
      formData.append("vacancyText", vacancyText || selected.vacancyText || "");
      formData.append("previousInitial", selected.reports?.initial ? JSON.stringify(selected.reports.initial) : "");
      formData.append("previousFinal", selected.reports?.final ? JSON.stringify(selected.reports.final) : "");
      if (phase === "initial" && originalCv) formData.append("cvFile", originalCv);
      if (phase === "final" && optimizedCv) formData.append("cvFile", optimizedCv);
      if (phase === "vacancy") {
        const selectedCvFile = vacancyTarget === "optimized" ? optimizedCv : originalCv;
        if (selectedCvFile) formData.append("cvFile", selectedCvFile);
        if (vacancyFile) formData.append("vacancyFile", vacancyFile);
      }

      const response = await fetch("/api/scorex/evaluate", { method: "POST", body: formData });
      const report = await response.json() as AiReport & { error?: string };
      if (!response.ok) throw new Error(report.error ?? t.aiError);

      const reports = { ...selected.reports, [phase]: report };
      if (phase === "initial") updateSelected({ initialScore: report.score, activePhase: phase, reports });
      if (phase === "final") updateSelected({ optimizedCvName: optimizedCv?.name, finalScore: report.score, activePhase: phase, reports });
      if (phase === "comparative") updateSelected({ activePhase: phase, reports });
      if (phase === "vacancy") {
        const comparisonScore = vacancyTarget === "optimized" ? report.vacancyComparison?.optimizedProbability : report.vacancyComparison?.originalProbability;
        updateSelected({
          vacancyName: vacancyFile?.name,
          vacancyText: vacancyText.trim(),
          vacancyScore: comparisonScore ?? report.score,
          vacancyOriginalScore: vacancyTarget === "original" ? comparisonScore ?? report.score : selected.vacancyOriginalScore,
          vacancyOptimizedScore: vacancyTarget === "optimized" ? comparisonScore ?? report.score : selected.vacancyOptimizedScore,
          activePhase: phase,
          reports,
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.unexpectedError);
    } finally {
      setRunningPhase(undefined);
    }
  }

  async function selectVacancyFile(file?: File) {
    setVacancyFile(file);
    if (file?.type.startsWith("text/") || (file && /\.txt$/i.test(file.name))) setVacancyText(await file.text());
  }

  async function downloadWord() {
    if (!selected || !previewRef.current) return;
    const url = URL.createObjectURL(new Blob([await buildWordExportHtml(previewRef.current, selected.name)], { type: "application/msword" }));
    downloadUrl(url, `${selected.name}-${visiblePhase ?? "scorex"}.doc`);
  }

  function downloadPdf() {
    printPreview();
  }

  function printPreview() {
    if (!previewRef.current) return;
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;
    popup.document.write(buildPrintExportHtml(previewRef.current, "ScoreX"));
    popup.document.close(); popup.focus(); popup.print();
  }

  const phaseActionButton = activeProcessPhase === "initial" ? (
    <Button onClick={() => runPhase("initial")} disabled={!selected || runningPhase === "initial"} className="gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-500"><BarChart3 size={16} /> {runningPhase === "initial" ? t.evaluating : t.runInitial}</Button>
  ) : activeProcessPhase === "final" ? (
    <Button onClick={() => runPhase("final")} disabled={!selected || runningPhase === "final"} className="gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-500"><FileCheck2 size={16} /> {runningPhase === "final" ? t.evaluating : t.runFinal}</Button>
  ) : (
    <Button onClick={() => runPhase("comparative")} disabled={!selected?.initialScore || !selected?.finalScore || runningPhase === "comparative"} className="gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-white shadow-sm hover:bg-[var(--brand-primary-strong)]"><Scale size={16} /> {runningPhase === "comparative" ? t.evaluating : t.runComparative}</Button>
  );

  const canEvaluateVacancy = Boolean(selected && (vacancyText.trim() || vacancyFile));

  return (
    <div className="space-y-7">
      <header><span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.workspaceEyebrow}</span><h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">ScoreX</h1><p className="mt-3 max-w-4xl text-slate-600">{t.intro}</p></header>
      {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

      <section className="rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">{t.historyTitle}</h2><p className="mt-1 text-sm text-slate-500">{t.historyHelp}</p></div><span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary-strong)]">{records.length} {t.records}</span></div>
        <div className="mt-4 max-h-[270px] overflow-auto rounded-2xl border border-slate-200"><table className="min-w-[850px] w-full text-left text-sm"><thead className="sticky top-0 bg-slate-950 text-white"><tr><th className="px-4 py-3">{t.date}</th><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.firstScore}</th><th className="px-4 py-3">{t.secondScore}</th><th className="px-4 py-3">{t.vacancyScore}</th></tr></thead><tbody>{orderedRecords.map((record) => <tr key={record.id} onClick={() => setSelectedId(record.id)} className={`cursor-pointer border-t border-slate-100 transition hover:bg-violet-50 ${selectedId === record.id ? "bg-[var(--brand-primary-soft)]" : ""}`}><td className="whitespace-nowrap px-4 py-3">{formatDate(record.createdAt)}</td><td className="px-4 py-3 font-bold">{record.name}</td><td className="px-4 py-3">{scoreLabel(record.initialScore, t.pending)}</td><td className="px-4 py-3">{scoreLabel(record.finalScore, t.pending)}</td><td className="px-4 py-3">{scoreLabel(record.vacancyScore, t.pending)}</td></tr>)}{!records.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">{t.emptyHistory}</td></tr> : null}</tbody></table></div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm lg:grid-cols-[280px_1fr]">
        <div className="grid content-start gap-3">
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab("new")}
            className={`flex min-h-20 flex-col items-start justify-center rounded-2xl border px-4 py-4 text-left transition ${activeWorkspaceTab === "new" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-shadow)]" : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-border)] hover:bg-[var(--brand-primary-soft)]"}`}
          >
            <span className="flex items-center gap-2 font-black"><FileUp size={18} /> {t.newTab}</span>
            <span className={`mt-1 text-xs font-bold ${activeWorkspaceTab === "new" ? "text-white/80" : "text-slate-500"}`}>{t.newTabHelp}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab("vacancy")}
            className={`flex min-h-20 flex-col items-start justify-center rounded-2xl border px-4 py-4 text-left transition ${activeWorkspaceTab === "vacancy" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-shadow)]" : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-border)] hover:bg-[var(--brand-primary-soft)]"}`}
          >
            <span className="flex items-center gap-2 font-black"><SearchCheck size={18} /> {t.vacancyTab}</span>
            <span className={`mt-1 text-xs font-bold ${activeWorkspaceTab === "vacancy" ? "text-white/80" : "text-slate-500"}`}>{t.vacancyTabHelp}</span>
          </button>
        </div>

        {activeWorkspaceTab === "new" ? (
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-xl font-black"><FileUp size={20} className="text-[var(--brand-primary)]" /> {t.newTab}</h2>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <label className="block text-sm font-bold text-slate-700">{t.evaluationName}<Input value={evaluationName} onChange={(event) => setEvaluationName(event.target.value)} className="mt-2" placeholder={t.evaluationPlaceholder} /></label>
              <label className="block text-sm font-bold text-slate-700">{t.originalCv}<Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => setOriginalCv(event.target.files?.[0])} className="mt-2" /></label>
            </div>
            <Button onClick={createEvaluation} disabled={!evaluationName.trim() || !originalCv} className="mt-4 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]">{t.register}</Button>
          </div>
        ) : (
          <div className="grid min-w-0 gap-5">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-black"><SearchCheck size={20} className="text-[var(--brand-primary)]" /> {t.vacancyTab}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t.vacancyLanguageHelp}</p>
                </div>
                <LanguageSelector value={reportLanguage} label={t.language} ariaPrefix={t.ariaReports} onChange={(nextLanguage) => { setReportLanguage(nextLanguage); setAppLanguage(nextLanguage); }} />
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <label className="block text-sm font-bold text-slate-700">{t.vacancyContent}<Textarea value={vacancyText} onChange={(event) => setVacancyText(event.target.value)} className="mt-2 min-h-56 bg-white" placeholder={t.vacancyPlaceholder} /></label>
                <div className="grid content-start gap-4">
                  <p className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600">{t.vacancyHint}</p>
                  <label className="block text-sm font-bold text-slate-700">{t.uploadVacancy}<Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => selectVacancyFile(event.target.files?.[0])} className="mt-2 bg-white" /></label>
                </div>
              </div>
              <p className={`mt-3 text-sm font-bold ${selected && (vacancyText.trim() || vacancyFile) ? "text-emerald-700" : "text-amber-700"}`}>{!selected ? t.selectRecord : vacancyText.trim() || vacancyFile ? `${t.vacancyReady}${vacancyFile ? `: ${vacancyFile.name}` : "."}` : t.enableVacancy}</p>
            </div>
            <VacancyComparisonChart
              copy={t}
              originalScore={selected?.vacancyOriginalScore}
              optimizedScore={selected?.vacancyOptimizedScore}
              selectedTarget={vacancyCvTarget}
              runningTarget={runningPhase === "vacancy" ? vacancyCvTarget : undefined}
              canEvaluate={canEvaluateVacancy}
              onEvaluate={(target) => {
                setVacancyCvTarget(target);
                void runPhase("vacancy", target);
              }}
            />
            <PreviewPanel
              previewRef={previewRef}
              title={previewTitle}
              emptyMessage={previewEmptyMessage}
              selected={selected}
              phase={visiblePhase}
              hasReport={Boolean(visibleReport)}
              copy={t}
              reportLanguage={reportLanguage}
              onDownloadWord={() => void downloadWord()}
              onDownloadPdf={downloadPdf}
              onPrint={printPreview}
            />
          </div>
        )}
      </section>

      {activeWorkspaceTab === "new" ? (
        <section className="grid gap-6 rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm lg:grid-cols-[280px_1fr]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{t.phasesTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected ? `${t.activeRecord}: ${selected.name}` : t.enablePhases}</p>
              </div>
              <LanguageSelector value={reportLanguage} label={t.language} ariaPrefix={t.ariaReports} onChange={(nextLanguage) => { setReportLanguage(nextLanguage); setAppLanguage(nextLanguage); }} />
            </div>
            <div className="mt-4 grid gap-3">
              {([
                ["initial", BarChart3, t.initialLabel, scoreLabel(selected?.initialScore, t.pending), t.initialHelp],
                ["final", FileCheck2, t.finalLabel, scoreLabel(selected?.finalScore, t.pending), t.finalHelp],
                ["comparative", Scale, t.comparativeLabel, selected?.reports?.comparative ? t.comparativeReady : t.pending, t.comparativeHelp],
              ] as const).map(([phase, Icon, label, status, description]) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => setActiveProcessPhase(phase)}
                  className={`min-h-24 rounded-2xl border px-4 py-4 text-left transition ${activeProcessPhase === phase ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-shadow)]" : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-border)] hover:bg-[var(--brand-primary-soft)]"}`}
                >
                  <span className="flex items-center gap-2 font-black"><Icon size={18} /> {label}</span>
                  <span className={`mt-1 block text-xs font-bold ${activeProcessPhase === phase ? "text-white/80" : "text-slate-500"}`}>{status}</span>
                  <span className={`mt-2 block text-xs ${activeProcessPhase === phase ? "text-white/75" : "text-slate-500"}`}>{description}</span>
                </button>
              ))}
            </div>
          </div>

            <PreviewPanel
              previewRef={previewRef}
              title={previewTitle}
              emptyMessage={previewEmptyMessage}
              selected={selected}
              phase={visiblePhase}
              hasReport={Boolean(visibleReport)}
              copy={t}
              reportLanguage={reportLanguage}
              actionButton={phaseActionButton}
              toolbar={activeProcessPhase === "final" ? (
                <label className="block rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700">{t.optimizedCv}<Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => setOptimizedCv(event.target.files?.[0])} className="mt-2 bg-white" /></label>
              ) : undefined}
              onDownloadWord={() => void downloadWord()}
              onDownloadPdf={downloadPdf}
              onPrint={printPreview}
            />
        </section>
      ) : null}
    </div>
  );
}

function PreviewPanel({ previewRef, title, emptyMessage, selected, phase, hasReport, copy, reportLanguage, actionButton, toolbar, onDownloadWord, onDownloadPdf, onPrint }: { previewRef: RefObject<HTMLDivElement | null>; title: string; emptyMessage: string; selected?: ScorexRecord; phase?: ScorexPhase; hasReport: boolean; copy: ScorexCopy; reportLanguage: ReportLanguage; actionButton?: ReactNode; toolbar?: ReactNode; onDownloadWord: () => void; onDownloadPdf: () => void; onPrint: () => void }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-xs text-slate-500">{copy.readonly}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actionButton}
          <Button onClick={onDownloadWord} disabled={!hasReport} className="gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-500"><Download size={16} /> Word</Button>
          <Button onClick={onDownloadPdf} disabled={!hasReport} className="gap-2 rounded-full bg-rose-600 px-4 py-2 text-white shadow-sm hover:bg-rose-500"><Download size={16} /> PDF</Button>
          <Button onClick={onPrint} disabled={!hasReport} className="gap-2 rounded-full bg-slate-800 px-4 py-2 text-white shadow-sm hover:bg-slate-700"><Printer size={16} /> {copy.print}</Button>
        </div>
      </div>
      {toolbar ? <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">{toolbar}</div> : null}
      <style>{reportStyles}</style>
      <div className="max-h-[520px] min-h-[360px] overflow-auto overscroll-contain">
        <div ref={previewRef} onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()} onPaste={(event) => event.preventDefault()} className="scorex-preview min-w-[760px] select-none p-6 text-slate-700 md:min-w-[820px]">
          {selected && phase ? <ReportView record={selected} phase={phase} copy={copy} reportLanguage={reportLanguage} /> : <div className="flex min-h-[320px] items-center justify-center text-center text-slate-400">{emptyMessage}</div>}
        </div>
      </div>
    </section>
  );
}

function VacancyComparisonChart({ copy, originalScore, optimizedScore, selectedTarget, runningTarget, canEvaluate, onEvaluate }: { copy: ScorexCopy; originalScore?: number; optimizedScore?: number; selectedTarget: VacancyCvTarget; runningTarget?: VacancyCvTarget; canEvaluate: boolean; onEvaluate: (target: VacancyCvTarget) => void }) {
  const rows = [
    { key: "original", label: copy.originalCv, helper: copy.originalHelper, value: originalScore, color: "bg-blue-600" },
    { key: "optimized", label: copy.optimizedCv, helper: copy.optimizedHelper, value: optimizedScore, color: "bg-emerald-600" },
  ] as const;
  const hasAnyScore = originalScore !== undefined || optimizedScore !== undefined;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{copy.vacancyChart}</h3>
          <p className="mt-1 text-sm text-slate-500">{copy.vacancyChartHelp}</p>
        </div>
        <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--brand-primary-strong)]">{selectedTarget === "optimized" ? copy.lastOptimized : copy.lastOriginal}</span>
      </div>
      <div className="mt-5 grid gap-4">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <span className="font-black text-slate-800">{row.label}</span>
                <span className="ml-2 text-xs font-semibold text-slate-500">{row.helper}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-[var(--brand-primary)]">{row.value !== undefined ? `${Math.round(row.value)}%` : copy.pending}</span>
                <Button
                  onClick={() => onEvaluate(row.key)}
                  disabled={!canEvaluate || runningTarget !== undefined}
                  className="gap-2 rounded-full bg-amber-500 px-3 py-2 text-xs text-slate-950 shadow-sm hover:bg-amber-400"
                >
                  <SearchCheck size={14} />
                  {runningTarget === row.key ? copy.evaluating : copy.evaluateVacancy}
                </Button>
              </div>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${row.color} transition-all`} style={{ width: row.value !== undefined ? `${Math.round(row.value)}%` : "0%" }} />
            </div>
          </div>
        ))}
      </div>
      {!hasAnyScore ? <p className="mt-4 text-sm font-semibold text-amber-700">{copy.firstBarHelp}</p> : null}
      {!canEvaluate ? <p className="mt-2 text-sm font-semibold text-amber-700">{copy.chartDisabledHelp}</p> : null}
    </section>
  );
}

function ReportView({ record, phase, copy, reportLanguage }: { record: ScorexRecord; phase: ScorexPhase; copy: ScorexCopy; reportLanguage: ReportLanguage }) {
  const report = record.reports?.[phase];
  if (report?.html) return <div dangerouslySetInnerHTML={{ __html: report.html }} />;
  return <article><p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">{phaseLabels[reportLanguage][phase]}</p><h1 className="mt-2 text-3xl font-black text-slate-950">{record.name}</h1><p className="mt-8 text-slate-500">{copy.noAiReport}</p></article>;
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

function buildPrintExportHtml(source: HTMLDivElement, title: string) {
  const content = source.cloneNode(true) as HTMLDivElement;
  content.querySelectorAll("svg.scorex-radar").forEach((svg) => {
    const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) ?? [0, 0, 560, 560];
    const viewBoxWidth = viewBox[2] || 560;
    const viewBoxHeight = viewBox[3] || viewBoxWidth;
    const width = 560;
    const height = Math.round(width * viewBoxHeight / viewBoxWidth);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("style", `display:block;width:${width}px;height:${height}px;max-width:100%;margin:8px auto 22px;border:1px solid #dbeafe;border-radius:20px;background:#ffffff;`);
  });
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeExportHtml(title)}</title><style>${exportDocumentStyles}${reportStyles}</style></head><body><main class="scorex-preview">${content.innerHTML}</main></body></html>`;
}

async function buildWordExportHtml(source: HTMLDivElement, title: string) {
  const content = source.cloneNode(true) as HTMLDivElement;
  inlineWordStyles(content);
  await replaceRadarSvgsWithImages(content);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeExportHtml(title)}</title><style>${wordDocumentStyles}${reportStyles}</style></head><body><main class="scorex-preview">${content.innerHTML}</main></body></html>`;
}

function inlineWordStyles(content: HTMLElement) {
  content.querySelectorAll("h1").forEach((node) => node.setAttribute("style", "color:#0066CC;font-size:30px;line-height:1.1;margin:0 0 16px;font-weight:900;"));
  content.querySelectorAll("h2").forEach((node) => node.setAttribute("style", "color:#0066CC;font-size:18px;margin:30px 0 10px;font-weight:900;"));
  content.querySelectorAll("h3").forEach((node) => node.setAttribute("style", "color:#0066CC;font-size:14px;margin:16px 0 6px;font-weight:900;"));
  content.querySelectorAll("strong,b").forEach((node) => node.setAttribute("style", "color:#0066CC;font-weight:900;"));
  content.querySelectorAll(".ey-kicker").forEach((node) => node.setAttribute("style", "font-size:12px;text-transform:uppercase;letter-spacing:.22em;color:#0066CC;font-weight:900;"));
  content.querySelectorAll(".scorex-global span,.scorex-global strong").forEach((node) => node.setAttribute("style", "color:#ffffff;font-weight:900;"));
  content.querySelectorAll(".scorex-table th").forEach((node) => node.setAttribute("style", "background:#0066CC;color:#ffffff;text-align:left;padding:12px;"));
}

async function replaceRadarSvgsWithImages(content: HTMLElement) {
  const svgs = Array.from(content.querySelectorAll<SVGSVGElement>("svg.scorex-radar"));
  for (const svg of svgs) {
    const image = document.createElement("img");
    image.src = await svgToPngDataUrl(svg);
    image.alt = svg.getAttribute("aria-label") ?? "Gráfica radial comparativa";
    image.width = 560;
    image.height = Math.round(560 * getSvgAspectRatio(svg));
    image.setAttribute("style", `display:block;width:560px;height:${image.height}px;max-width:100%;margin:8px auto 22px;border:1px solid #dbeafe;border-radius:20px;background:#ffffff;`);
    svg.replaceWith(image);
  }
}

function getSvgAspectRatio(svg: SVGSVGElement) {
  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) ?? [0, 0, 360, 360];
  return (viewBox[3] || 360) / (viewBox[2] || 360);
}

async function svgToPngDataUrl(svg: SVGSVGElement) {
  const serializedSvg = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const image = await loadImage(svgUrl);
    const width = 1120;
    const height = Math.round(width * getSvgAspectRatio(svg));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo convertir la gráfica para Word."));
    image.src = src;
  });
}

function escapeExportHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

const exportDocumentStyles = `
body{margin:0;background:#ffffff;color:#172033;font-family:Arial, sans-serif;padding:32px;}
.scorex-preview{max-width:900px;margin:0 auto;color:#172033;font-family:Arial, sans-serif;line-height:1.55;}
.scorex-preview h1,.scorex-preview h2,.scorex-preview h3,.scorex-preview h4,.scorex-preview h5,.scorex-preview h6{color:#0066CC !important;font-weight:900;}
.scorex-preview strong,.scorex-preview b,.scorex-preview dt,.scorex-preview dd{color:#0066CC !important;font-weight:900;}
.scorex-preview .scorex-global span,.scorex-preview .scorex-global strong{color:#ffffff !important;}
`;

const wordDocumentStyles = `
body{margin:0;background:#ffffff;color:#172033;font-family:Arial, sans-serif;padding:32px;}
.scorex-preview{max-width:900px;margin:0 auto;color:#172033;font-family:Arial, sans-serif;line-height:1.55;}
.scorex-preview h1,.scorex-preview h2,.scorex-preview h3,.scorex-preview h4,.scorex-preview h5,.scorex-preview h6{color:#0066CC;font-weight:900;}
.scorex-preview strong,.scorex-preview b{color:#0066CC;font-weight:900;}
.scorex-preview img{display:block;}
`;

const reportStyles = `
.scorex-preview .scorex-report{max-width:860px;margin:0 auto;color:#172033;font-family:Arial, sans-serif;line-height:1.55}
.scorex-preview h1{font-size:30px;line-height:1.1;margin:0 0 16px;color:#0066CC !important;font-weight:900}
.scorex-preview h2{margin:30px 0 10px;color:#0066CC !important;font-size:18px;font-weight:900;letter-spacing:.02em}
.scorex-preview h3{margin:16px 0 6px;color:#0066CC !important;font-size:14px;font-weight:900}
.scorex-preview strong,.scorex-preview b{color:#0066CC !important;font-weight:900}
.scorex-preview ul{margin:8px 0 16px;padding-left:22px}
.scorex-preview li{margin:6px 0}
.scorex-preview .ey-kicker{font-size:12px;text-transform:uppercase;letter-spacing:.22em;color:#0066CC !important;font-weight:900}
.scorex-preview .scorex-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;background:#f8f5ff;border:1px solid #e9d5ff;border-radius:18px;padding:16px;margin:14px 0}
.scorex-preview .scorex-meta p{margin:0}
.scorex-preview .scorex-global{display:flex;align-items:center;justify-content:space-between;border-radius:20px;background:#0066CC;color:white;padding:18px 22px;margin:18px 0}
.scorex-preview .scorex-global span{text-transform:uppercase;letter-spacing:.16em;font-size:12px;font-weight:800;color:#ffffff !important}
.scorex-preview .scorex-global strong{font-size:42px;line-height:1;color:#ffffff !important}
.scorex-preview .scorex-summary{font-size:16px;color:#334155}
.scorex-preview .scorex-section{border-top:1px solid #ede9fe;padding-top:12px}
.scorex-preview .scorex-table{width:100%;border-collapse:collapse;margin:12px 0 22px;font-size:14px}
.scorex-preview .scorex-table th{background:#0066CC;color:white;text-align:left;padding:12px}
.scorex-preview .scorex-table td{border:1px solid #e5e7eb;padding:11px}
.scorex-preview .scorex-table tr:nth-child(even) td{background:#faf5ff}
.scorex-preview .scorex-radar{display:block;width:100%;max-width:560px;min-height:520px;margin:8px auto 22px;border:1px solid #dbeafe;border-radius:20px;background:#fff}
`;
