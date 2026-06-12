import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { OfferPlaceholder } from "@/components/employability/OfferPlaceholder";

export default function CoachingPage() {
  return (
    <EmployabilityShell>
      <OfferPlaceholder kind="coaching" />
    </EmployabilityShell>
  );
}
