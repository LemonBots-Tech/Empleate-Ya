import { EmployabilityShell } from "@/components/employability/EmployabilityShell";

export default function AccountPage() {
  return (
    <EmployabilityShell>
      <h1 className="text-4xl font-black">Configuración y privacidad</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><h2 className="text-2xl font-black">Consentimientos MVP</h2><ul className="mt-3 space-y-2 text-slate-300"><li>✓ Aviso de privacidad</li><li>✓ Términos y condiciones</li><li>✓ Procesamiento con IA</li><li>• Imagen: requerido antes de Tommy Lee Picture</li><li>✓ Almacenamiento de entregables</li></ul></section>
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6"><h2 className="text-2xl font-black">Seguridad preparada</h2><ul className="mt-3 space-y-2 text-slate-300"><li>Hash PBKDF2 para contraseñas</li><li>Cookies httpOnly</li><li>Control de acceso por usuario en APIs</li><li>Auditoría de registro, login y ejecuciones</li><li>Eliminar cuenta/documentos en fase producción</li></ul></section>
      </div>
    </EmployabilityShell>
  );
}
