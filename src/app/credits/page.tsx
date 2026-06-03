"use client";

import { useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

export default function CreditsPage() {
  const [message, setMessage] = useState("");

  async function purchase() {
    const response = await fetch("/api/credits/mock-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 500 }),
    });

    setMessage(response.ok ? "Compra mock aplicada." : JSON.stringify(await response.json()));
  }

  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Créditos</h1>

      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-slate-300">Saldo demo inicial: 250 créditos.</p>

        <button onClick={purchase} className="mt-5 rounded-2xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-500">
          Comprar 500 créditos mock
        </button>

        {message ? <p className="mt-4 text-amber-200">{message}</p> : null}
      </div>
    </EmployabilityShell>
  );
}
