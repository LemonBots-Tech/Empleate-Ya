import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { PromptGatewayClient } from "@/components/employability/PromptGatewayClient";

export default function GatewayPage() {
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Prompt Gateway</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Una sola API central recibe el prompt, detecta intención, valida créditos e insumos, y ejecuta módulos internos mock para la Fase 1.
      </p>

      <div className="mt-8">
        <PromptGatewayClient />
      </div>
    </EmployabilityShell>
  );
}
