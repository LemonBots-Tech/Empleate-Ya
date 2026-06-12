import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 400 });
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (error.message === "NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (error.message === "EMAIL_EXISTS") return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
    if (error.message === "CATALOG_ITEM_EXISTS") return NextResponse.json({ error: "CATALOG_ITEM_EXISTS" }, { status: 409 });
    if (error.message === "INVALID_CREDENTIALS") return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    if (error.message === "INSUFFICIENT_CREDITS") return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 402 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ error: "UNKNOWN_ERROR" }, { status: 500 });
}
