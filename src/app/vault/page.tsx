import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

const artifactTypes = ["CV optimizado", "Reporte ScoreX", "Comparativo antes/después", "LinkedIn optimizado", "Elevator pitch", "Reporte de entrevista", "Fotos profesionales"];

export default function VaultPage() {
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Mi Bóveda / Mis Entregables</h1>
      <p className="mt-3 text-slate-300">Los artifacts generados por el orquestador se guardan con control de usuario, versión, estado y descargas seguras.</p>
      <div className="mt-6 flex flex-wrap gap-2">{artifactTypes.map((type) => <span key={type} className="rounded-full bg-white/10 px-3 py-2 text-sm">{type}</span>)}</div>
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">Artifacts recientes</h2>
        <p className="mt-2 text-slate-300">Ejecuta un plan desde Prompt Gateway para crear entregables mock. Endpoints disponibles: GET /api/artifacts, GET /api/artifacts/:id, duplicate, download y delete.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {artifactTypes.slice(0, 3).map((type) => <div key={type} className="rounded-2xl bg-slate-900 p-4"><h3 className="font-bold">{type}</h3><p className="mt-2 text-sm text-slate-400">Botones: ver · descargar · duplicar · eliminar · nueva versión</p></div>)}
        </div>
      </div>
    </EmployabilityShell>
  );
}
