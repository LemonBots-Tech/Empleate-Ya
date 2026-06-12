import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { AdminConsoleClient } from "@/components/employability/AdminConsoleClient";

export default function AdminCampaignsPage() {
  return (
    <EmployabilityShell>
      <AdminConsoleClient />
    </EmployabilityShell>
  );
}
