/**
 * Shares tRPC Router — share link generation, click tracking, and invite rewards.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createShare,
  recordShareClick,
  awardInviteBonus,
  getShareStats,
  ensureInviteCode,
} from "./shares";

export const sharesRouter = router({
  /**
   * POST /shares.create
   * Generate a share link for the current user.
   * Returns the shareUrl with the user's inviteCode as ref param.
   */
  create: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["line", "facebook", "twitter", "instagram", "copy", "other"]),
        birthday: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createShare(ctx.user.id, input.platform, input.birthday);
    }),

  /**
   * POST /shares.recordClick
   * Record a click on a share link (called when visitor lands with ?ref= param).
   * This is a public procedure — visitor may not be logged in yet.
   */
  recordClick: publicProcedure
    .input(
      z.object({
        inviteCode: z.string().min(1).max(16),
      })
    )
    .mutation(async ({ input }) => {
      return recordShareClick(input.inviteCode);
    }),

  /**
   * POST /shares.claimInviteBonus
   * Called after an invitee completes their first calculation.
   * Awards +20 to inviter, +10 to invitee.
   */
  claimInviteBonus: protectedProcedure
    .input(
      z.object({
        inviteCode: z.string().min(1).max(16),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Look up the inviter by invite code
      const { getDb } = await import("./db");
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [inviter] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.inviteCode, input.inviteCode))
        .limit(1);

      if (!inviter) {
        return { inviterAwarded: false, inviteeAwarded: false };
      }

      return awardInviteBonus(inviter.id, ctx.user.id, input.inviteCode);
    }),

  /**
   * GET /shares.stats
   * Get the current user's share statistics.
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    return getShareStats(ctx.user.id);
  }),

  /**
   * GET /shares.inviteCode
   * Get or generate the current user's invite code.
   */
  inviteCode: protectedProcedure.query(async ({ ctx }) => {
    const code = await ensureInviteCode(ctx.user.id);
    return { inviteCode: code };
  }),
});
