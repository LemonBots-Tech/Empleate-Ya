import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { OfferPlaceholder } from "@/components/employability/OfferPlaceholder";

export default function BusinessServicesPage() {
  return (
    <EmployabilityShell>
      <OfferPlaceholder kind="business" />
    </EmployabilityShell>
  );
}
