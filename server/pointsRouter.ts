/**
 * Points tRPC Router — all points-related API endpoints.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getPointsStatus,
  awardFirstCalc,
  checkin,
  unlockSubconscious,
  upsertProfile,
  getPointsHistory,
  POINTS,
} from "./points";

export const pointsRouter = router({
  /**
   * GET /points.status
   * Returns current balance, flags, and check-in availability.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    return getPointsStatus(ctx.user.id);
  }),

  /**
   * POST /points.firstCalc
   * Award the +30 first-calculation bonus.
   * Also upserts the numerology profile.
   */
  firstCalc: protectedProcedure
    .input(
      z.object({
        birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        zodiacSign: z.string(),
        mainNumber: z.number().int().min(1).max(9),
        behaviorNumber: z.number().int().min(0).max(21),
        traitNumber: z.number().int().min(1).max(21),
        yearNumber: z.number().int().min(1).max(9),
        digitSum: z.number().int(),
        birthDayNum: z.number().int().min(1).max(31),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert the profile first
      const profileResult = await upsertProfile(ctx.user.id, input);

      // Award first-calc bonus (idempotent — won't double-award)
      const pointsResult = await awardFirstCalc(ctx.user.id);

      return {
        ...pointsResult,
        profileId: profileResult.profileId,
        unlockedSubconscious: profileResult.unlockedSubconscious,
        isNewProfile: profileResult.isNew,
      };
    }),

  /**
   * POST /points.checkin
   * Daily check-in for +5 points.
   */
  checkin: protectedProcedure.mutation(async ({ ctx }) => {
    return checkin(ctx.user.id);
  }),

  /**
   * POST /points.unlock
   * Spend 30 points to permanently unlock subconscious reading.
   */
  unlock: protectedProcedure
    .input(
      z.object({
        profileId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return unlockSubconscious(ctx.user.id, input.profileId);
    }),

  /**
   * GET /points.history
   * Get recent points transactions.
   */
  history: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return getPointsHistory(ctx.user.id, input?.limit ?? 20);
    }),

  /**
   * GET /points.config
   * Return points configuration for the frontend to display.
   * Public-ish but still requires auth to prevent scraping.
   */
  config: protectedProcedure.query(() => {
    return {
      firstCalc: POINTS.FIRST_CALC,
      checkin: POINTS.CHECKIN,
      shareClick: POINTS.SHARE_CLICK,
      invite: POINTS.INVITE,
      invited: POINTS.INVITED,
      shareCard: POINTS.SHARE_CARD,
      unlockCost: POINTS.UNLOCK_SUBCONSCIOUS,
    };
  }),
});
