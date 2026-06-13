import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";
import { AdminUsersClient } from "@/components/employability/AdminUsersClient";

export default function AdminSuperAdminSupportUsersPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminUsersClient userKind="super-admin-support" />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
