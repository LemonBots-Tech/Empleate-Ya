"use client";

import { useEffect, useState } from "react";
import { Camera, Save, ShieldCheck, UserRound } from "lucide-react";
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
  employmentType: string;
  desiredSalaryRange: string;
  desiredSalaryAmount: string;
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
  employmentType: "",
  desiredSalaryRange: "",
  desiredSalaryAmount: "",
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
    monthlyReview: "Para darte mejores recomendaciones, completa la información faltante de tu perfil. Te lo recordaremos al inicio de cada mes si quedan campos importantes vacíos.",
    missingFields: "Campos por completar",
    ownerHelp: "Este perfil lo llena el usuario dueno de los datos: usuario online, alumno, ex-empleado o cliente autorizado. El Super Admin solo apoya o audita cuando exista una relacion de servicio.",
    photo: "Foto de perfil",
    photoHelp: "Imagen visible para coaches, reportes internos y experiencia personalizada.",
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
    employmentType: "Tipo de empleo",
    desiredSalaryRange: "Rango salarial deseado",
    desiredSalaryAmount: "Salario mensual deseado",
    desiredSalaryAmountHelp: "Captura el valor puntual que deseas pedir con base en tu experiencia, aptitudes y mercado.",
    preferredWorkMode: "Modalidad preferida",
    geographicAvailability: "Disponibilidad geográfica",
    save: "Guardar perfil",
    privacyTitle: "Privacidad y seguridad",
    privacy: ["Aviso de privacidad y términos aceptados en registro.", "Procesamiento con IA separado por consentimiento.", "Eliminación de datos mediante solicitud auditada.", "La información del usuario no se comparte sin permiso o relación de servicio."],
    educationOptions: [
      ["primary", "Primaria"],
      ["secondary", "Secundaria"],
      ["high_school", "Preparatoria / bachillerato"],
      ["technical", "Carrera técnica"],
      ["university", "Universidad / licenciatura"],
      ["postgraduate", "Posgrado"],
      ["master", "Maestría"],
      ["doctorate", "Doctorado"],
      ["certification", "Certificación profesional"],
    ],
    searchStatusOptions: [
      ["active", "Búsqueda activa"],
      ["flexible", "Búsqueda flexible"],
      ["exploring", "Simplemente mirando"],
      ["improving_profile", "Mejorando mi información"],
      ["not_searching", "No estoy buscando por ahora"],
    ],
    employmentTypeOptions: [
      ["full_time", "Jornada completa"],
      ["part_time", "Jornada parcial"],
      ["contract", "Contrato"],
      ["temporary", "Temporal"],
      ["internship", "Prácticas"],
      ["freelance", "Freelance / proyecto"],
    ],
    salaryRangeOptions: [
      ["mxn_min_1_5", "MXN $8,500 - $12,750 mensual"],
      ["mxn_1_5_2_5", "MXN $12,751 - $21,250 mensual"],
      ["mxn_2_5_4", "MXN $21,251 - $34,000 mensual"],
      ["mxn_4_6", "MXN $34,001 - $51,000 mensual"],
      ["mxn_6_10", "MXN $51,001 - $85,000 mensual"],
      ["mxn_10_plus", "MXN $85,001+ mensual"],
    ],
  },
  en: {
    title: "Professional profile",
    description: "This information will power your agents, reports, resumes, campaigns, and recommendations. The user keeps control of their data.",
    loading: "Loading profile...",
    login: "Sign in to edit your profile.",
    saved: "Profile updated.",
    monthlyReview: "To give you better recommendations, complete the missing profile information. We will remind you at the beginning of each month if important fields are still empty.",
    missingFields: "Fields to complete",
    ownerHelp: "This profile is completed by the data owner: online user, student, former employee, or authorized client. The Super Admin only supports or audits when a service relationship exists.",
    photo: "Profile photo",
    photoHelp: "Image shown to coaches, internal reports, and the personalized experience.",
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
    employmentType: "Employment type",
    desiredSalaryRange: "Desired salary range",
    desiredSalaryAmount: "Desired monthly salary",
    desiredSalaryAmountHelp: "Enter the specific amount you want to request based on your experience, skills, and market.",
    preferredWorkMode: "Preferred work mode",
    geographicAvailability: "Geographic availability",
    save: "Save profile",
    privacyTitle: "Privacy and security",
    privacy: ["Privacy notice and terms accepted during registration.", "AI processing handled through separate consent.", "Data deletion through audited request.", "User information is not shared without permission or a service relationship."],
    educationOptions: [
      ["primary", "Primary school"],
      ["secondary", "Secondary school"],
      ["high_school", "High school"],
      ["technical", "Technical degree"],
      ["university", "University / bachelor's degree"],
      ["postgraduate", "Postgraduate"],
      ["master", "Master's degree"],
      ["doctorate", "Doctorate"],
      ["certification", "Professional certification"],
    ],
    searchStatusOptions: [
      ["active", "Active search"],
      ["flexible", "Flexible search"],
      ["exploring", "Just looking"],
      ["improving_profile", "Improving my information"],
      ["not_searching", "Not searching right now"],
    ],
    employmentTypeOptions: [
      ["full_time", "Full-time"],
      ["part_time", "Part-time"],
      ["contract", "Contract"],
      ["temporary", "Temporary"],
      ["internship", "Internship"],
      ["freelance", "Freelance / project"],
    ],
    salaryRangeOptions: [
      ["usd_min_1_5", "USD $1,260 - $1,890 monthly"],
      ["usd_1_5_2_5", "USD $1,891 - $3,150 monthly"],
      ["usd_2_5_4", "USD $3,151 - $5,040 monthly"],
      ["usd_4_6", "USD $5,041 - $7,560 monthly"],
      ["usd_6_10", "USD $7,561 - $12,600 monthly"],
      ["usd_10_plus", "USD $12,601+ monthly"],
    ],
  },
} as const;

