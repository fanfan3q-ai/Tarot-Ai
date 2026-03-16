/**
 * FirstCalcReward — Animated toast that appears when user earns the +30 first-calc bonus.
 * Auto-dismisses after 4 seconds.
 */

import { useEffect, useRef } from "react";
import { Gift, Sparkles } from "lucide-react";
import gsap from "gsap";

interface FirstCalcRewardProps {
  points: number;
  onDismiss: () => void;
}

export default function FirstCalcReward({ points, onDismiss }: FirstCalcRewardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onDismiss, 200);
      },
    });

    // Entrance
    tl.fromTo(
      el,
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
    );

    // Hold
    tl.to(el, { duration: 3 });

    // Exit
    tl.to(el, { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });

    return () => {
      tl.kill();
    };
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <div
        ref={containerRef}
        className="glass-card rounded-2xl px-6 py-4 border border-gold/30 flex items-center gap-4"
        style={{
          boxShadow: "0 0 30px oklch(0.72 0.14 75 / 20%), 0 8px 32px oklch(0 0 0 / 40%)",
          opacity: 0,
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75 / 20%), oklch(0.72 0.14 75 / 10%))" }}
        >
          <Gift className="w-5 h-5 text-gold" />
        </div>
        <div>
          <p className="font-serif-tc text-sm text-foreground/90">
            新手禮包 <span className="text-gold font-bold">+{points}</span> 積分
          </p>
          <p className="text-[11px] text-foreground/50 font-sans-tc mt-0.5">
            再分享一次就能解鎖潛意識密碼 ✦
          </p>
        </div>
        <Sparkles className="w-4 h-4 text-gold/50 animate-pulse" />
      </div>
    </div>
  );
}
