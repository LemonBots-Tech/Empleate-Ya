"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (response.ok) {
      setMessage("Sesion iniciada. Abriendo tu perfil...");
      router.push("/account");
      return;
    }

    setMessage(JSON.stringify(await response.json()));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <form action={submit} className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-black">Login</h1>
        <Input className="mt-6" name="email" type="email" placeholder="email" required />
        <Input className="mt-4" name="password" type="password" placeholder="contrasena" required />
        <div className="mt-6 flex gap-3">
          <Button className="bg-blue-600">Entrar</Button>
          <Link className="rounded-2xl border border-white/20 px-4 py-2.5 font-bold" href="/register">
            Crear cuenta
          </Link>
        </div>
        {message ? <p className="mt-4 text-amber-200">{message}</p> : null}
      </form>
    </main>
  );
}
