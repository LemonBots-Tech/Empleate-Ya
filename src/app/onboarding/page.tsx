"use client";

import { useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

export default function OnboardingPage() {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    const payload = Object.fromEntries(formData);
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, languages: String(payload.languages ?? "").split(",").map((x) => x.trim()).filter(Boolean) }) });
    setMessage(response.ok ? "Perfil profesional guardado." : JSON.stringify(await response.json()));
  }
  return (
    <EmployabilityShell>
      <form action={submit} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-black">Onboarding profesional</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input name="targetRole" placeholder="Puesto objetivo" />
          <Select name="seniority"><option>Junior</option><option>Mid</option><option>Senior</option><option>Ejecutivo</option></Select>
          <Input name="industry" placeholder="Industria" />
          <Input name="yearsExperience" type="number" placeholder="Años de experiencia" />
          <Input name="lastRole" placeholder="Último puesto" />
          <Input name="lastCompany" placeholder="Última empresa" />
          <Input name="educationLevel" placeholder="Nivel de estudios" />
          <Input name="languages" placeholder="Idiomas separados por coma" />
          <Input name="linkedinUrl" placeholder="LinkedIn URL" />
          <Select name="preferredWorkMode"><option>presencial</option><option>híbrido</option><option>remoto</option></Select>
          <Input name="geographicAvailability" placeholder="Disponibilidad geográfica" />
          <Input name="desiredSalaryRange" placeholder="Rango salarial deseado" />
          <Input name="jobSearchStatus" placeholder="Situación laboral actual" />
        </div>
        <Button className="mt-6 bg-amber-300 text-slate-950">Guardar perfil</Button>
        {message && <p className="mt-4 text-amber-200">{message}</p>}
      </form>
    </EmployabilityShell>
  );
}
