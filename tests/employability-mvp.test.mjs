import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("careerOrchestrator contiene clasificación de intención y reportes formateados", () => {
  const source = readFileSync("src/services/careerOrchestrator.ts", "utf8");
  assert.match(source, /detectModules/);
  assert.match(source, /needs_input/);
  assert.match(source, /ScoreX evaluación inicial/);
  assert.match(source, /Optim optimización de CV/);
  assert.match(source, /buildFormattedReport/);
});

test("creditService valida saldo y registra credit_ledger", () => {
  const source = readFileSync("src/services/creditService.ts", "utf8");
  assert.match(source, /assertSufficientCredits/);
  assert.match(source, /INSUFFICIENT_CREDITS/);
  assert.match(source, /balanceBefore/);
  assert.match(source, /balanceAfter/);
});
