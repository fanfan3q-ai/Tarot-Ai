/**
 * PointsBar — Floating bar showing current points balance and daily check-in.
 * Displayed on the Result page.
 */

import { useEffect, useRef, useState } from "react";
import { Sparkles, Calendar, Gift } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import gsap from "gsap";

export default function PointsBar() {
  const {
    points,
    canCheckin,
    isLoading,
    isError,
    doCheckin,
    isCheckingIn,
  } = usePoints();

  const barRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLSpanElement>(null);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  // Entrance animation
  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: "power3.out" }
    );
  }, []);

  // Points change animation
  useEffect(() => {
    if (!pointsRef.current || isLoading) return;
    gsap.fromTo(
      pointsRef.current,
      { scale: 1.3, color: "oklch(0.85 0.12 75)" },
      { scale: 1, color: "oklch(0.72 0.14 75)", duration: 0.4, ease: "back.out(2)" }
    );
  }, [points, isLoading]);

  const handleCheckin = async () => {
    try {
      const result = await doCheckin();
      if (result.success) {
        setCheckinMessage("簽到成功 +5 ✦");
        setTimeout(() => setCheckinMessage(null), 3000);
      } else {
        setCheckinMessage("今日已簽到");
        setTimeout(() => setCheckinMessage(null), 2000);
      }
    } catch {
      setCheckinMessage("簽到失敗，請稍後再試");
      setTimeout(() => setCheckinMessage(null), 2000);
    }
  };

  if (isError) return null;

  return (
    <div
      ref={barRef}
      className="fixed top-4 right-4 z-50 flex items-center gap-3"
      style={{ opacity: 0 }}
    >
      {/* Check-in message toast */}
      {checkinMessage && (
        <div className="glass-card rounded-lg px-3 py-1.5 text-xs text-gold font-sans-tc animate-fade-in-up">
          {checkinMessage}
        </div>
      )}

      {/* Check-in button */}
      {canCheckin && (
        <button
          onClick={handleCheckin}
          disabled={isCheckingIn}
          className="glass-card rounded-full p-2 border border-gold/30 hover:border-gold/60 transition-all group"
          title="每日簽到 +5"
        >
          <Calendar className="w-4 h-4 text-gold/70 group-hover:text-gold transition-colors" />
        </button>
      )}

      {/* Points badge */}
      <div className="glass-card rounded-full px-4 py-2 flex items-center gap-2 border border-gold/20">
        <Sparkles className="w-3.5 h-3.5 text-gold/70" />
        <span
          ref={pointsRef}
          className="font-cinzel text-sm font-bold text-gold"
        >
          {isLoading ? "..." : points}
        </span>
        <span className="text-[10px] text-gold/50 font-sans-tc">積分</span>
      </div>
    </div>
  );
}
