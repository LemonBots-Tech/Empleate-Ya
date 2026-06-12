import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminConsoleClient } from "@/components/employability/AdminConsoleClient";

export default function AdminUsersPage() {
  return (
    <EmployabilityShell>
      <AdminConsoleClient />
    </EmployabilityShell>
  );
}
