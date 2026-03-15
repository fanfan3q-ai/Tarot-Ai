import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Eye, Lock, ChevronDown } from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";
import gsap from "gsap";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

// Card preview data
const PREVIEW_CARDS = [
  { num: 1, emoji: "🪄", name: "魔術師" },
  { num: 6, emoji: "💖", name: "戀人" },
  { num: 9, emoji: "🌟", name: "隱士" },
  { num: 17, emoji: "⭐", name: "星星" },
  { num: 21, emoji: "🌍", name: "世界" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Validate days based on month/year
  const maxDays = useMemo(() => {
    if (!month || !year) return 31;
    const m = parseInt(month);
    const y = parseInt(year);
    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) {
      return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
    }
    return 31;
  }, [month, year]);

  const validDays = useMemo(() => DAYS.filter(d => d <= maxDays), [maxDays]);

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

  const isValid = year && month && day && parseInt(day) <= maxDays;

  const handleCalculate = useCallback(() => {
    if (!isValid) return;
    setIsCalculating(true);

    // Brief animation delay for dramatic effect
    setTimeout(() => {
      navigate(`/result?y=${year}&m=${month}&d=${day}`);
    }, 800);
  }, [isValid, year, month, day, navigate]);

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

          {/* Title */}
          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gold-gradient leading-tight mb-4">
            二十二道靈數密碼
          </h1>
          <p className="font-serif-tc text-base sm:text-lg md:text-xl text-foreground/70 leading-relaxed mb-2">
            你的生日，藏著宇宙給你的密碼
          </p>
          <p className="text-sm text-muted-foreground">
            輸入生日，解讀你的主命數、行為數、特質數與 2026 流年運勢
          </p>

          {/* Three Layer Icons */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              <span className="text-xs sm:text-sm text-foreground/80 font-sans-tc">天賦本質</span>
              <span className="text-[10px] sm:text-xs text-gold/60">免費開放</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              <span className="text-xs sm:text-sm text-foreground/80 font-sans-tc">意識層解析</span>
              <span className="text-[10px] sm:text-xs text-gold/60">免費開放</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gold/50" />
              <span className="text-xs sm:text-sm text-foreground/80 font-sans-tc">潛意識密碼</span>
              <span className="text-[10px] sm:text-xs text-gold/60">積分解鎖</span>
            </div>
          </div>
        </div>

        {/* Birthday Input Form */}
        <div ref={formRef} className="w-full max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-5 sm:p-8">
            <h2 className="font-serif-tc text-lg sm:text-xl text-center text-foreground/90 mb-6">
              輸入你的西元生日
            </h2>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              {/* Year */}
              <div className="relative">
                <label className="block text-xs text-muted-foreground mb-1.5 font-sans-tc">年</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full appearance-none bg-input border border-border rounded-lg px-3 py-3 sm:py-3.5 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  >
                    <option value="">年份</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Month */}
              <div className="relative">
                <label className="block text-xs text-muted-foreground mb-1.5 font-sans-tc">月</label>
                <div className="relative">
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="w-full appearance-none bg-input border border-border rounded-lg px-3 py-3 sm:py-3.5 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  >
                    <option value="">月份</option>
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Day */}
              <div className="relative">
                <label className="block text-xs text-muted-foreground mb-1.5 font-sans-tc">日</label>
                <div className="relative">
                  <select
                    value={day}
                    onChange={e => setDay(e.target.value)}
                    className="w-full appearance-none bg-input border border-border rounded-lg px-3 py-3 sm:py-3.5 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  >
                    <option value="">日期</option>
                    {validDays.map(d => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
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

        {/* Card Preview Carousel */}
        <div className="mt-10 sm:mt-14 w-full max-w-lg mx-auto">
          <div className="flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
            {PREVIEW_CARDS.map((card, i) => (
              <div
                key={card.num}
                className="flex-shrink-0 w-16 sm:w-20 glass-card rounded-xl p-2 sm:p-3 text-center transition-transform hover:scale-105"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl mb-1">{card.emoji}</div>
                <div className="text-[10px] sm:text-xs text-gold/70 font-sans-tc">{card.name}</div>
                <div className="text-[10px] text-muted-foreground">{card.num}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 sm:mt-8 text-center text-xs text-muted-foreground/60 space-y-1">
          <p>基於陳彩綺塔羅靈數系統 · 21 張大阿爾克那完整解析</p>
          <p>你的資料僅用於計算，不會被儲存或分享</p>
        </div>
      </section>
    </div>
  );
}
