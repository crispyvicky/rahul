import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardGymData } from "@/lib/gym-plan-service";
import { invalidUserIdResponse, isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (!isUuidUserId(userId)) {
    return invalidUserIdResponse();
  }

  const data = await fetchDashboardGymData(userId);
  if (!data) {
    return NextResponse.json({ error: "No data" }, { status: 404 });
  }

  return NextResponse.json(data);
}
