import { jsonError, jsonOk } from "@/lib/api/response";
import { registerUser, setSession } from "@/services/authService";
import { toPublicUser } from "@/lib/mockdb/store";

export async function POST(request: Request) {
  try {
    const user = registerUser(await request.json(), request.headers.get("x-forwarded-for") ?? undefined);
    await setSession(user.id);
    return jsonOk({ user: toPublicUser(user) }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
