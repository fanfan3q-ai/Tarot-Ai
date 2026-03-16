/**
 * usePoints — React hook for points system state management.
 * Wraps tRPC queries/mutations with convenient helpers.
 */

import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export function usePoints() {
  const utils = trpc.useUtils();

  // ─── Queries ────────────────────────────────────────────────────
  const statusQuery = trpc.points.status.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Don't block rendering if user is not logged in
    enabled: true,
  });

  // ─── Mutations ──────────────────────────────────────────────────
  const firstCalcMutation = trpc.points.firstCalc.useMutation({
    onSuccess: () => {
      utils.points.status.invalidate();
    },
  });

  const checkinMutation = trpc.points.checkin.useMutation({
    onSuccess: () => {
      utils.points.status.invalidate();
    },
  });

  const unlockMutation = trpc.points.unlock.useMutation({
    onSuccess: () => {
      utils.points.status.invalidate();
    },
  });

  // ─── Actions ────────────────────────────────────────────────────

  const claimFirstCalc = useCallback(
    async (profileData: {
      birthday: string;
      zodiacSign: string;
      mainNumber: number;
      behaviorNumber: number;
      traitNumber: number;
      yearNumber: number;
      digitSum: number;
      birthDayNum: number;
    }) => {
      return firstCalcMutation.mutateAsync(profileData);
    },
    [firstCalcMutation]
  );

  const doCheckin = useCallback(async () => {
    return checkinMutation.mutateAsync();
  }, [checkinMutation]);

  const unlockSubconscious = useCallback(
    async (profileId: number) => {
      return unlockMutation.mutateAsync({ profileId });
    },
    [unlockMutation]
  );

  const refresh = useCallback(() => {
    utils.points.status.invalidate();
  }, [utils]);

  return {
    // State
    points: statusQuery.data?.points ?? 0,
    isFirstCalc: statusQuery.data?.isFirstCalc ?? false,
    canCheckin: statusQuery.data?.canCheckin ?? false,
    lastCheckinAt: statusQuery.data?.lastCheckinAt ?? null,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,

    // Actions
    claimFirstCalc,
    doCheckin,
    unlockSubconscious,
    refresh,

    // Mutation states
    isClaimingFirstCalc: firstCalcMutation.isPending,
    isCheckingIn: checkinMutation.isPending,
    isUnlocking: unlockMutation.isPending,
  };
}
