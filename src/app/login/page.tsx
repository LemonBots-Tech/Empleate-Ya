"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    setMessage(response.ok ? "Sesión iniciada. Abre el dashboard." : JSON.stringify(await response.json()));
  }
  return (
    <main className="min-h-screen bg-[var(--brand-canvas)] px-5 py-16 text-[var(--brand-ink)]">
      <form action={submit} className="mx-auto max-w-md rounded-[2rem] border border-[var(--brand-border)] bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black">Iniciar sesión</h1>
        <Input className="mt-6" name="email" type="email" placeholder="email" required />
        <Input className="mt-4" name="password" type="password" placeholder="contraseña" required />
        <div className="mt-6 flex gap-3"><Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]">Entrar</Button><Link className="rounded-2xl border border-[var(--brand-border)] px-4 py-2.5 font-bold text-[var(--brand-primary-strong)]" href="/register">Crear cuenta</Link></div>
        {message && <p className="mt-4 text-[var(--brand-primary)]">{message}</p>}
      </form>
    </main>
  );
}
