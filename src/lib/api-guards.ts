import { NextResponse } from "next/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidUserId(id: unknown): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}

export function invalidUserIdResponse() {
  return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
}
