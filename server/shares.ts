/**
 * Shares & Referrals Service — handles share link generation, click tracking,
 * and invite reward logic.
 *
 * Flow:
 *   1. User clicks "分享" → createShare() → returns a shareCode
 *   2. Visitor opens /?ref=<shareCode> → recordClick() → +10 to sharer (first click only)
 *   3. Visitor completes first calc → awardInviteBonus() → +20 to inviter, +10 to invitee
 *
 * Invite code flow (users.inviteCode):
 *   - Each user gets a persistent inviteCode on first share.
 *   - The ref param uses this inviteCode to link inviter → invitee.
 */

import { eq, sql, and } from "drizzle-orm";
import { getDb } from "./db";
import { users, shares, referrals, pointsLog } from "../drizzle/schema";
import { POINTS } from "./points";
import crypto from "crypto";

// ─── Helpers ────────────────────────────────────────────────────────

/** Generate a short random code (8 chars, URL-safe). */
function generateCode(length = 8): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

/** Internal: add points + log (reused from points.ts pattern). */
async function addPoints(
  userId: number,
  amount: number,
  action: string,
  description?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ points: sql`${users.points} + ${amount}` })
    .where(eq(users.id, userId));

  await db.insert(pointsLog).values({
    userId,
    action,
    amount,
    description: description ?? null,
  });

  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.points ?? 0;
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Ensure the user has a persistent inviteCode.
 * If they don't have one yet, generate and save it.
 * Returns the inviteCode.
 */
export async function ensureInviteCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db
    .select({ inviteCode: users.inviteCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  if (user.inviteCode) return user.inviteCode;

  // Generate a unique code (retry on collision)
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.inviteCode, code))
      .limit(1);

    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  await db
    .update(users)
    .set({ inviteCode: code })
    .where(eq(users.id, userId));

  return code;
}

/**
 * Create a share record.
 * Returns the share ID and the user's inviteCode (used as the ref param).
 */
export async function createShare(
  userId: number,
  platform: string,
  birthday?: string
): Promise<{
  shareId: number;
  inviteCode: string;
  shareUrl: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const inviteCode = await ensureInviteCode(userId);

  // Build the share URL with ref param
  const baseUrl = process.env.VITE_APP_URL || "";
  const shareUrl = birthday
    ? `${baseUrl}/?ref=${inviteCode}&b=${birthday}`
    : `${baseUrl}/?ref=${inviteCode}`;

  const [result] = await db
    .insert(shares)
    .values({
      userId,
      platform,
      shareUrl,
      clickCount: 0,
      conversionCount: 0,
      pointsAwarded: false,
    })
    .$returningId();

  return {
    shareId: result.id,
    inviteCode,
    shareUrl,
  };
}

/**
 * Record a click on a share link.
 * Awards +10 to the sharer on the FIRST click of each share record.
 *
 * @param inviteCode - The ref param from the URL
 * @returns The inviter's userId (for referral tracking) or null if invalid
 */
export async function recordShareClick(inviteCode: string): Promise<{
  inviterUserId: number | null;
  pointsAwarded: boolean;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find the user who owns this invite code
  const [inviter] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.inviteCode, inviteCode))
    .limit(1);

  if (!inviter) {
    return { inviterUserId: null, pointsAwarded: false };
  }

  // Find the most recent share record for this user that hasn't been awarded yet
  const [share] = await db
    .select({ id: shares.id, pointsAwarded: shares.pointsAwarded, clickCount: shares.clickCount })
    .from(shares)
    .where(and(eq(shares.userId, inviter.id), eq(shares.pointsAwarded, false)))
    .orderBy(sql`${shares.createdAt} DESC`)
    .limit(1);

  if (share) {
    // Increment click count
    await db
      .update(shares)
      .set({ clickCount: sql`${shares.clickCount} + 1` })
      .where(eq(shares.id, share.id));

    // Award points on first click only
    if (!share.pointsAwarded) {
      await db
        .update(shares)
        .set({ pointsAwarded: true })
        .where(eq(shares.id, share.id));

      await addPoints(
        inviter.id,
        POINTS.SHARE_CLICK,
        "share_click",
        "分享連結被點擊 +10"
      );

      return { inviterUserId: inviter.id, pointsAwarded: true };
    }
  }

  return { inviterUserId: inviter.id, pointsAwarded: false };
}

/**
 * Award invite bonus when an invitee completes their first calculation.
 * Inviter gets +20, invitee gets +10.
 * Only awards once per inviter-invitee pair.
 */
export async function awardInviteBonus(
  inviterUserId: number,
  inviteeUserId: number,
  inviteCode: string
): Promise<{
  inviterAwarded: boolean;
  inviteeAwarded: boolean;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Prevent self-referral
  if (inviterUserId === inviteeUserId) {
    return { inviterAwarded: false, inviteeAwarded: false };
  }

  // Check if this pair already has a referral record
  const [existing] = await db
    .select({ id: referrals.id, pointsAwarded: referrals.pointsAwarded })
    .from(referrals)
    .where(
      and(
        eq(referrals.inviterId, inviterUserId),
        eq(referrals.inviteeId, inviteeUserId)
      )
    )
    .limit(1);

  if (existing?.pointsAwarded) {
    return { inviterAwarded: false, inviteeAwarded: false };
  }

  // Create or update referral record
  if (!existing) {
    await db.insert(referrals).values({
      inviterId: inviterUserId,
      inviteeId: inviteeUserId,
      inviteCode,
      pointsAwarded: true,
    });
  } else {
    await db
      .update(referrals)
      .set({ pointsAwarded: true })
      .where(eq(referrals.id, existing.id));
  }

  // Award inviter +20
  await addPoints(
    inviterUserId,
    POINTS.INVITE,
    "invite",
    "邀請好友完成計算 +20"
  );

  // Award invitee +10
  await addPoints(
    inviteeUserId,
    POINTS.INVITED,
    "invited",
    "受邀首次完成計算 +10"
  );

  // Increment conversion count on the most recent share
  const [share] = await db
    .select({ id: shares.id })
    .from(shares)
    .where(eq(shares.userId, inviterUserId))
    .orderBy(sql`${shares.createdAt} DESC`)
    .limit(1);

  if (share) {
    await db
      .update(shares)
      .set({ conversionCount: sql`${shares.conversionCount} + 1` })
      .where(eq(shares.id, share.id));
  }

  return { inviterAwarded: true, inviteeAwarded: true };
}

/**
 * Get a user's share statistics.
 */
export async function getShareStats(userId: number): Promise<{
  totalShares: number;
  totalClicks: number;
  totalConversions: number;
  inviteCode: string | null;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db
    .select({ inviteCode: users.inviteCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const stats = await db
    .select({
      totalShares: sql<number>`COUNT(*)`,
      totalClicks: sql<number>`COALESCE(SUM(${shares.clickCount}), 0)`,
      totalConversions: sql<number>`COALESCE(SUM(${shares.conversionCount}), 0)`,
    })
    .from(shares)
    .where(eq(shares.userId, userId));

  return {
    totalShares: Number(stats[0]?.totalShares ?? 0),
    totalClicks: Number(stats[0]?.totalClicks ?? 0),
    totalConversions: Number(stats[0]?.totalConversions ?? 0),
    inviteCode: user?.inviteCode ?? null,
  };
}
