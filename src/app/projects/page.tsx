"use client";

import { useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProjectsPage() {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    setMessage(response.ok ? "Proyecto creado." : JSON.stringify(await response.json()));
  }
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Proyectos profesionales</h1>
      <p className="mt-3 text-slate-300">Crea carpetas por objetivo laboral: Gerente Comercial, Project Manager, Vacante BBVA o Trabajo remoto USA.</p>
      <form action={submit} className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-4">
        <Input name="title" placeholder="Título del proyecto" required />
        <Input name="targetRole" placeholder="Puesto objetivo" />
        <Input name="description" placeholder="Descripción" />
        <Button className="bg-amber-300 text-slate-950">Crear proyecto</Button>
      </form>
      {message && <p className="mt-4 text-amber-200">{message}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-4">{["Gerente Comercial", "Project Manager", "Vacante BBVA", "Trabajo remoto USA"].map((title) => <div className="rounded-2xl bg-white/10 p-4" key={title}><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-300">CV · carta · ScoreX · pitch · entrevista · vacantes · notas</p></div>)}</div>
    </EmployabilityShell>
  );
}
