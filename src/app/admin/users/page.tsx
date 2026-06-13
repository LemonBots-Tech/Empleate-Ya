import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminUsersClient } from "@/components/employability/AdminUsersClient";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";

export default function AdminUsersPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminUsersClient />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
