import { EmployabilityShell } from "@/components/employability/EmployabilityShell";
import { GatewayPageClient } from "@/components/employability/GatewayPageClient";

export default async function GatewayPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { module } = await searchParams;
  return (
    <EmployabilityShell>
      <GatewayPageClient selectedModule={module} />
    </EmployabilityShell>
  );
}
