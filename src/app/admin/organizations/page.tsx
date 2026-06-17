import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";
import { AdminOrganizationsClient } from "@/components/employability/AdminOrganizationsClient";

export default function AdminOrganizationsPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminOrganizationsClient />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
