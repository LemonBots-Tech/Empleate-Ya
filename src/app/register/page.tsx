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
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <form action={submit} className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-black">Crear cuenta</h1>
        <p className="mt-2 text-slate-300">Registro MVP con aviso de privacidad, términos y consentimiento de IA.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">{fields.map((field) => <Input key={field} name={field} required={field !== "phone"} type={field === "password" ? "password" : field === "email" ? "email" : field === "age" ? "number" : "text"} placeholder={field} />)}</div>
        <div className="mt-5 space-y-2 text-sm text-slate-300"><label><input type="checkbox" defaultChecked /> Acepto aviso de privacidad.</label><br /><label><input type="checkbox" defaultChecked /> Acepto términos y condiciones.</label><br /><label><input type="checkbox" defaultChecked /> Consiento procesamiento con IA.</label></div>
        <div className="mt-6 flex gap-3"><Button className="bg-amber-300 text-slate-950 hover:bg-amber-200">Registrarme</Button><Link className="rounded-2xl border border-white/20 px-4 py-2.5 font-bold" href="/login">Ya tengo cuenta</Link></div>
        {message && <p className="mt-4 text-amber-200">{message}</p>}
      </form>
    </main>
  );
}
