import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { VaultClient } from "./VaultClient";

export default function VaultPage() {
  return (
    <EmployabilityShell>
      <VaultClient />
    </EmployabilityShell>
  );
}
