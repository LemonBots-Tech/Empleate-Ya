"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Download, FileText, Languages, MessageSquareText, Printer, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type OptimMode = "scratch" | "optimize" | "adapt";
type OptimLanguage = "es" | "en";
type OptimResponse = {
  assistantMessage: string;
  cvTitle: string;
  cvHtml: string;
  coverLetterHtml: string;
  thankYouLetterHtml: string;
  keywords: string[];
  atsWarnings: string[];
  nextQuestions: string[];
};

type Copy = {
  heroEyebrow: string;
  heroDescription: string;
  language: string;
  qualityRuleTitle: string;
  qualityRule: string;
  targetRole: string;
  targetRolePlaceholder: string;
  profile: string;
  currentCv: string;
  vacancyFile: string;
  vacancyPaste: string;
  vacancyPlaceholder: string;
  working: string;
  assistantResponse: string;
  chatTitle: string;
  userInstructions: string;
  userInstructionsPlaceholder: string;
  collectedAnswers: string;
  collectedAnswersPlaceholder: string;
  promptPoints: string;
  approved: string;
  pending: string;
  keywordTitle: string;
  keywordHelp: string;
  cvPreview: string;
  coverLetter: string;
  thankYouLetter: string;
  previewHelp: string;
  print: string;
  atsAlerts: string;
  nextQuestions: string;
  noData: string;
  errorDefault: string;
  approvedSections: string;
  modeCopy: Record<OptimMode, { title: string; eyebrow: string; description: string; action: string }>;
  scratchSteps: string[];
  initialResult: OptimResponse;
};

