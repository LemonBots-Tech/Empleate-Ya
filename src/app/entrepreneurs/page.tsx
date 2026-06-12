import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { OfferPlaceholder } from "@/components/employability/OfferPlaceholder";

export default function EntrepreneursPage() {
  return (
    <EmployabilityShell>
      <OfferPlaceholder kind="entrepreneurs" />
    </EmployabilityShell>
  );
}
