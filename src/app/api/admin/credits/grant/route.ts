import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireSuperAdmin } from "@/services/authService";
import { grantCredits } from "@/services/creditService";

const grantSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().int().min(1).max(100000),
  reason: z.string().min(5).max(300),
});

export async function POST(request: Request) {
  try {
    const admin = await requireSuperAdmin();
    const input = grantSchema.parse(await request.json());
    return jsonOk(grantCredits(input.userId, input.amount, `Credito extraordinario super admin: ${input.reason}`, admin.id));
  } catch (error) {
    return jsonError(error);
  }
}