const copy: Record<OptimLanguage, Copy> = {
  es: {
    heroEyebrow: "Coach de empleabilidad",
    heroDescription: "Crea, optimiza o adapta tu CV en formato Harvard tradicional, con cartas listas para acompañarlo.",
    language: "Idioma",
    qualityRuleTitle: "Regla de calidad:",
    qualityRule: "Optim no debe inventar habilidades, certificaciones ni resultados. Si algo no se puede defender en entrevista, se ajusta o se elimina.",
    targetRole: "Puesto objetivo",
    targetRolePlaceholder: "Ej. Supplier Quality & Development Manager",
    profile: "Perfil",
    currentCv: "CV actual",
    vacancyFile: "Vacante en archivo",
    vacancyPaste: "Pega aquí la vacante",
    vacancyPlaceholder: "Responsabilidades, requisitos, herramientas, industria, seniority...",
    working: "Trabajando...",
    assistantResponse: "Respuesta del asistente",
    chatTitle: "Chatendo con Optim",
    userInstructions: "Tu información o instrucciones",
    userInstructionsPlaceholder: "Pide ajustes, aprueba slogan, aclara logros o indica qué no puede afirmarse en entrevista.",
    collectedAnswers: "Respuestas recopiladas",
    collectedAnswersPlaceholder: "Nombre, contacto, empresas, fechas, logros STAR, educación, certificaciones...",
    promptPoints: "Puntos del prompt",
    approved: "Aprobado: ",
    pending: "Pendiente: ",
    keywordTitle: "Palabras clave identificadas",
    keywordHelp: "Úsalas como guía, pero solo integra habilidades y resultados que puedas explicar con evidencia.",
    cvPreview: "Preview del CV",
    coverLetter: "Carta de presentación",
    thankYouLetter: "Carta de agradecimiento",
    previewHelp: "Formato Harvard tradicional. Vista de solo lectura con desplazamiento.",
    print: "Imprimir",
    atsAlerts: "Alertas ATS",
    nextQuestions: "Siguientes preguntas",
    noData: "Sin datos todavía.",
    errorDefault: "Error inesperado en Optim.",
    approvedSections: "Secciones aprobadas",
    modeCopy: {
      scratch: {
        title: "Crear CV desde cero",
        eyebrow: "Autocandidatura guiada",
        description: "Optim te guía sección por sección hasta construir un CV Harvard tradicional listo para Word, PDF e impresión.",
        action: "Crear preview de CV",
      },
      optimize: {
        title: "Optimizar mi CV",
        eyebrow: "CV existente",
        description: "Carga tu CV actual, define puesto y seniority, y convierte funciones en logros claros con metodología STAR.",
        action: "Optimizar preview",
      },
      adapt: {
        title: "Adaptar a una vacante",
        eyebrow: "Alineación ATS realista",
        description: "Sube tu CV y la vacante. Optim detecta palabras clave y adapta solo lo que puedas defender en entrevista.",
        action: "Adaptar preview",
      },
    },
    scratchSteps: [
      "Encabezado y datos de contacto",
      "Puesto objetivo, palabras clave y slogan",
      "Resumen profesional",
      "Logros destacados con STAR",
      "Habilidades clave en tres columnas de lectura",
      "Experiencia profesional",
      "Educación, certificaciones e idiomas",
      "Carta de presentación y agradecimiento",
    ],
    initialResult: {
      assistantMessage: "Selecciona una ceja, captura la información base y genera el primer preview. Optim conservará el formato Harvard tradicional.",
      cvTitle: "Preview CV Optim",
      cvHtml: `<article class="optim-cv"><h1>NOMBRE DEL CANDIDATO</h1><p class="contact">Disponibilidad geográfica | +52 000 000 0000 | correo@ejemplo.com | linkedin.com/in/perfil</p><h2 class="target">PUESTO OBJETIVO</h2><p><strong>Liderazgo</strong> | <strong>Mejora de procesos</strong> | <strong>Impacto de negocio</strong></p><p>Impulso resultados medibles mediante ejecución estratégica y una propuesta de valor profesional clara.</p><h3>RESUMEN PROFESIONAL</h3><p>Completa el chat de Optim para generar aquí un CV Harvard tradicional con el formato azul, sobrio y compatible con ATS.</p><h3>LOGROS DESTACADOS</h3><ul><li>Los logros se redactarán con metodología STAR: situación, tarea o acción y resultado.</li><li>Las funciones repetitivas o antiguas se resumirán para cuidar la lectura del reclutador.</li></ul></article>`,
      coverLetterHtml: buildLocalLetter("cover", "es", ""),
      thankYouLetterHtml: buildLocalLetter("thanks", "es", ""),
      keywords: ["Liderazgo", "Mejora de procesos", "Impacto de negocio"],
      atsWarnings: ["El CV final debe evitar tablas, fotos, iconos y gráficos decorativos."],
      nextQuestions: ["¿Cuál es el puesto objetivo?", "¿Qué logros puedes medir con número, porcentaje o impacto cualitativo?"],
    },
  },
  en: {
    heroEyebrow: "Employability coach",
    heroDescription: "Create, optimize, or tailor your resume in Harvard traditional format, with companion letters ready to use.",
    language: "Language",
    qualityRuleTitle: "Quality rule:",
    qualityRule: "Optim must not invent skills, certifications, or results. If something cannot be defended in an interview, it should be adjusted or removed.",
    targetRole: "Target role",
    targetRolePlaceholder: "Ex. Supplier Quality & Development Manager",
    profile: "Profile",
    currentCv: "Current resume",
    vacancyFile: "Job posting file",
    vacancyPaste: "Paste the job posting here",
    vacancyPlaceholder: "Responsibilities, requirements, tools, industry, seniority...",
    working: "Working...",
    assistantResponse: "Assistant response",
    chatTitle: "Chatting with Optim",
    userInstructions: "Your information or instructions",
    userInstructionsPlaceholder: "Request edits, approve the slogan, clarify achievements, or explain what cannot be claimed in an interview.",
    collectedAnswers: "Collected answers",
    collectedAnswersPlaceholder: "Name, contact details, companies, dates, STAR achievements, education, certifications...",
    promptPoints: "Prompt checkpoints",
    approved: "Approved: ",
    pending: "Pending: ",
    keywordTitle: "Identified keywords",
    keywordHelp: "Use them as guidance, but only include skills and results you can explain with evidence.",
    cvPreview: "Resume preview",
    coverLetter: "Cover letter",
    thankYouLetter: "Thank-you letter",
    previewHelp: "Harvard traditional format. Read-only view with scrolling.",
    print: "Print",
    atsAlerts: "ATS alerts",
    nextQuestions: "Next questions",
    noData: "No data yet.",
    errorDefault: "Unexpected Optim error.",
    approvedSections: "Approved sections",
    modeCopy: {
      scratch: {
        title: "Create resume from scratch",
        eyebrow: "Guided self-application",
        description: "Optim guides you section by section until you build a Harvard traditional resume ready for Word, PDF, and printing.",
        action: "Create resume preview",
      },
      optimize: {
        title: "Optimize my resume",
        eyebrow: "Existing resume",
        description: "Upload your current resume, define the role and seniority level, and turn responsibilities into clear STAR achievements.",
        action: "Optimize preview",
      },
      adapt: {
        title: "Tailor to a job posting",
        eyebrow: "Realistic ATS alignment",
        description: "Upload your resume and the job posting. Optim detects keywords and adapts only what you can defend in an interview.",
        action: "Tailor preview",
      },
    },
    scratchSteps: [
      "Header and contact details",
      "Target role, keywords, and slogan",
      "Professional summary",
      "Key STAR achievements",
      "Key skills in three readable groups",
      "Professional experience",
      "Education, certifications, and languages",
      "Cover letter and thank-you letter",
    ],
    initialResult: {
      assistantMessage: "Choose a tab, capture the base information, and generate the first preview. Optim will preserve the Harvard traditional format.",
      cvTitle: "Optim resume preview",
      cvHtml: `<article class="optim-cv"><h1>CANDIDATE NAME</h1><p class="contact">Geographic availability | +1 000 000 0000 | email@example.com | linkedin.com/in/profile</p><h2 class="target">TARGET ROLE</h2><p><strong>Leadership</strong> | <strong>Process Improvement</strong> | <strong>Business Impact</strong></p><p>Driving measurable outcomes through strategic execution and a clear professional value proposition.</p><h3>PROFESSIONAL SUMMARY</h3><p>Complete the Optim chat to generate a Harvard traditional resume with blue headings, a sober layout, and ATS compatibility.</p><h3>KEY ACHIEVEMENTS</h3><ul><li>Achievements will be written with the STAR method: situation, task or action, and result.</li><li>Repetitive or older responsibilities will be summarized to protect recruiter readability.</li></ul></article>`,
      coverLetterHtml: buildLocalLetter("cover", "en", ""),
      thankYouLetterHtml: buildLocalLetter("thanks", "en", ""),
      keywords: ["Leadership", "Process improvement", "Business impact"],
      atsWarnings: ["The final resume should avoid tables, photos, icons, and decorative graphics."],
      nextQuestions: ["What is the target role?", "Which achievements can you measure with numbers, percentages, or qualitative impact?"],
    },
  },
};

