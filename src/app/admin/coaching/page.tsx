import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminCoachingCoursesClient } from "@/components/employability/AdminCoachingCoursesClient";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";

export default function AdminCoachingPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminCoachingCoursesClient />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
