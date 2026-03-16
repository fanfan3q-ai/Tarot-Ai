/**
 * SubconsciousPaywall — Lock overlay for the subconscious reading section.
 * Shows current points, unlock cost, and earn methods.
 */

import { useState } from "react";
import { Lock, Sparkles, Share2, Calendar, Users, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePoints } from "@/hooks/usePoints";

interface SubconsciousPaywallProps {
  profileId: number | null;
  onUnlocked: () => void;
}

export default function SubconsciousPaywall({
  profileId,
  onUnlocked,
}: SubconsciousPaywallProps) {
  const { points, unlockSubconscious, isUnlocking } = usePoints();
  const [error, setError] = useState<string | null>(null);
  const [showEarnGuide, setShowEarnGuide] = useState(false);

  const UNLOCK_COST = 30;
  const canUnlock = points >= UNLOCK_COST;
  const progress = Math.min((points / UNLOCK_COST) * 100, 100);

  const handleUnlock = async () => {
    if (!profileId) {
      setError("請先完成生日計算");
      return;
    }
    setError(null);
    try {
      const result = await unlockSubconscious(profileId);
      if (result.success) {
        onUnlocked();
      } else {
        setError(result.reason ?? "解鎖失敗");
      }
    } catch {
      setError("解鎖失敗，請稍後再試");
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-500/30">
      {/* Blurred preview background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, oklch(0.18 0.06 280 / 80%), oklch(0.12 0.04 260 / 90%))",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 text-center">
        {/* Lock icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-purple-400/30 mb-4"
          style={{ background: "oklch(0.20 0.08 280 / 50%)" }}
        >
          <Lock className="w-6 h-6 text-purple-300" />
        </div>

        <h3 className="font-serif-tc text-lg sm:text-xl text-foreground/90 mb-2">
          潛意識密碼
        </h3>
        <p className="text-sm text-foreground/60 font-sans-tc mb-4">
          完成計算即獲得 30 積分，再分享一次就能解鎖
        </p>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-4">
          <div className="flex justify-between text-xs text-foreground/50 font-sans-tc mb-1.5">
            <span>目前 {points} 積分</span>
            <span>需要 {UNLOCK_COST} 積分</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.20 0.04 280)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: canUnlock
                  ? "linear-gradient(90deg, oklch(0.72 0.14 75), oklch(0.85 0.10 75))"
                  : "linear-gradient(90deg, oklch(0.50 0.15 280), oklch(0.60 0.18 300))",
              }}
            />
          </div>
        </div>

        {/* Unlock button or earn guide */}
        {canUnlock ? (
          <Button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="bg-gold hover:bg-gold-light text-midnight font-serif-tc font-semibold px-8 py-3 rounded-xl transition-all animate-glow-pulse"
          >
            {isUnlocking ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                解鎖中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                花費 {UNLOCK_COST} 積分解鎖
              </span>
            )}
          </Button>
        ) : (
          <div>
            <Button
              variant="outline"
              onClick={() => setShowEarnGuide(!showEarnGuide)}
              className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10 font-sans-tc px-6 py-2.5 rounded-xl"
            >
              <Gift className="w-4 h-4 mr-2" />
              如何獲得積分？
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-3 text-xs text-destructive font-sans-tc">{error}</p>
        )}

        {/* Earn guide */}
        {showEarnGuide && !canUnlock && (
          <div className="mt-5 text-left max-w-sm mx-auto space-y-3">
            {/* First-calc bonus — highlighted */}
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg" style={{ background: "oklch(0.72 0.14 75 / 8%)" }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gold/40"
                style={{ background: "oklch(0.72 0.14 75 / 15%)" }}
              >
                <Star className="w-4 h-4 text-gold" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gold font-bold font-sans-tc">✦ 首次完成計算</span>
                <span className="text-gold font-bold text-sm">+30 積分</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-gold/30 text-gold/70 font-sans-tc">限一次</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gold/20"
                style={{ background: "oklch(0.72 0.14 75 / 10%)" }}
              >
                <Share2 className="w-4 h-4 text-gold/70" />
              </div>
              <div>
                <span className="text-foreground/80 font-sans-tc">分享連結被點擊</span>
                <span className="text-gold/60 text-xs ml-2">+10 積分</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gold/20"
                style={{ background: "oklch(0.72 0.14 75 / 10%)" }}
              >
                <Users className="w-4 h-4 text-gold/70" />
              </div>
              <div>
                <span className="text-foreground/80 font-sans-tc">邀請好友完成計算</span>
                <span className="text-gold/60 text-xs ml-2">+20 積分</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gold/20"
                style={{ background: "oklch(0.72 0.14 75 / 10%)" }}
              >
                <Calendar className="w-4 h-4 text-gold/70" />
              </div>
              <div>
                <span className="text-foreground/80 font-sans-tc">每日簽到</span>
                <span className="text-gold/60 text-xs ml-2">+5 積分</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
