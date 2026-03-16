/**
 * Points Service — all database operations for the points/credits system.
 *
 * Actions:
 *   first_calc   +30  (once per account)
 *   checkin       +5  (24h cooldown)
 *   share_click  +10  (per share, one click counted)
 *   invite       +20  (inviter gets this when invitee completes calc)
 *   invited      +10  (invitee gets this, once per account)
 *   share_card   +15  (daily limit)
 *   unlock       -30  (permanent unlock)
 */

import { eq, sql, and } from "drizzle-orm";
import { getDb } from "./db";
import { users, profiles, pointsLog } from "../drizzle/schema";

// ─── Constants ──────────────────────────────────────────────────────
export const POINTS = {
  FIRST_CALC: 30,
  CHECKIN: 5,
  SHARE_CLICK: 10,
  INVITE: 20,
  INVITED: 10,
  SHARE_CARD: 15,
  UNLOCK_SUBCONSCIOUS: 30, // cost (will be negated)
} as const;

const CHECKIN_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Helpers ────────────────────────────────────────────────────────

/** Add points to a user and log the transaction. Returns the new balance. */
async function addPoints(
  userId: number,
  amount: number,
  action: string,
  description?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update user balance atomically
  await db
    .update(users)
    .set({ points: sql`${users.points} + ${amount}` })
    .where(eq(users.id, userId));

  // Log the transaction
  await db.insert(pointsLog).values({
    userId,
    action,
    amount,
    description: description ?? null,
  });

  // Return updated balance
  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.points ?? 0;
}

// ─── Public API ─────────────────────────────────────────────────────

/** Get current points balance for a user. */
export async function getPoints(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.points ?? 0;
}

/** Get user's points status — balance + flags for UI display. */
export async function getPointsStatus(userId: number): Promise<{
  points: number;
  isFirstCalc: boolean;
  lastCheckinAt: Date | null;
  canCheckin: boolean;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db
    .select({
      points: users.points,
      isFirstCalc: users.isFirstCalc,
      lastCheckinAt: users.lastCheckinAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  const now = Date.now();
  const lastCheckin = user.lastCheckinAt ? new Date(user.lastCheckinAt).getTime() : 0;
  const canCheckin = now - lastCheckin >= CHECKIN_COOLDOWN_MS;

  return {
    points: user.points,
    isFirstCalc: user.isFirstCalc,
    lastCheckinAt: user.lastCheckinAt,
    canCheckin,
  };
}

/**
 * Award first-calculation bonus (+30).
 * Returns { awarded, points } — awarded=false if already claimed.
 */
export async function awardFirstCalc(userId: number): Promise<{
  awarded: boolean;
  points: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already awarded
  const [user] = await db
    .select({ isFirstCalc: users.isFirstCalc, points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");
  if (user.isFirstCalc) {
    return { awarded: false, points: user.points };
  }

  // Mark as claimed
  await db
    .update(users)
    .set({ isFirstCalc: true })
    .where(eq(users.id, userId));

  const newBalance = await addPoints(
    userId,
    POINTS.FIRST_CALC,
    "first_calc",
    "新手禮包：首次完成生日計算"
  );

  return { awarded: true, points: newBalance };
}

/**
 * Daily check-in (+5).
 * Returns { success, points, nextCheckinAt } — success=false if on cooldown.
 */
export async function checkin(userId: number): Promise<{
  success: boolean;
  points: number;
  nextCheckinAt: Date | null;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db
    .select({ lastCheckinAt: users.lastCheckinAt, points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  const now = new Date();
  const lastCheckin = user.lastCheckinAt ? new Date(user.lastCheckinAt).getTime() : 0;

  if (now.getTime() - lastCheckin < CHECKIN_COOLDOWN_MS) {
    return {
      success: false,
      points: user.points,
      nextCheckinAt: new Date(lastCheckin + CHECKIN_COOLDOWN_MS),
    };
  }

  // Update lastCheckinAt
  await db
    .update(users)
    .set({ lastCheckinAt: now })
    .where(eq(users.id, userId));

  const newBalance = await addPoints(userId, POINTS.CHECKIN, "checkin", "每日簽到");

  return {
    success: true,
    points: newBalance,
    nextCheckinAt: new Date(now.getTime() + CHECKIN_COOLDOWN_MS),
  };
}

/**
 * Unlock subconscious reading (-30).
 * Sets profile.unlockedSubconscious = true.
 * Returns { success, points } — success=false if insufficient balance or already unlocked.
 */
export async function unlockSubconscious(
  userId: number,
  profileId: number
): Promise<{
  success: boolean;
  points: number;
  reason?: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already unlocked
  const [profile] = await db
    .select({ unlockedSubconscious: profiles.unlockedSubconscious })
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .limit(1);

  if (!profile) {
    return { success: false, points: 0, reason: "找不到對應的靈數檔案" };
  }
  if (profile.unlockedSubconscious) {
    const balance = await getPoints(userId);
    return { success: false, points: balance, reason: "已經解鎖過了" };
  }

  // Check balance
  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");
  if (user.points < POINTS.UNLOCK_SUBCONSCIOUS) {
    return {
      success: false,
      points: user.points,
      reason: `積分不足，需要 ${POINTS.UNLOCK_SUBCONSCIOUS} 積分，目前只有 ${user.points} 積分`,
    };
  }

  // Deduct points
  const newBalance = await addPoints(
    userId,
    -POINTS.UNLOCK_SUBCONSCIOUS,
    "unlock",
    "解鎖潛意識密碼"
  );

  // Mark profile as unlocked
  await db
    .update(profiles)
    .set({ unlockedSubconscious: true })
    .where(eq(profiles.id, profileId));

  return { success: true, points: newBalance };
}

/**
 * Save or get a numerology profile for a user.
 * If a profile with the same birthday already exists, return it.
 * Otherwise, create a new one.
 */
export async function upsertProfile(
  userId: number,
  data: {
    birthday: string;
    zodiacSign: string;
    mainNumber: number;
    behaviorNumber: number;
    traitNumber: number;
    yearNumber: number;
    digitSum: number;
    birthDayNum: number;
  }
): Promise<{
  profileId: number;
  unlockedSubconscious: boolean;
  isNew: boolean;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if profile already exists for this user + birthday
  const [existing] = await db
    .select({
      id: profiles.id,
      unlockedSubconscious: profiles.unlockedSubconscious,
    })
    .from(profiles)
    .where(and(eq(profiles.userId, userId), eq(profiles.birthday, data.birthday)))
    .limit(1);

  if (existing) {
    return {
      profileId: existing.id,
      unlockedSubconscious: existing.unlockedSubconscious,
      isNew: false,
    };
  }

  // Create new profile
  const [result] = await db.insert(profiles).values({
    userId,
    ...data,
  }).$returningId();

  return {
    profileId: result.id,
    unlockedSubconscious: false,
    isNew: true,
  };
}

/**
 * Get points transaction history for a user.
 */
export async function getPointsHistory(
  userId: number,
  limit = 20
): Promise<Array<{
  action: string;
  amount: number;
  description: string | null;
  createdAt: Date;
}>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db
    .select({
      action: pointsLog.action,
      amount: pointsLog.amount,
      description: pointsLog.description,
      createdAt: pointsLog.createdAt,
    })
    .from(pointsLog)
    .where(eq(pointsLog.userId, userId))
    .orderBy(sql`${pointsLog.createdAt} DESC`)
    .limit(limit);

  return rows;
}
