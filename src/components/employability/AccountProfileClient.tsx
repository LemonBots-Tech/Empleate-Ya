"use client";

import { useEffect, useState } from "react";
import { Save, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ProfileForm = {
  targetRole: string;
  seniority: string;
  industry: string;
  yearsExperience: string;
  lastRole: string;
  lastCompany: string;
  educationLevel: string;
  languagesText: string;
  linkedinUrl: string;
  jobSearchStatus: string;
  desiredSalaryRange: string;
  preferredWorkMode: string;
  geographicAvailability: string;
};

const emptyProfile: ProfileForm = {
  targetRole: "",
  seniority: "",
  industry: "",
  yearsExperience: "",
  lastRole: "",
  lastCompany: "",
  educationLevel: "",
  languagesText: "",
  linkedinUrl: "",
  jobSearchStatus: "",
  desiredSalaryRange: "",
  preferredWorkMode: "",
  geographicAvailability: "",
};

const copy = {
  es: {
    title: "Perfil profesional",
    description: "Esta información alimentará tus agentes, reportes, CVs, campañas y recomendaciones. El usuario conserva el control de sus datos.",
    loading: "Cargando perfil...",
    login: "Inicia sesión para editar tu perfil.",
    saved: "Perfil actualizado.",
    targetRole: "Puesto objetivo",
    seniority: "Nivel",
    industry: "Industria",
    yearsExperience: "Años de experiencia",
    lastRole: "Último puesto",
    lastCompany: "Última empresa",
    educationLevel: "Escolaridad",
    languages: "Idiomas",
    linkedinUrl: "LinkedIn",
    jobSearchStatus: "Estado de búsqueda",
    desiredSalaryRange: "Rango salarial deseado",
    preferredWorkMode: "Modalidad preferida",
    geographicAvailability: "Disponibilidad geográfica",
    save: "Guardar perfil",
    privacyTitle: "Privacidad y seguridad",
    privacy: ["Aviso de privacidad y términos aceptados en registro.", "Procesamiento con IA separado por consentimiento.", "Eliminación de datos mediante solicitud auditada.", "La información del usuario no se comparte sin permiso o relación de servicio."],
  },
  en: {
    title: "Professional profile",
    description: "This information will power your agents, reports, resumes, campaigns, and recommendations. The user keeps control of their data.",
    loading: "Loading profile...",
    login: "Sign in to edit your profile.",
    saved: "Profile updated.",
    targetRole: "Target role",
    seniority: "Level",
    industry: "Industry",
    yearsExperience: "Years of experience",
    lastRole: "Last role",
    lastCompany: "Last company",
    educationLevel: "Education",
    languages: "Languages",
    linkedinUrl: "LinkedIn",
    jobSearchStatus: "Job search status",
    desiredSalaryRange: "Desired salary range",
    preferredWorkMode: "Preferred work mode",
    geographicAvailability: "Geographic availability",
    save: "Save profile",
    privacyTitle: "Privacy and security",
    privacy: ["Privacy notice and terms accepted during registration.", "AI processing handled through separate consent.", "Data deletion through audited request.", "User information is not shared without permission or a service relationship."],
  },
} as const;

export function AccountProfileClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (!response.ok) {
        setError(t.login);
        setLoading(false);
        return;
      }
      const profile = data.profile;
      if (profile) {
        setForm({
          targetRole: profile.targetRole ?? "",
          seniority: profile.seniority ?? "",
          industry: profile.industry ?? "",
          yearsExperience: profile.yearsExperience?.toString() ?? "",
          lastRole: profile.lastRole ?? "",
          lastCompany: profile.lastCompany ?? "",
          educationLevel: profile.educationLevel ?? "",
          languagesText: profile.languages?.join(", ") ?? "",
          linkedinUrl: profile.linkedinUrl ?? "",
          jobSearchStatus: profile.jobSearchStatus ?? "",
          desiredSalaryRange: profile.desiredSalaryRange ?? "",
          preferredWorkMode: profile.preferredWorkMode ?? "",
          geographicAvailability: profile.geographicAvailability ?? "",
        });
      }
      setLoading(false);
    }
    void loadProfile();
  }, [t.login]);

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile() {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRole: form.targetRole || undefined,
        seniority: form.seniority || undefined,
        industry: form.industry || undefined,
        yearsExperience: form.yearsExperience || undefined,
        lastRole: form.lastRole || undefined,
        lastCompany: form.lastCompany || undefined,
        educationLevel: form.educationLevel || undefined,
        languages: form.languagesText.split(",").map((item) => item.trim()).filter(Boolean),
        linkedinUrl: form.linkedinUrl || undefined,
        jobSearchStatus: form.jobSearchStatus || undefined,
        desiredSalaryRange: form.desiredSalaryRange || undefined,
        preferredWorkMode: form.preferredWorkMode || undefined,
        geographicAvailability: form.geographicAvailability || undefined,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "ERROR");
      return;
    }
    setMessage(t.saved);
  }

  if (loading) return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-600">{t.loading}</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-[var(--brand-primary-soft)] p-3 text-[var(--brand-primary)]"><UserRound size={24} /></span>
          <div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950">{t.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-600">{t.description}</p>
          </div>
        </div>
        {message ? <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div><Label>{t.targetRole}</Label><Input value={form.targetRole} onChange={(event) => updateField("targetRole", event.target.value)} /></div>
          <div>
            <Label>{t.seniority}</Label>
            <Select value={form.seniority} onChange={(event) => updateField("seniority", event.target.value)}>
              <option value="">-</option>
              <option value="jr">Jr</option>
              <option value="mid">Mid</option>
              <option value="sr">Sr</option>
              <option value="executive">Executive</option>
            </Select>
          </div>
          <div><Label>{t.industry}</Label><Input value={form.industry} onChange={(event) => updateField("industry", event.target.value)} /></div>
          <div><Label>{t.yearsExperience}</Label><Input type="number" min={0} max={60} value={form.yearsExperience} onChange={(event) => updateField("yearsExperience", event.target.value)} /></div>
          <div><Label>{t.lastRole}</Label><Input value={form.lastRole} onChange={(event) => updateField("lastRole", event.target.value)} /></div>
          <div><Label>{t.lastCompany}</Label><Input value={form.lastCompany} onChange={(event) => updateField("lastCompany", event.target.value)} /></div>
          <div><Label>{t.educationLevel}</Label><Input value={form.educationLevel} onChange={(event) => updateField("educationLevel", event.target.value)} /></div>
          <div><Label>{t.languages}</Label><Input value={form.languagesText} onChange={(event) => updateField("languagesText", event.target.value)} placeholder="Español, Inglés" /></div>
          <div className="md:col-span-2"><Label>{t.linkedinUrl}</Label><Input value={form.linkedinUrl} onChange={(event) => updateField("linkedinUrl", event.target.value)} /></div>
          <div><Label>{t.jobSearchStatus}</Label><Input value={form.jobSearchStatus} onChange={(event) => updateField("jobSearchStatus", event.target.value)} /></div>
          <div><Label>{t.desiredSalaryRange}</Label><Input value={form.desiredSalaryRange} onChange={(event) => updateField("desiredSalaryRange", event.target.value)} /></div>
          <div><Label>{t.preferredWorkMode}</Label><Input value={form.preferredWorkMode} onChange={(event) => updateField("preferredWorkMode", event.target.value)} /></div>
          <div><Label>{t.geographicAvailability}</Label><Textarea value={form.geographicAvailability} onChange={(event) => updateField("geographicAvailability", event.target.value)} /></div>
        </div>
        <Button type="button" onClick={saveProfile} className="mt-6 bg-[var(--brand-primary)] text-white"><Save size={16} /> {t.save}</Button>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><ShieldCheck size={24} /></span>
          <h2 className="text-2xl font-black text-slate-950">{t.privacyTitle}</h2>
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
          {t.privacy.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-3">{item}</li>)}
        </ul>
      </aside>
    </div>
  );
}
