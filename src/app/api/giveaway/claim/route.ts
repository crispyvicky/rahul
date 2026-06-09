import { NextResponse } from "next/server";
import {
  getUserProfileById,
  getUserRank,
  hasCompletedAction,
  hasCompletedActionToday,
} from "@/lib/supabase-service";
import { createPendingClaim } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import {
  assertBodyUserMatchesSession,
  AUTO_ONLY_ACTIONS,
  awardPointsSecure,
  canAwardPoints,
  POINT_ACTIONS,
  type PointActionKey,
} from "@/lib/points-service";

const PENDING_ACTIONS = new Set<PointActionKey>(["follow", "share_story"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId: bodyUserId, action, proofUrl, instagramUsername, phone } = body;

    if (!bodyUserId || !action || !(action in POINT_ACTIONS)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(bodyUserId);
    if ("error" in sessionCheck) return sessionCheck.error;
    const userId = sessionCheck.userId;

    const actionKey = action as PointActionKey;

    if (AUTO_ONLY_ACTIONS.has(actionKey)) {
      const autoMessages: Partial<Record<PointActionKey, string>> = {
        streak: "Login points are added automatically when you sign in.",
        refer: "Referral points are applied automatically when someone signs up with your link.",
        checkin:
          "Challenge check-in points are awarded when you complete a daily challenge (Challenges — coming soon).",
      };
      return NextResponse.json(
        {
          error: autoMessages[actionKey] || "This reward is applied automatically.",
        },
        { status: 400 }
      );
    }

    if (actionKey === "share_post") {
      return NextResponse.json(
        { error: "Post points are earned when you share a transformation in Community." },
        { status: 400 }
      );
    }

    if (PENDING_ACTIONS.has(actionKey) && hasSupabaseAdmin()) {
      if (!proofUrl || typeof proofUrl !== "string" || !proofUrl.trim()) {
        return NextResponse.json(
          {
            error:
              "Upload a screenshot first (follow or story proof), then submit your claim.",
          },
          { status: 400 }
        );
      }
      const done = await hasCompletedAction(userId, actionKey);
      if (done) {
        return NextResponse.json(
          { error: "You already claimed points for this action." },
          { status: 409 }
        );
      }
      const followMeta =
        actionKey === "follow"
          ? {
              instagramUsername:
                typeof instagramUsername === "string"
                  ? instagramUsername.trim().replace(/^@+/, "")
                  : "",
              phone: typeof phone === "string" ? phone.trim() : "",
            }
          : null;

      if (actionKey === "follow") {
        if (!followMeta?.instagramUsername) {
          return NextResponse.json(
            { error: "Instagram username is required for follow claims." },
            { status: 400 }
          );
        }
        if (!followMeta.phone || followMeta.phone.replace(/\D/g, "").length < 10) {
          return NextResponse.json(
            { error: "Valid phone number is required for follow claims." },
            { status: 400 }
          );
        }
      }

      const result = await createPendingClaim(
        userId,
        actionKey,
        proofUrl.trim(),
        followMeta?.instagramUsername || null,
        followMeta?.phone || null
      );
      if (!result.ok && result.error) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }
      return NextResponse.json({
        success: true,
        pending: true,
        message: "Submitted for admin review. Points apply after approval.",
      });
    }

    const eligible = await canAwardPoints(userId, actionKey);
    if (!eligible.allowed) {
      return NextResponse.json(
        {
          error:
            eligible.reason === "Already earned today"
              ? "You already claimed this reward today."
              : eligible.reason === "Already claimed"
                ? "You already claimed points for this action."
                : eligible.reason || "Not eligible",
        },
        { status: 409 }
      );
    }

    const { points } = POINT_ACTIONS[actionKey];
    const descriptions: Record<string, string> = {
      follow: "Followed @rahulfitzz on Instagram",
      share_story: "Shared RahulFitzz on Instagram Story",
      checkin: "Challenge check-in",
      workout: "Logged a workout",
    };

    const result = await awardPointsSecure(
      userId,
      actionKey,
      descriptions[actionKey] || `Claimed ${actionKey}`
    );

    if (result.duplicate) {
      return NextResponse.json(
        { error: "You already claimed this reward." },
        { status: 409 }
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Could not award points" },
        { status: 500 }
      );
    }

    const profile = await getUserProfileById(userId);
    const rank = await getUserRank(userId);

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      giveawayPoints: profile?.giveaway_points ?? 0,
      xpPoints: profile?.xp_points ?? 0,
      rank,
    });
  } catch (e) {
    console.error("[giveaway/claim]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
