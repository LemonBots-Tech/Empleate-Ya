import { jsonError, jsonOk } from "@/lib/api/response";
import { loginSchema, loginUser, setSession } from "@/services/authService";
import { toPublicUser } from "@/lib/mockdb/store";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = loginUser(input.email, input.password);
    await setSession(user.id);
    return jsonOk({ user: toPublicUser(user) });
  } catch (error) {
    return jsonError(error);
  }
}
