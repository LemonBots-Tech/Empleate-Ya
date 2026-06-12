"use client";

import { useEffect, useState } from "react";
import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { Button } from "@/components/ui/Button";

type LedgerEntry = {
  id: string;
  type: "purchase" | "usage" | "refund" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

type Statement = {
  wallet: { balance: number; currency: string };
  totals: { purchased: number; granted: number; consumed: number; refunded: number };
  entries: LedgerEntry[];
};

export default function CreditsPage() {
  const [message, setMessage] = useState("");
  const [statement, setStatement] = useState<Statement | null>(null);

  async function loadStatement() {
    const response = await fetch("/api/credits/statement");
    const data = await response.json();
    if (response.ok) setStatement(data.statement);
    else setMessage(data.error ?? "No se pudo cargar el estado de cuenta.");
  }

  useEffect(() => {
    void loadStatement();
  }, []);

  async function purchase() {
    const response = await fetch("/api/credits/mock-purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: 500 }) });
    setMessage(response.ok ? "Compra mock aplicada." : JSON.stringify(await response.json()));
    await loadStatement();
  }

  return (
    <EmployabilityShell>
      <div className="space-y-7">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">Estado de cuenta</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Creditos</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Cada ejecucion de avatar registra fecha, hora, consumo, saldo anterior y saldo restante.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Saldo actual" value={`${statement?.wallet.balance ?? 0}`} />
          <Metric label="Comprados" value={`${statement?.totals.purchased ?? 0}`} />
          <Metric label="Otorgados" value={`${statement?.totals.granted ?? 0}`} />
          <Metric label="Consumidos" value={`${statement?.totals.consumed ?? 0}`} />
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Movimientos</h2>
              <p className="text-sm text-slate-500">Este historial sera la base para el estado mensual descargable.</p>
            </div>
            <Button onClick={purchase} className="bg-slate-950 text-white">Comprar 500 creditos mock</Button>
          </div>
          {message ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</p> : null}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr><Th>Fecha/hora</Th><Th>Movimiento</Th><Th>Creditos</Th><Th>Saldo</Th><Th>Detalle</Th></tr></thead>
              <tbody>
                {statement?.entries.length ? statement.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                    <Td>{new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.createdAt))}</Td>
                    <Td>{entry.type}</Td>
                    <Td><strong className={entry.amount < 0 ? "text-rose-700" : "text-emerald-700"}>{entry.amount}</strong></Td>
                    <Td>{entry.balanceBefore} -&gt; {entry.balanceAfter}</Td>
                    <Td>{entry.description}</Td>
                  </tr>
                )) : (
                  <tr><Td>No hay movimientos todavia.</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </EmployabilityShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><strong className="mt-2 block text-3xl font-black text-[var(--brand-primary)]">{value}</strong></div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-slate-600">{children}</td>;
}
