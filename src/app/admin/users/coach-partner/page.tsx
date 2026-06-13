import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";
import { AdminUsersClient } from "@/components/employability/AdminUsersClient";

export default function AdminCoachPartnerUsersPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminUsersClient userKind="coach-partner" />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
