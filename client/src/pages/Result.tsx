import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Star, Eye, Lock, Heart, Briefcase, Users,
  ChevronLeft, Share2, Gift, Calendar, ArrowRight, CheckCircle2
} from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";
import PointsBar from "@/components/PointsBar";
import SubconsciousPaywall from "@/components/SubconsciousPaywall";
import FirstCalcReward from "@/components/FirstCalcReward";
import ShareDialog from "@/components/ShareDialog";
import { usePoints } from "@/hooks/usePoints";
import { trpc } from "@/lib/trpc";
import { calculateNumerology, type NumerologyResult } from "@shared/numerology";
import { getCardContent, CARD_NAMES, type TarotCardContent } from "@shared/tarotContentIndex";
import { YEAR_CONTENT, type YearContent } from "@shared/yearContent";
import { getCardImageUrl } from "@shared/tarotImages";
import gsap from "gsap";

// ─── Number Card Component ─────────────────────────────────────────
function NumberCard({
  label,
  number,
  emoji,
  cardName,
  delay = 0,
}: {
  label: string;
  number: number;
  emoji: string;
  cardName: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imageUrl = getCardImageUrl(number);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40, rotateY: 90 },
      { opacity: 1, y: 0, rotateY: 0, duration: 0.8, delay, ease: "back.out(1.4)" }
    );
  }, [delay]);

  return (
    <div ref={ref} className="glass-card rounded-2xl p-4 sm:p-6 text-center flex-shrink-0 w-[140px] sm:w-auto snap-center" style={{ perspective: "800px" }}>
      <p className="text-xs sm:text-sm text-gold/60 font-sans-tc mb-2">{label}</p>
      {imageUrl ? (
        <div className="relative w-16 h-24 sm:w-20 sm:h-30 mx-auto mb-2 rounded-lg overflow-hidden border border-gold/20">
          <img
            src={imageUrl}
            alt={`${cardName} tarot card`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="text-3xl sm:text-4xl mb-1">{emoji}</div>
      )}
      <div className="font-cinzel text-3xl sm:text-4xl md:text-5xl text-gold-gradient font-bold mb-1">
        {number}
      </div>
      <p className="text-xs sm:text-sm text-foreground/70 font-sans-tc">{cardName}</p>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, free = true }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  free?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <div>
        <h3 className="font-serif-tc text-lg sm:text-xl text-foreground/90">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {free && (
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/70 border border-gold/20">
          免費
        </span>
      )}
    </div>
  );
}// ─── Consciousness Layer Section ────────────────────────────────────────
function ConsciousnessSection({ content }: { content: string }) {
  const [activeTab, setActiveTab] = useState(0);

  // Split by double newline first; if only 1 part, try single newline
  let paragraphs = content.split("\n\n").filter(Boolean);
  if (paragraphs.length < 3) {
    paragraphs = content.split("\n").filter(Boolean);
  }

  const sections = useMemo(() => {
    const result: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }[] = [];
    if (paragraphs.length >= 3) {
      result.push({ icon: Heart, title: "感情模式", text: paragraphs[0] });
      result.push({ icon: Briefcase, title: "職場特質", text: paragraphs[1] });
      result.push({ icon: Users, title: "人際動態", text: paragraphs[2] });
    } else {
      paragraphs.forEach((p, i) => {
        const icons = [Heart, Briefcase, Users];
        const titles = ["感情模式", "職場特質", "人際動態"];
        result.push({ icon: icons[i % 3], title: titles[i % 3], text: p });
      });
    }
    return result;
  }, [paragraphs]);

  return (
    <div>
      {/* Mobile: Tab switcher */}
      <div className="flex sm:hidden gap-1 mb-4 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-hide">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-sans-tc whitespace-nowrap snap-center transition-all flex-shrink-0 ${
                activeTab === i
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "bg-midnight-light/50 text-foreground/50 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Mobile: Show only active tab content */}
      <div className="block sm:hidden">
        {sections[activeTab] && (
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const Icon = sections[activeTab].icon;
                return <Icon className="w-4 h-4 text-gold/70" />;
              })()}
              <h4 className="font-serif-tc text-sm text-gold/80">{sections[activeTab].title}</h4>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans-tc">
              {sections[activeTab].text}
            </p>
          </div>
        )}
      </div>

      {/* Desktop: Show all sections */}
      <div className="hidden sm:block space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-4 h-4 text-gold/70" />
              <h4 className="font-serif-tc text-base text-gold/80">{section.title}</h4>
            </div>
            <p className="text-base text-foreground/80 leading-relaxed font-sans-tc">
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}// ─── Year Number Section ────────────────────────────────────────────
function YearSection({ yearNumber, yearContent }: { yearNumber: number; yearContent: YearContent | undefined }) {
  if (!yearContent) return null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-8 border-gold-glow">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs text-gold mb-3">
          <Calendar className="w-3 h-3" />
          2026 流年特別解析
        </span>
        <div className="text-3xl sm:text-4xl mb-2">{yearContent.emoji}</div>
        <h3 className="font-cinzel text-xl sm:text-2xl text-gold-gradient font-bold">
          流年數 {yearNumber}
        </h3>
        <p className="font-serif-tc text-lg text-foreground/80 mt-1">{yearContent.title}</p>
        <p className="text-sm text-gold/60 mt-1">{yearContent.keyword}</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-midnight-light/50">
          <h4 className="font-serif-tc text-sm text-gold/80 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 年度總覽
          </h4>
          <p className="text-sm text-foreground/80 leading-relaxed font-sans-tc">{yearContent.overview}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-midnight-light/50">
            <h4 className="font-serif-tc text-sm text-gold/80 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" /> 感情運勢
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans-tc">{yearContent.love}</p>
          </div>
          <div className="p-4 rounded-xl bg-midnight-light/50">
            <h4 className="font-serif-tc text-sm text-gold/80 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> 事業運勢
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans-tc">{yearContent.career}</p>
          </div>
        </div>
        <div className="soul-gift-box">
          <p className="text-sm text-gold/90 font-serif-tc italic leading-relaxed">
            「{yearContent.advice}」
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Course CTA Section ─────────────────────────────────────────────
function CourseCTA({ cardName, courseCta }: { cardName: string; courseCta: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-8 border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
      <div className="text-center mb-4">
        <Gift className="w-8 h-8 text-gold mx-auto mb-3" />
        <h3 className="font-serif-tc text-lg sm:text-xl text-foreground/90 mb-2">
          想要更深入了解你的 {cardName} 能量？
        </h3>
        <p className="text-sm text-foreground/70 font-sans-tc leading-relaxed max-w-lg mx-auto">
          {courseCta}
        </p>
      </div>

      <div className="space-y-3 max-w-sm mx-auto mb-6">
        {["一對一靈數解讀", "個人化行動方案", "90 天能量追蹤"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-foreground/70">
            <CheckCircle2 className="w-4 h-4 text-gold/70 flex-shrink-0" />
            <span className="font-sans-tc">{item}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="mb-3">
          <span className="text-xs text-muted-foreground line-through mr-2">原價 $999</span>
          <span className="font-cinzel text-2xl text-gold-gradient font-bold">$499</span>
          <span className="text-xs text-gold/60 ml-1">限時體驗價</span>
        </div>
        <Button
          asChild
          className="bg-gold hover:bg-gold-light text-midnight font-sans-tc font-semibold px-8 py-3 rounded-xl text-base animate-glow-pulse"
        >
          <a href="https://www.instagram.com/tarot_song6866" target="_blank" rel="noopener noreferrer">
            預約體驗課程
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          由陳彩綺認證塔羅靈數老師親自指導
        </p>
      </div>
    </div>
  );
}

//// ─── Main Result Page ───────────────────────────────────────────
export default function Result() {
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [subconsciousUnlocked, setSubconsciousUnlocked] = useState(false);
  const [showFirstCalcReward, setShowFirstCalcReward] = useState(false);
  const [firstCalcAmount, setFirstCalcAmount] = useState(0);
  const { claimFirstCalc, isFirstCalc } = usePoints();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [todayUsers, setTodayUsers] = useState<number | null>(null);

  const claimInviteBonusMutation = trpc.shares.claimInviteBonus.useMutation();

  // Fetch stats.json on mount
  useEffect(() => {
    fetch("/stats.json")
      .then(r => r.json())
      .then((data: { todayUsers?: number }) => {
        if (typeof data.todayUsers === "number") {
          setTodayUsers(data.todayUsers);
        }
      })
      .catch(() => {
        // Silently fail — today stats are optional
      });
  }, []);

  // Parse query params
  const params = useMemo(() => {
    const sp = new URLSearchParams(searchStr);
    return {
      y: parseInt(sp.get("y") || "0"),
      m: parseInt(sp.get("m") || "0"),
      d: parseInt(sp.get("d") || "0"),
    };
  }, [searchStr]);

  // Calculate numerology
  const result: NumerologyResult | null = useMemo(() => {
    if (!params.y || !params.m || !params.d) return null;
    if (params.y < 1900 || params.y > 2030) return null;
    if (params.m < 1 || params.m > 12) return null;
    if (params.d < 1 || params.d > 31) return null;
    return calculateNumerology(params.y, params.m, params.d);
  }, [params]);

  // Get card content for main number
  const mainCardContent: TarotCardContent | undefined = useMemo(() => {
    if (!result) return undefined;
    return getCardContent(result.mainNumber);
  }, [result]);

  // Get card content for behavior number
  const behaviorCardContent = useMemo(() => {
    if (!result) return undefined;
    return getCardContent(result.behaviorNumber);
  }, [result]);

  // Get card content for trait number
  const traitCardContent = useMemo(() => {
    if (!result) return undefined;
    return getCardContent(result.traitNumber);
  }, [result]);

  // Get year content
  const yearContent: YearContent | undefined = useMemo(() => {
    if (!result) return undefined;
    return YEAR_CONTENT[result.yearNumber];
  }, [result]);

  // Card names for display
  const mainCardName = result ? CARD_NAMES[result.mainNumber] : undefined;
  const behaviorCardName = result ? CARD_NAMES[result.behaviorNumber] : undefined;
  const traitCardName = result ? CARD_NAMES[result.traitNumber] : undefined;

  // GSAP entrance
  useEffect(() => {
    if (!containerRef.current || !result) return;
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, [result]);

  // Trigger first-calc bonus when result loads
  useEffect(() => {
    if (!result || isFirstCalc) return;

    const birthday = `${params.y}-${String(params.m).padStart(2, "0")}-${String(params.d).padStart(2, "0")}`;

    claimFirstCalc({
      birthday,
      zodiacSign: result.zodiacSign,
      mainNumber: result.mainNumber,
      behaviorNumber: result.behaviorNumber,
      traitNumber: result.traitNumber,
      yearNumber: result.yearNumber,
      digitSum: result.digitSum,
      birthDayNum: params.d,
    })
      .then((res) => {
        if (res.profileId) setProfileId(res.profileId);
        if (res.unlockedSubconscious) setSubconsciousUnlocked(true);
        if (res.awarded) {
          setFirstCalcAmount(30);
          setShowFirstCalcReward(true);
        }

        // Check if this user was invited (ref code in sessionStorage)
        const inviteCode = sessionStorage.getItem("invite_code");
        const inviteClaimed = sessionStorage.getItem("invite_claimed");
        if (inviteCode && !inviteClaimed && res.isNewProfile) {
          sessionStorage.setItem("invite_claimed", "true");
          claimInviteBonusMutation.mutate({ inviteCode });
        }
      })
      .catch(() => {
        // Silently fail — user can still see free content
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.mainNumber]);

  // Redirect if no valid params
  if (!result) {
    return (
      <div className="min-h-screen bg-background text-foreground content-section flex items-center justify-center">
        <StarfieldBackground />
        <div className="text-center content-section px-4">
          <p className="text-foreground/70 font-sans-tc mb-4">請先輸入你的生日</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gold hover:bg-gold-light text-midnight font-sans-tc"
          >
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <StarfieldBackground />
      <PointsBar />

      {/* First-calc reward toast */}
      {showFirstCalcReward && (
        <FirstCalcReward
          points={firstCalcAmount}
          onDismiss={() => setShowFirstCalcReward(false)}
        />
      )}

      <div ref={containerRef} className="content-section">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-midnight/80 backdrop-blur-md border-b border-border/50">
          <div className="container flex items-center justify-between py-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-sm text-foreground/60 hover:text-gold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-sans-tc">重新計算</span>
            </button>
            <h1 className="font-cinzel text-sm sm:text-base text-gold/80">
              靈數解析報告
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-3 h-3 mr-1" />
              分享
            </Button>
          </div>
        </header>

        <main className="container py-6 sm:py-10 space-y-8 sm:space-y-12 max-w-2xl mx-auto px-4 sm:px-6">
          {/* Birthday & Zodiac Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-sans-tc mb-1">
              {result.birthday} · {result.zodiacNameZh}
            </p>
            <h2 className="font-cinzel text-xl sm:text-2xl text-gold-gradient font-bold">
              你的靈數密碼
            </h2>
          </div>

          {/* Today users stats line */}
          {todayUsers !== null && (
            <p className="text-center" style={{ fontSize: "0.8rem", color: "var(--gold-warm, #c8952a)" }}>
              ✦ 今日已有 {todayUsers.toLocaleString("en-US")} 人完成解讀 ✦
            </p>
          )}

          {/* Three Number Cards — horizontal scroll on mobile */}
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible">
            <NumberCard
              label="主命數"
              number={result.mainNumber}
              emoji={mainCardName?.emoji || "✨"}
              cardName={mainCardName?.zh || ""}
              delay={0.2}
            />
            <NumberCard
              label="行為數"
              number={result.behaviorNumber}
              emoji={behaviorCardName?.emoji || "✨"}
              cardName={behaviorCardName?.zh || ""}
              delay={0.4}
            />
            <NumberCard
              label="特質數"
              number={result.traitNumber}
              emoji={traitCardName?.emoji || "✨"}
              cardName={traitCardName?.zh || ""}
              delay={0.6}
            />
          </div>

          {/* ─── Layer 1: Soul Gift (天賦本質) ─── */}
          {mainCardContent && (
            <section>
              <SectionHeader icon={Star} title="天賦本質" subtitle={`${mainCardContent.nameZh} · ${mainCardContent.nameEn}`} />
              <div className="soul-gift-box">
                <p className="text-sm sm:text-base text-gold/90 font-serif-tc italic leading-relaxed" style={{ lineHeight: '1.9' }}>
                  你的天賦數是 {mainCardContent.number}，
                  <br />
                  {mainCardContent.number} 是{mainCardContent.nameZh}。
                  <br />
                  {mainCardContent.nameZh}代表「<span className="font-semibold">{mainCardContent.coreSymbol}</span>」的意思，
                  <br />
                  所以擁有這張牌的你，{mainCardContent.soulGift.replace(/^擁有這張牌的你[，,]\s*/, '')}
                </p>
              </div>

              {/* Strengths & Challenges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-xs text-gold/60 font-sans-tc mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 核心天賦
                  </h4>
                  <ul className="space-y-1.5">
                    {mainCardContent.strengths.map((s, i) => (
                      <li key={i} className="text-xs sm:text-sm text-foreground/70 font-sans-tc flex items-start gap-2">
                        <span className="text-gold/50 mt-0.5">✦</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-xs text-gold/60 font-sans-tc mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> 成長課題
                  </h4>
                  <ul className="space-y-1.5">
                    {mainCardContent.challenges.map((c, i) => (
                      <li key={i} className="text-xs sm:text-sm text-foreground/70 font-sans-tc flex items-start gap-2">
                        <span className="text-gold/30 mt-0.5">◇</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* ─── Layer 2: Conscious Layer (意識層解析) ─── */}
          {mainCardContent && (
            <section>
              <SectionHeader icon={Eye} title="意識層解析" subtitle="感情模式 · 職場特質 · 人際動態" />
              <ConsciousnessSection content={mainCardContent.consciousLayer} />
            </section>
          )}

          {/* ─── Layer 3: Subconscious (潛意識密碼) ─── */}
          {mainCardContent && (
            <section>
              <SectionHeader icon={Lock} title="潛意識密碼" subtitle="你靈魂深處的隱藏模式" free={false} />
              {subconsciousUnlocked ? (
                <div className="space-y-6">
                  {/* Original subconscious content */}
                  <div className="glass-card rounded-xl p-4 sm:p-6">
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-sans-tc whitespace-pre-line">
                      {mainCardContent.subconsciousLayer}
                    </p>
                  </div>

                  {/* ◆ 你是什麼樣的人 */}
                  {mainCardContent.whatKindOfPerson && (
                    <div className="rounded-2xl p-5 sm:p-8 border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-transparent">
                      <h4 className="flex items-center gap-2 mb-4">
                        <span className="text-gold text-lg">◆</span>
                        <span className="font-garamond italic text-base sm:text-lg text-foreground/90">你是什麼樣的人</span>
                      </h4>
                      <div className="space-y-4">
                        {mainCardContent.whatKindOfPerson.split('\n').filter(Boolean).map((p, i) => (
                          <p key={i} className="text-sm sm:text-base text-foreground/80 font-garamond italic leading-relaxed" style={{ lineHeight: '1.9' }}>
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ◆ 可以開始行動的三件事 */}
                  {mainCardContent.threeActions && mainCardContent.threeActions.length > 0 && (
                    <div className="rounded-2xl p-5 sm:p-8 border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-transparent">
                      <h4 className="flex items-center gap-2 mb-4">
                        <span className="text-gold text-lg">◆</span>
                        <span className="font-garamond italic text-base sm:text-lg text-foreground/90">可以開始行動的三件事</span>
                      </h4>
                      <div className="space-y-5">
                        {mainCardContent.threeActions.map((action, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-gold font-cinzel font-bold text-lg mt-0.5 flex-shrink-0">{i + 1}.</span>
                            <div>
                              <h5 className="text-sm sm:text-base text-gold/90 font-semibold font-sans-tc mb-1">{action.title}</h5>
                              <p className="text-sm text-foreground/70 font-garamond italic leading-relaxed" style={{ lineHeight: '1.9' }}>
                                {action.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ◆ 最容易忽略的事 */}
                  {mainCardContent.easilyOverlooked && (
                    <div className="rounded-2xl p-5 sm:p-8 border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-transparent">
                      <h4 className="flex items-center gap-2 mb-4">
                        <span className="text-gold text-lg">◆</span>
                        <span className="font-garamond italic text-base sm:text-lg text-foreground/90">最容易忽略的事</span>
                      </h4>
                      <p className="text-sm sm:text-base text-foreground/80 font-garamond italic leading-relaxed" style={{ lineHeight: '1.9' }}>
                        {mainCardContent.easilyOverlooked}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <SubconsciousPaywall
                  profileId={profileId}
                  onUnlocked={() => setSubconsciousUnlocked(true)}
                />
              )}
            </section>
          )}

          {/* ─── 2026 Year Number ─── */}
          <section>
            <YearSection yearNumber={result.yearNumber} yearContent={yearContent} />
          </section>

          {/* ─── Course CTA ─── */}
          {mainCardContent && (
            <section>
              <CourseCTA
                cardName={mainCardContent.nameZh}
                courseCta={mainCardContent.courseCta}
              />
            </section>
          )}

          {/* ─── Action Bar ─── */}
          <section className="glass-card rounded-2xl p-5 sm:p-6">
            <h3 className="font-serif-tc text-base sm:text-lg text-center text-foreground/90 mb-4">
              獲取更多積分
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Share2, label: "分享報告", points: "+10", color: "text-blue-400", action: () => setShowShareDialog(true) },
                { icon: Users, label: "邀請好友", points: "+20", color: "text-green-400", action: () => setShowShareDialog(true) },
                { icon: Gift, label: "分享圖卡", points: "+15", color: "text-purple-400", action: undefined },
                { icon: Calendar, label: "每日簽到", points: "+5", color: "text-orange-400", action: undefined },
              ].map(({ icon: Icon, label, points, color, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-midnight-light/50 hover:bg-gold/10 transition-colors border border-transparent hover:border-gold/20"
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs text-foreground/70 font-sans-tc">{label}</span>
                  <span className="text-xs font-semibold text-gold">{points}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-xs text-muted-foreground/50">
              基於陳彩綺塔羅靈數系統 · 二十二道靈數密碼
            </p>
          </div>
        </main>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        birthday={result ? `${params.y}-${String(params.m).padStart(2, "0")}-${String(params.d).padStart(2, "0")}` : undefined}
      />
    </div>
  );
}
