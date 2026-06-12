import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminCatalogsClient } from "@/components/employability/AdminCatalogsClient";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";

export default function AdminCatalogsPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminCatalogsClient />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