export function AccountProfileClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showMonthlyReview, setShowMonthlyReview] = useState(false);

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
          employmentType: profile.employmentType ?? "",
          desiredSalaryRange: profile.desiredSalaryRange ?? "",
          desiredSalaryAmount: profile.desiredSalaryAmount ?? "",
          preferredWorkMode: profile.preferredWorkMode ?? "",
          geographicAvailability: profile.geographicAvailability ?? "",
        });
      }
      const monthKey = new Date().toISOString().slice(0, 7);
      const reminderKey = `empleate-ya-profile-review-${monthKey}`;
      if (typeof window !== "undefined" && window.localStorage.getItem(reminderKey) !== "seen") {
        setShowMonthlyReview(true);
        window.localStorage.setItem(reminderKey, "seen");
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
        employmentType: form.employmentType || undefined,
        desiredSalaryRange: form.desiredSalaryRange || undefined,
        desiredSalaryAmount: form.desiredSalaryAmount || undefined,
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

  function updatePhoto(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  if (loading) return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-600">{t.loading}</div>;
  const missingFields = [
    [t.targetRole, form.targetRole],
    [t.seniority, form.seniority],
    [t.educationLevel, form.educationLevel],
    [t.jobSearchStatus, form.jobSearchStatus],
    [t.employmentType, form.employmentType],
    [t.desiredSalaryRange, form.desiredSalaryRange],
    [t.desiredSalaryAmount, form.desiredSalaryAmount],
  ].filter(([, value]) => !value);

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
        <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">{t.ownerHelp}</p>
        {showMonthlyReview && missingFields.length ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
            <p>{t.monthlyReview}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em]">{t.missingFields}</p>
            <p className="mt-1">{missingFields.map(([label]) => label).join(", ")}</p>
          </div>
        ) : null}
        {message ? <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>{t.photo}</Label>
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt={t.photo} className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="text-slate-300" size={44} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-600">{t.photoHelp}</p>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-slate-800">
                  <Camera size={16} />
                  {t.photo}
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => updatePhoto(event.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
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
          <div>
            <Label>{t.educationLevel}</Label>
            <Select value={form.educationLevel} onChange={(event) => updateField("educationLevel", event.target.value)}>
              <option value="">-</option>
              {t.educationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
          <div><Label>{t.languages}</Label><Input value={form.languagesText} onChange={(event) => updateField("languagesText", event.target.value)} placeholder="Español, Inglés" /></div>
          <div className="md:col-span-2"><Label>{t.linkedinUrl}</Label><Input value={form.linkedinUrl} onChange={(event) => updateField("linkedinUrl", event.target.value)} /></div>
          <div>
            <Label>{t.jobSearchStatus}</Label>
            <Select value={form.jobSearchStatus} onChange={(event) => updateField("jobSearchStatus", event.target.value)}>
              <option value="">-</option>
              {t.searchStatusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t.desiredSalaryRange}</Label>
            <Select value={form.desiredSalaryRange} onChange={(event) => updateField("desiredSalaryRange", event.target.value)}>
              <option value="">-</option>
              {t.salaryRangeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t.desiredSalaryAmount}</Label>
            <Input value={form.desiredSalaryAmount} onChange={(event) => updateField("desiredSalaryAmount", event.target.value)} placeholder={language === "es" ? "Ej. MXN $45,000" : "Example: USD $5,500"} />
            <p className="mt-1 text-xs font-semibold text-slate-500">{t.desiredSalaryAmountHelp}</p>
          </div>
          <div>
            <Label>{t.employmentType}</Label>
            <Select value={form.employmentType} onChange={(event) => updateField("employmentType", event.target.value)}>
              <option value="">-</option>
              {t.employmentTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
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
