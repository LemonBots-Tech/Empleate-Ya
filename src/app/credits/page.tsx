"use client";

import { useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { Button } from "@/components/ui/Button";

export default function CreditsPage() {
  const [message, setMessage] = useState("");
  async function purchase() {
    const response = await fetch("/api/credits/mock-purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: 500 }) });
    setMessage(response.ok ? "Compra mock aplicada." : JSON.stringify(await response.json()));
  }
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Créditos</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] bg-amber-300 p-6 text-slate-950"><p className="text-sm font-bold">Saldo demo inicial</p><p className="mt-2 text-5xl font-black">250</p><p>1 crédito ≈ $1 MXN comercial.</p></div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:col-span-2"><h2 className="text-2xl font-black">Historial y ledger</h2><p className="mt-2 text-slate-300">Toda compra, uso, ajuste y reembolso queda registrado en credit_ledger con balance antes/después.</p><Button onClick={purchase} className="mt-5 bg-blue-600">Comprar 500 créditos mock</Button>{message && <p className="mt-4 text-amber-200">{message}</p>}</div>
      </div>
    </EmployabilityShell>
  );
}