const languageOptions: Array<{ value: OptimLanguage; label: string; flagClass: string }> = [
  { value: "es", label: "Español", flagClass: "fi fi-mx" },
  { value: "en", label: "English", flagClass: "fi fi-us" },
];

export function OptimWorkspace() {
  const [mode, setMode] = useState<OptimMode>("scratch");
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const [targetRole, setTargetRole] = useState("");
  const [profileLevel, setProfileLevel] = useState("Sr");
  const [collectedAnswers, setCollectedAnswers] = useState("");
  const [userInstructions, setUserInstructions] = useState("");
  const [vacancyText, setVacancyText] = useState("");
  const [currentCv, setCurrentCv] = useState<File>();
  const [vacancyFile, setVacancyFile] = useState<File>();
  const [approvedSteps, setApprovedSteps] = useState<number[]>([]);
  const [result, setResult] = useState<OptimResponse>(copy.es.initialResult);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [documentView, setDocumentView] = useState<"cv" | "cover" | "thanks">("cv");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasGenerated) setResult(copy[language].initialResult);
  }, [hasGenerated, language]);

  const activeHtml = documentView === "cv" ? result.cvHtml : documentView === "cover" ? result.coverLetterHtml : result.thankYouLetterHtml;
  const activeTitle = documentView === "cv" ? t.cvPreview : documentView === "cover" ? t.coverLetter : t.thankYouLetter;
  const modeDetails = t.modeCopy[mode];
  const vacancyKeywords = useMemo(() => extractKeywords(vacancyText, result.keywords), [vacancyText, result.keywords]);

  function toggleStep(index: number) {
    setApprovedSteps((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  async function selectVacancyFile(file?: File) {
    setVacancyFile(file);
    if (file?.type.startsWith("text/") || (file && /\.txt$/i.test(file.name))) setVacancyText(await file.text());
  }

  async function generatePreview() {
    setErrorMessage("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("language", language);
      formData.append("targetRole", targetRole);
      formData.append("profileLevel", profileLevel);
      formData.append("userInstructions", userInstructions);
      formData.append("collectedAnswers", `${collectedAnswers}\n\n${t.approvedSections}: ${approvedSteps.map((index) => t.scratchSteps[index]).join(", ")}`);
      formData.append("vacancyText", vacancyText);
      if (currentCv) formData.append("currentCv", currentCv);
      if (vacancyFile) formData.append("vacancyFile", vacancyFile);

      const response = await fetch("/api/optim/generate", { method: "POST", body: formData });
      const payload = await response.json() as OptimResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? t.errorDefault);
      setResult(payload);
      setHasGenerated(true);
      setDocumentView("cv");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.errorDefault);
    } finally {
      setLoading(false);
    }
  }

  async function downloadWord(documentType: "cv" | "cover" | "thanks" = documentView) {
    const html = documentType === "cv" ? result.cvHtml : documentType === "cover" ? result.coverLetterHtml : result.thankYouLetterHtml;
    const title = documentType === "cv" ? result.cvTitle : documentType === "cover" ? t.coverLetter : t.thankYouLetter;
    const url = URL.createObjectURL(new Blob([buildWordHtml(html, title)], { type: "application/msword" }));
    downloadUrl(url, `${slugify(title)}.doc`);
  }

  function printDocument(documentType: "cv" | "cover" | "thanks" = documentView) {
    const html = documentType === "cv" ? result.cvHtml : documentType === "cover" ? result.coverLetterHtml : result.thankYouLetterHtml;
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;
    popup.document.write(buildPrintHtml(html, activeTitle));
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--brand-primary)]">{t.heroEyebrow}</span>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">Optim</h1>
          <p className="mt-3 max-w-4xl text-slate-600">{t.heroDescription}</p>
        </div>
        <LanguageSelector value={language} label={t.language} onChange={setLanguage} />
      </header>

      {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

      <section className="grid gap-6 rounded-[2rem] border border-[var(--brand-border)] bg-white p-5 shadow-sm">
        <aside className="grid content-start gap-3 lg:grid-cols-3">
          {(Object.keys(t.modeCopy) as OptimMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`min-h-24 rounded-2xl border px-4 py-4 text-left transition ${mode === item ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-shadow)]" : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-border)] hover:bg-[var(--brand-primary-soft)]"}`}
            >
              <span className="flex items-center gap-2 text-base font-black">
                {item === "scratch" ? <BookOpenCheck size={18} /> : item === "optimize" ? <Sparkles size={18} /> : <FileText size={18} />}
                {t.modeCopy[item].title}
              </span>
              <span className={`mt-2 block text-xs font-black uppercase tracking-[0.12em] ${mode === item ? "text-white/80" : "text-slate-500"}`}>{t.modeCopy[item].eyebrow}</span>
            </button>
          ))}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 lg:col-span-3">
            <strong className="text-slate-950">{t.qualityRuleTitle}</strong> {t.qualityRule}
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="rounded-2xl border border-slate-200 bg-[#fcfbff] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">{modeDetails.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{modeDetails.description}</p>
              </div>
              <Button onClick={generatePreview} disabled={loading} className="gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-3 text-white shadow-sm hover:bg-[var(--brand-primary-strong)]">
                <Send size={16} /> {loading ? t.working : modeDetails.action}
              </Button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
                {t.targetRole}
                <Input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder={t.targetRolePlaceholder} />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                {t.profile}
                <Select value={profileLevel} onChange={(event) => setProfileLevel(event.target.value)}>
                  <option>Sr</option>
                  <option>Mid</option>
                  <option>Jr</option>
                </Select>
              </label>
            </div>

            {mode !== "scratch" ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  {t.currentCv}
                  <Input type="file" accept=".txt,.doc,.docx,.pdf" onChange={(event) => setCurrentCv(event.target.files?.[0])} />
                </label>
                {mode === "adapt" ? (
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    {t.vacancyFile}
                    <Input type="file" accept=".txt,.doc,.docx,.pdf" onChange={(event) => selectVacancyFile(event.target.files?.[0])} />
                  </label>
                ) : null}
              </div>
            ) : null}

            {mode === "adapt" ? (
              <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                {t.vacancyPaste}
                <Textarea value={vacancyText} onChange={(event) => setVacancyText(event.target.value)} className="min-h-36" placeholder={t.vacancyPlaceholder} />
              </label>
            ) : null}
          </div>

          <div className="grid gap-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-xl font-black text-slate-950"><MessageSquareText size={20} className="text-[var(--brand-primary)]" /> {t.chatTitle}</div>
              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">
                <p className="font-black text-amber-200">{t.assistantResponse}</p>
                <p className="mt-2 text-slate-100">{result.assistantMessage}</p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  {t.userInstructions}
                  <Textarea value={userInstructions} onChange={(event) => setUserInstructions(event.target.value)} className="min-h-40" placeholder={t.userInstructionsPlaceholder} />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  {t.collectedAnswers}
                  <Textarea value={collectedAnswers} onChange={(event) => setCollectedAnswers(event.target.value)} className="min-h-40" placeholder={t.collectedAnswersPlaceholder} />
                </label>
              </div>
              <div className="mt-4 grid gap-2">
                <p className="text-sm font-black text-slate-950">{t.promptPoints}</p>
                {t.scratchSteps.map((step, index) => (
                  <button key={step} type="button" onClick={() => toggleStep(index)} className={`rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${approvedSteps.includes(index) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {approvedSteps.includes(index) ? t.approved : t.pending}{step}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-5">
              {mode === "adapt" ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-black text-slate-950">{t.keywordTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.keywordHelp}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {vacancyKeywords.map((keyword) => <span key={keyword} className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--brand-primary-strong)]">{keyword}</span>)}
                  </div>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{activeTitle}</h3>
                    <p className="text-xs text-slate-500">{t.previewHelp}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setDocumentView("cv")} className={`rounded-full px-3 py-2 ${documentView === "cv" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>CV</Button>
                    <Button onClick={() => setDocumentView("cover")} className={`rounded-full px-3 py-2 ${documentView === "cover" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>{t.coverLetter}</Button>
                    <Button onClick={() => setDocumentView("thanks")} className={`rounded-full px-3 py-2 ${documentView === "thanks" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>{t.thankYouLetter}</Button>
                    <Button onClick={() => downloadWord()} className="gap-2 rounded-full bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"><Download size={15} /> Word</Button>
                    <Button onClick={() => printDocument()} className="gap-2 rounded-full bg-rose-500 px-3 py-2 text-white hover:bg-rose-400"><Download size={15} /> PDF</Button>
                    <Button onClick={() => printDocument()} className="gap-2 rounded-full bg-slate-600 px-3 py-2 text-white hover:bg-slate-500"><Printer size={15} /> {t.print}</Button>
                  </div>
                </div>
                <div ref={previewRef} className="optim-preview max-h-[760px] min-h-[620px] overflow-auto bg-white p-5">
                  <div className="mx-auto w-[816px] max-w-none rounded-sm bg-white px-[76px] py-[94px] shadow-[0_8px_40px_-28px_rgba(15,23,42,0.45)]" dangerouslySetInnerHTML={{ __html: activeHtml }} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoList title={t.atsAlerts} items={result.atsWarnings} emptyLabel={t.noData} />
                <InfoList title={t.nextQuestions} items={result.nextQuestions} emptyLabel={t.noData} />
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function LanguageSelector({ value, label, onChange }: { value: OptimLanguage; label: string; onChange: (language: OptimLanguage) => void }) {
  return (
    <div className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500"><Languages size={14} /> {label}</span>
      <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {languageOptions.map((option) => (
          <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${value === option.value ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-slate-600 hover:bg-[var(--brand-primary-soft)]"}`}>
            <span aria-hidden="true" className={`${option.flagClass} rounded-[3px] shadow-sm`} /> {option.value.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoList({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="font-black text-slate-950">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.length ? items.map((item) => <li key={item}>- {item}</li>) : <li>{emptyLabel}</li>}
      </ul>
    </div>
  );
}

function extractKeywords(vacancyText: string, fallback: string[]) {
  const source = vacancyText || fallback.join(" ");
  const words = source
    .replace(/[^\p{L}\p{N}\s/+.-]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .map((word) => word.trim());
  const unique = Array.from(new Set([...fallback, ...words]));
  return unique.slice(0, 18);
}

function buildLocalLetter(type: "cover" | "thanks", language: OptimLanguage, targetRole: string) {
  const en = language === "en";
  const role = targetRole || (en ? "target role" : "puesto objetivo");
  const title = type === "cover" ? (en ? "COVER LETTER" : "CARTA DE PRESENTACIÓN") : (en ? "THANK-YOU LETTER" : "CARTA DE AGRADECIMIENTO");
  const body = type === "cover"
    ? (en ? `I am pleased to submit my profile for the ${role} opportunity. My experience and professional focus align with the role, and I would welcome the opportunity to discuss how I can contribute.` : `Me permito presentar mi perfil para la oportunidad de ${role}. Mi experiencia y enfoque profesional se alinean con el puesto, y será un gusto conversar sobre cómo puedo contribuir.`)
    : (en ? `Thank you for the opportunity to discuss the ${role} position. I appreciate your time and remain interested in contributing with measurable impact.` : `Gracias por la oportunidad de conversar sobre la posición de ${role}. Aprecio su tiempo y reitero mi interés en contribuir con impacto medible.`);
  return `<article class="optim-letter"><h1>${title}</h1><p>${body}</p><p>${en ? "Sincerely" : "Atentamente"},<br><strong>${en ? "Candidate Name" : "Nombre del candidato"}</strong></p></article>`;
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildWordHtml(html: string, title: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeExportHtml(title)}</title><style>${optimExportStyles}</style></head><body>${html}</body></html>`;
}

function buildPrintHtml(html: string, title: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeExportHtml(title)}</title><style>${optimExportStyles}</style></head><body>${html}</body></html>`;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "optim";
}

function escapeExportHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

const optimExportStyles = `
@page{size:letter;margin:2.5cm 2cm;}
body{font-family:Arial,sans-serif;color:#111827;background:#ffffff;font-size:8.5pt;line-height:1.15;margin:0;}
.optim-cv,.optim-letter{font-family:Arial,sans-serif;font-size:8.5pt;line-height:1.15;color:#111827;}
.optim-cv h1,.optim-letter h1{font-size:12pt;text-align:center;color:#0066CC;font-weight:900;text-transform:uppercase;margin:0 0 8px;}
.optim-cv .contact{text-align:center;margin:0 0 10px;}
.optim-cv .target{font-size:12pt;text-align:center;color:#111827;font-weight:900;text-transform:uppercase;margin:8px 0;}
.optim-cv h2,.optim-cv h3,.optim-letter h2,.optim-letter h3{font-size:12pt;color:#0066CC;font-weight:900;text-transform:uppercase;margin:14px 0 6px;}
.optim-cv p,.optim-letter p{margin:0 0 7px;}
.optim-cv ul{margin:0 0 8px 16px;padding:0;}
.optim-cv li{margin:0 0 5px;}
.optim-cv strong,.optim-letter strong{font-weight:900;}
`;
