import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminPlaceholderClient } from "@/components/employability/AdminPlaceholderClient";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";

export default function AdminPaymentsPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminPlaceholderClient moduleKey="payments" />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
