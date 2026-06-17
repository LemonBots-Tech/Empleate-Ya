import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";
import { AdminPlaceholderClient } from "@/components/employability/AdminPlaceholderClient";

export default function AdminGroupsPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminPlaceholderClient moduleKey="groups" />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
