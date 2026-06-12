import { jsonError, jsonOk } from "@/lib/api/response";
import { requireSuperAdmin } from "@/services/authService";
import { getLedgerByPeriod, getWallet } from "@/services/creditService";
import { getStore } from "@/lib/mockdb/store";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;
    const entries = getLedgerByPeriod({ userId, from, to });
    const db = getStore();
    const rows = entries.map((entry) => {
      const user = db.users.find((item) => item.id === entry.userId);
      const wallet = getWallet(entry.userId);
      return {
        ...entry,
        userName: user ? `${user.firstName} ${user.lastName}` : "Usuario no encontrado",
        userEmail: user?.email,
        currentBalance: wallet.balance,
      };
    });
    return jsonOk({
      report: {
        period: { from, to },
        totals: {
          purchased: entries.filter((entry) => entry.type === "purchase").reduce((total, entry) => total + entry.amount, 0),
          granted: entries.filter((entry) => entry.type === "adjustment").reduce((total, entry) => total + entry.amount, 0),
          consumed: Math.abs(entries.filter((entry) => entry.type === "usage").reduce((total, entry) => total + entry.amount, 0)),
          refunded: entries.filter((entry) => entry.type === "refund").reduce((total, entry) => total + entry.amount, 0),
        },
        rows,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
