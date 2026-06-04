import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/services/authService";
import { analyzePrompt } from "@/services/careerOrchestrator";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    return jsonOk(await analyzePrompt({ ...body, userId: user.id, execute: false }));
  } catch (error) {
    return jsonError(error);
  }
}
