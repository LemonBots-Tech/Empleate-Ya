import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminConsoleClient } from "@/components/employability/AdminConsoleClient";

export default function AdminOrganizationsPage() {
  return (
    <EmployabilityShell>
      <AdminConsoleClient />
    </EmployabilityShell>
  );
}
