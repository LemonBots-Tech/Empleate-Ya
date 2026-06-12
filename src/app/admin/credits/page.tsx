import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminCreditEconomicsClient } from "@/components/employability/AdminCreditEconomicsClient";
import { AdminSuperShell } from "@/components/employability/AdminSuperShell";

export default function AdminCreditsPage() {
  return (
    <EmployabilityShell>
      <AdminSuperShell>
        <AdminCreditEconomicsClient />
      </AdminSuperShell>
    </EmployabilityShell>
  );
}
