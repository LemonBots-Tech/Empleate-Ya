import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminCatalogsClient } from "@/components/employability/AdminCatalogsClient";

export default function AdminCatalogsPage() {
  return (
    <EmployabilityShell>
      <AdminCatalogsClient />
    </EmployabilityShell>
  );
}
