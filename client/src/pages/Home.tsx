import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Star } from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";
import CardRevealAnimation from "@/components/CardRevealAnimation";
import { getCardImageUrl } from "@shared/tarotImages";
import { calculateNumerology } from "@shared/numerology";
import { CARD_NAMES } from "@shared/tarotContentIndex";
import { trpc } from "@/lib/trpc";
import gsap from "gsap";

// Card preview data — use CDN images
const PREVIEW_CARDS = [
  { num: 1, name: "魔術師" },
  { num: 6, name: "戀人" },
  { num: 9, name: "隱士" },
  { num: 17, name: "星星" },
  { num: 21, name: "世界" },
];

/** Get max days for a given month/year */
function getMaxDays(month: number, year: number): number {
  if (!month) return 31;
  if ([4, 6, 9, 11].includes(month)) return 30;
  if (month === 2) {
    if (!year) return 29;
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return 31;
}

export default function Home() {
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [errors, setErrors] = useState<{ year?: string; month?: string; day?: string }>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealData, setRevealData] = useState<{ mainNumber: number; cardName: string } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  const recordClickMutation = trpc.shares.recordClick.useMutation();

  // ─── Handle ?ref= param: store invite code & record click ────────
  useEffect(() => {
    const sp = new URLSearchParams(searchStr);
    const ref = sp.get("ref");
    if (!ref) return;

    // Store invite code in sessionStorage for later use (when invitee completes calc)
    const alreadyRecorded = sessionStorage.getItem("ref_recorded");
    sessionStorage.setItem("invite_code", ref);

    // Record click (only once per session)
    if (!alreadyRecorded) {
      sessionStorage.setItem("ref_recorded", "true");
      recordClickMutation.mutate({ inviteCode: ref });
    }

    // Pre-fill birthday if provided in share link
    const b = sp.get("b");
    if (b && /^\d{4}-\d{2}-\d{2}$/.test(b)) {
      const [bYear, bMonth, bDay] = b.split("-");
      // Don't pre-fill — the invitee should enter their own birthday
      // But we could show a message like "你的朋友邀請你來算靈數"
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchStr]);

  // GSAP entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 }
    );
    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );
  }, []);

  // ─── Year handler ─────────────────────────────────────────────────
  const handleYearChange = useCallback((value: string) => {
    // Only allow digits, max 4 chars
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setYear(cleaned);
    setErrors(prev => ({ ...prev, year: undefined }));

    // Auto-jump to month when 4 digits entered
    if (cleaned.length === 4) {
      const y = parseInt(cleaned);
      if (y < 1900 || y > 2026) {
        setErrors(prev => ({ ...prev, year: "請輸入 1900-2026" }));
      } else {
        monthRef.current?.focus();
      }
    }
  }, []);

  // ─── Month handler ────────────────────────────────────────────────
  const handleMonthChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 2);
    setMonth(cleaned);
    setErrors(prev => ({ ...prev, month: undefined }));

    const m = parseInt(cleaned);
    if (cleaned.length === 2) {
      if (m < 1 || m > 12) {
        setErrors(prev => ({ ...prev, month: "請輸入 1-12" }));
      } else {
        dayRef.current?.focus();
      }
    }
    // Also auto-jump if user types a single digit that can only be one month (e.g. "2"-"9")
    if (cleaned.length === 1 && m >= 2 && m <= 9) {
      // Wait a beat — user might be typing "12" starting with "1"
      // Only auto-jump for 2-9 since they can't be the start of a two-digit month > 12
      // Actually "1" could be 10,11,12 so don't jump. But 2-9 are unambiguous.
      // We'll let 2-digit logic handle it.
    }
  }, []);

  // ─── Day handler ──────────────────────────────────────────────────
  const handleDayChange = useCallback(
    (value: string) => {
      const cleaned = value.replace(/\D/g, "").slice(0, 2);
      setDay(cleaned);
      setErrors(prev => ({ ...prev, day: undefined }));

      if (cleaned.length >= 1) {
        const d = parseInt(cleaned);
        const m = parseInt(month) || 0;
        const y = parseInt(year) || 0;
        const max = getMaxDays(m, y);
        if (cleaned.length === 2 && (d < 1 || d > max)) {
          setErrors(prev => ({ ...prev, day: `請輸入 1-${max}` }));
        }
      }
    },
    [month, year]
  );

  // ─── Validation ───────────────────────────────────────────────────
  const isValid = useMemo(() => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (!y || !m || !d) return false;
    if (y < 1900 || y > 2026) return false;
    if (m < 1 || m > 12) return false;
    const max = getMaxDays(m, y);
    if (d < 1 || d > max) return false;
    if (year.length < 4) return false;
    return true;
  }, [year, month, day]);

  // ─── Submit ───────────────────────────────────────────────────────
  const handleCalculate = useCallback(() => {
    if (!isValid) return;
    setIsCalculating(true);

    // Calculate numerology to get the main number for the reveal animation
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const result = calculateNumerology(y, m, d);
    const cardInfo = CARD_NAMES[result.mainNumber];

    setRevealData({
      mainNumber: result.mainNumber,
      cardName: cardInfo?.zh || `${result.mainNumber} 號`,
    });
    setShowReveal(true);
  }, [isValid, year, month, day]);

  const handleRevealComplete = useCallback(() => {
    navigate(`/result?y=${year}&m=${month}&d=${day}`);
  }, [year, month, day, navigate]);

  // Allow Enter key to submit
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && isValid) {
        handleCalculate();
      }
    },
    [isValid, handleCalculate]
  );

  // Shared input class
  const inputBaseClass =
    "w-full bg-input border rounded-lg px-3 py-3 sm:py-3.5 text-center text-sm sm:text-base text-foreground font-cinzel tracking-wider focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder:text-muted-foreground/40 placeholder:font-sans-tc placeholder:tracking-normal";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <StarfieldBackground />

      {/* Hero Section */}
      <section className="content-section min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div ref={heroRef} className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs sm:text-sm text-gold/80 font-sans-tc">
              基於陳彩綺塔羅靈數系統 · 已為 12,847 人解讀
            </span>
          </div>

          {/* Subtitle above title */}
          <p className="font-cinzel text-[0.75rem] tracking-[0.3em] text-gold/50 mb-3">
            ARCANA MYSTICAL JOURNEY
          </p>

          {/* Title — enhanced with glow */}
          <h1
            className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
            style={{
              background: "linear-gradient(135deg, #f5d98a, #c8952a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 30px rgba(200,149,42,0.5)",
            }}
          >
            二十二道靈數密碼
          </h1>
          <p className="font-serif-tc text-base sm:text-lg md:text-xl text-foreground/70 leading-relaxed mb-2">
            你的生日，藏著宇宙給你的密碼
          </p>

          {/* Mystical symbol decoration row */}
          <p className="text-[0.7rem] tracking-[0.2em] text-gold/40 mb-2">
            ✦ 古羅馬神祕學 ✦ 盧恩符文 ✦ 塔羅原型 ✦
          </p>

          <p className="text-sm text-muted-foreground">
            輸入生日，解讀你的主命數、行為數、特質數與 2026 流年運勢
          </p>

          {/* Poetic Three Lines */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-center text-gold/30 tracking-[0.3em] text-xs">──── ✦ ✦ ✦ ────</p>
            <div className="py-4 text-center" style={{ lineHeight: "2.2" }}>
              <p className="text-[1.1rem] italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#b8c8e8" }}>
                <span className="text-gold">&#9789;</span> 潛意識　　你的深層渴望
              </p>
              <p className="text-[1.1rem] italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#b8c8e8" }}>
                <span className="text-gold">◈</span> 行為模式　外在如何展現
              </p>
              <p className="text-[1.1rem] italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#b8c8e8" }}>
                <span className="text-gold">✦</span> 靈魂特質　星座的贈禮
              </p>
            </div>
            <p className="text-center text-gold/30 tracking-[0.3em] text-xs">──── ✦ ✦ ✦ ────</p>
          </div>
        </div>

        {/* Birthday Input Form */}
        <div ref={formRef} className="w-full max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-5 sm:p-8">
            <h2 className="font-serif-tc text-lg sm:text-xl text-center text-foreground/90 mb-6">
              輸入你的西元生日
            </h2>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6" onKeyDown={handleKeyDown}>
              {/* Year */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-sans-tc">年</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={year}
                  onChange={e => handleYearChange(e.target.value)}
                  placeholder="YYYY"
                  maxLength={4}
                  autoComplete="off"
                  className={`${inputBaseClass} ${errors.year ? "border-destructive ring-1 ring-destructive/50" : "border-border"}`}
                />
                {errors.year && (
                  <p className="text-[10px] text-destructive mt-1 font-sans-tc">{errors.year}</p>
                )}
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-sans-tc">月</label>
                <input
                  ref={monthRef}
                  type="text"
                  inputMode="numeric"
                  value={month}
                  onChange={e => handleMonthChange(e.target.value)}
                  placeholder="MM"
                  maxLength={2}
                  autoComplete="off"
                  className={`${inputBaseClass} ${errors.month ? "border-destructive ring-1 ring-destructive/50" : "border-border"}`}
                />
                {errors.month && (
                  <p className="text-[10px] text-destructive mt-1 font-sans-tc">{errors.month}</p>
                )}
              </div>

              {/* Day */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-sans-tc">日</label>
                <input
                  ref={dayRef}
                  type="text"
                  inputMode="numeric"
                  value={day}
                  onChange={e => handleDayChange(e.target.value)}
                  placeholder="DD"
                  maxLength={2}
                  autoComplete="off"
                  className={`${inputBaseClass} ${errors.day ? "border-destructive ring-1 ring-destructive/50" : "border-border"}`}
                />
                {errors.day && (
                  <p className="text-[10px] text-destructive mt-1 font-sans-tc">{errors.day}</p>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={!isValid || isCalculating}
              className="w-full py-4 sm:py-5 text-base sm:text-lg font-serif-tc bg-gold hover:bg-gold-light text-midnight font-semibold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed animate-glow-pulse"
            >
              {isCalculating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  解讀命運中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  開始解讀命運
                </span>
              )}
            </Button>

            {/* 2026 Year Badge */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-gold/60">
                <Star className="w-3 h-3" />
                含 2026 流年特別解析
              </span>
            </div>
          </div>
        </div>

        {/* Card Preview Carousel — CDN images */}
        <div className="mt-10 sm:mt-14 w-full max-w-lg mx-auto">
          <div className="flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
            {PREVIEW_CARDS.map((card, i) => {
              const imageUrl = getCardImageUrl(card.num);
              return (
                <div
                  key={card.num}
                  className="flex-shrink-0 w-16 sm:w-20 glass-card rounded-xl p-2 sm:p-3 text-center transition-transform hover:scale-105"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {imageUrl ? (
                    <div className="w-12 h-18 sm:w-16 sm:h-24 mx-auto mb-1 rounded-md overflow-hidden border border-gold/20">
                      <img
                        src={imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl sm:text-3xl mb-1">✨</div>
                  )}
                  <div className="text-[10px] sm:text-xs text-gold/70 font-sans-tc">{card.name}</div>
                  <div className="text-[10px] text-muted-foreground">{card.num}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 sm:mt-8 text-center text-xs text-muted-foreground/60 space-y-1">
          <p>基於陳彩綺塔羅靈數系統 · 21 張大阿爾克那完整解析</p>
          <p>你的資料僅用於計算，不會被儲存或分享</p>
        </div>
      </section>

      {/* Card Reveal Animation Overlay */}
      {showReveal && revealData && (
        <CardRevealAnimation
          mainNumber={revealData.mainNumber}
          cardName={revealData.cardName}
          onComplete={handleRevealComplete}
        />
      )}
    </div>
  );
}
