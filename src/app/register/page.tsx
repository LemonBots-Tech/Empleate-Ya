"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const fields = ["firstName", "lastName", "email", "phone", "age", "country", "state", "city", "password"];

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    const payload = Object.fromEntries(fields.map((field) => [field, formData.get(field)]));
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, privacyAccepted: true, termsAccepted: true, aiConsentAccepted: true }) });
    setMessage(response.ok ? "Cuenta creada. Ve al onboarding profesional." : JSON.stringify(await response.json()));
  }
  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] px-5 py-12 text-[var(--brand-ink)]">
      <form action={submit} className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--brand-border)] bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black">Crear cuenta</h1>
        <p className="mt-2 text-[var(--brand-copy)]">Registro MVP con aviso de privacidad, términos y consentimiento de IA.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">{fields.map((field) => <Input key={field} name={field} required={field !== "phone"} type={field === "password" ? "password" : field === "email" ? "email" : field === "age" ? "number" : "text"} placeholder={field} />)}</div>
        <div className="mt-5 space-y-2 text-sm text-[var(--brand-copy)]"><label><input type="checkbox" defaultChecked /> Acepto aviso de privacidad.</label><br /><label><input type="checkbox" defaultChecked /> Acepto términos y condiciones.</label><br /><label><input type="checkbox" defaultChecked /> Consiento procesamiento con IA.</label></div>
        <div className="mt-6 flex gap-3"><Button className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]">Registrarme</Button><Link className="rounded-2xl border border-[var(--brand-border)] px-4 py-2.5 font-bold text-[var(--brand-primary-strong)]" href="/login">Ya tengo cuenta</Link></div>
        {message && <p className="mt-4 text-[var(--brand-primary)]">{message}</p>}
      </form>
    </main>
  );
}
