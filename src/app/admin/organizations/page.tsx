import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminConsoleClient } from "@/components/employability/AdminConsoleClient";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";

export default function AdminOrganizationsPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminConsoleClient />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
