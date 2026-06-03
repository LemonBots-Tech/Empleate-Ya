import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

export default function VaultPage() {
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Mi Bóveda / Mis Entregables</h1>
      <p className="mt-3 text-slate-300">
        Aquí se listarán los artifacts generados por el orquestador: CVs, reportes ScoreX, pitches, LinkedIn, entrevistas y más.
      </p>
    </EmployabilityShell>
  );
}
