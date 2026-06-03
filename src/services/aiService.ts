export type AiServiceResult<T> = {
  output: T;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  estimatedCostMxn: number;
};

export async function runMockAgent<T>(output: T): Promise<AiServiceResult<T>> {
  return {
    output,
    inputTokens: 900,
    outputTokens: 650,
    estimatedCostUsd: 0,
    estimatedCostMxn: 0,
  };
}
