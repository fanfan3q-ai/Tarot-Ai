import { useEffect, useRef, useCallback } from "react";
import { getCardImageUrl } from "@shared/tarotImages";
import gsap from "gsap";

interface CardRevealAnimationProps {
  /** The main number (1-21) to reveal */
  mainNumber: number;
  /** Card name in Chinese */
  cardName: string;
  /** Called when the animation finishes — navigate to result */
  onComplete: () => void;
}

/**
 * Full-screen overlay ritual animation.
 * GSAP Timeline:
 *   0.0s  Dark overlay fades in
 *   0.6s  Card back floats up from below (scale 0.8→1, y:60→0)
 *   1.8s  Mystery text types in letter by letter
 *   3.0s  3D flip (rotateY 0→180), at 90° swap to real card image, gold particles burst
 *   4.5s  Card name appears below
 *   5.5s  Card dissolves upward, overlay fades out, onComplete fires
 */
export default function CardRevealAnimation({
  mainNumber,
  cardName,
  onComplete,
}: CardRevealAnimationProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const cardImageUrl = getCardImageUrl(mainNumber);

  // ─── Particle burst effect ────────────────────────────────────────
  const createParticles = useCallback(() => {
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 24; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        border-radius: 50%;
        background: oklch(0.72 0.14 75);
        box-shadow: 0 0 6px oklch(0.72 0.14 75 / 60%);
        top: 50%;
        left: 50%;
        pointer-events: none;
      `;
      container.appendChild(particle);

      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 120;

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 1 + Math.random() * 0.5,
        ease: "power2.out",
        onComplete: () => particle.remove(),
      });
    }
  }, []);

  // ─── Main GSAP Timeline ───────────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current;
    const cardContainer = cardContainerRef.current;
    const cardInner = cardInnerRef.current;
    const cardBack = cardBackRef.current;
    const cardFront = cardFrontRef.current;
    const text = textRef.current;
    const name = nameRef.current;

    if (!overlay || !cardContainer || !cardInner || !cardBack || !cardFront || !text || !name) return;

    // Hide elements initially
    gsap.set(cardContainer, { opacity: 0, y: 60, scale: 0.8 });
    gsap.set(text, { opacity: 0 });
    gsap.set(name, { opacity: 0, y: 10 });
    gsap.set(cardFront, { rotateY: 180 });

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });
    tlRef.current = tl;

    // 0.0s — Overlay fades in
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.inOut" });

    // 0.6s — Card back floats up
    tl.to(
      cardContainer,
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
      0.6
    );

    // 1.8s — Mystery text fades in
    tl.to(text, { opacity: 1, duration: 0.8, ease: "power2.out" }, 1.8);

    // 3.0s — 3D flip
    tl.to(cardInner, {
      rotateY: 180,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: function () {
        // At 90° (halfway), swap visibility
        const progress = this.progress();
        if (progress >= 0.5) {
          cardBack.style.opacity = "0";
          cardFront.style.opacity = "1";
        } else {
          cardBack.style.opacity = "1";
          cardFront.style.opacity = "0";
        }
      },
      onStart: () => {
        // Fire particles at the midpoint
        setTimeout(() => createParticles(), 600);
      },
    }, 3.0);

    // 4.5s — Card name appears
    tl.to(name, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 4.5);

    // 5.0s — Gold glow expands
    tl.to(cardContainer, {
      boxShadow: "0 0 60px oklch(0.72 0.14 75 / 40%), 0 0 120px oklch(0.72 0.14 75 / 20%)",
      duration: 0.5,
      ease: "power2.out",
    }, 4.5);

    // 5.5s — Card dissolves upward, overlay fades out
    tl.to(cardContainer, {
      y: -40,
      opacity: 0,
      scale: 1.05,
      duration: 0.8,
      ease: "power2.in",
    }, 5.5);
    tl.to(text, { opacity: 0, duration: 0.4 }, 5.5);
    tl.to(name, { opacity: 0, duration: 0.4 }, 5.5);
    tl.to(overlay, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 5.8);

    return () => {
      tl.kill();
    };
  }, [mainNumber, cardName, onComplete, createParticles]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "oklch(0.08 0.03 260 / 95%)" }}
    >
      {/* Particle container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

      {/* Card container */}
      <div
        ref={cardContainerRef}
        className="relative"
        style={{ perspective: "1200px" }}
      >
        <div
          ref={cardInnerRef}
          className="relative w-48 h-72 sm:w-56 sm:h-84"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Card Back */}
          <div
            ref={cardBackRef}
            className="absolute inset-0 rounded-xl overflow-hidden border-2 border-gold/40"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, oklch(0.18 0.06 280), oklch(0.12 0.04 260))",
              boxShadow: "0 0 30px oklch(0.72 0.14 75 / 20%)",
            }}
          >
            {/* Mandala pattern on card back */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-gold/30"
                style={{
                  background: "radial-gradient(circle, oklch(0.72 0.14 75 / 15%) 0%, transparent 70%)",
                }}
              >
                <div className="absolute inset-4 rounded-full border border-gold/20" />
                <div className="absolute inset-8 rounded-full border border-gold/15" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-cinzel text-2xl sm:text-3xl text-gold/60"
                    style={{ textShadow: "0 0 10px oklch(0.72 0.14 75 / 40%)" }}
                  >
                    ✦
                  </span>
                </div>
              </div>
            </div>
            {/* Corner decorations */}
            <div className="absolute top-3 left-3 text-gold/30 text-xs font-cinzel">✦</div>
            <div className="absolute top-3 right-3 text-gold/30 text-xs font-cinzel">✦</div>
            <div className="absolute bottom-3 left-3 text-gold/30 text-xs font-cinzel">✦</div>
            <div className="absolute bottom-3 right-3 text-gold/30 text-xs font-cinzel">✦</div>
          </div>

          {/* Card Front — real tarot image */}
          <div
            ref={cardFrontRef}
            className="absolute inset-0 rounded-xl overflow-hidden border-2 border-gold/40"
            style={{
              backfaceVisibility: "hidden",
              opacity: 0,
              transform: "rotateY(180deg)",
              boxShadow: "0 0 30px oklch(0.72 0.14 75 / 25%)",
            }}
          >
            {cardImageUrl ? (
              <img
                src={cardImageUrl}
                alt={cardName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "oklch(0.16 0.03 260)" }}
              >
                <span className="font-cinzel text-5xl text-gold-gradient font-bold">
                  {mainNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mystery text */}
      <p
        ref={textRef}
        className="mt-8 font-serif-tc text-sm sm:text-base tracking-widest"
        style={{
          color: "oklch(0.72 0.14 75 / 80%)",
          textShadow: "0 0 10px oklch(0.72 0.14 75 / 30%)",
        }}
      >
        宇宙正在解讀你的密碼...
      </p>

      {/* Card name reveal */}
      <p
        ref={nameRef}
        className="mt-4 font-cinzel text-xl sm:text-2xl font-bold text-gold-gradient"
      >
        {cardName}
      </p>
    </div>
  );
}
