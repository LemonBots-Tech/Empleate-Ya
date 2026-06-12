import { jsonError, jsonOk } from "@/lib/api/response";
import { getStore } from "@/lib/mockdb/store";
import { requireSuperAdmin } from "@/services/authService";

type FrankfurterResponse = {
  date?: string;
  rates?: Record<string, number>;
};

async function fetchUsdMxnRate() {
  const endpoints = [
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN",
    "https://api.frankfurter.app/latest?from=USD&to=MXN",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { next: { revalidate: 60 * 60 } });
      if (!response.ok) continue;
      const data = await response.json() as FrankfurterResponse;
      const rate = data.rates?.MXN;
      if (typeof rate === "number" && Number.isFinite(rate)) {
        return { rate, date: data.date, source: endpoint };
      }
    } catch {
      // Try the next provider shape before falling back to stored policy.
    }
  }

  return null;
}

export async function GET() {
  try {
    await requireSuperAdmin();
    const liveRate = await fetchUsdMxnRate();
    if (liveRate) {
      return jsonOk({
        base: "USD",
        quote: "MXN",
        rate: liveRate.rate,
        date: liveRate.date,
        source: liveRate.source,
        fallback: false,
      });
    }

    return jsonOk({
      base: "USD",
      quote: "MXN",
      rate: getStore().creditPolicy.usdToMxnRate,
      date: getStore().creditPolicy.effectiveFrom,
      source: "stored_credit_policy",
      fallback: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
