import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";
import { AdminUsersClient } from "@/components/employability/AdminUsersClient";

export default function AdminOutplacementRhUsersPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminUsersClient userKind="outplacement-rh" />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
