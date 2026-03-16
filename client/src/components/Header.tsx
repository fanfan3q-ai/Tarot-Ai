/**
 * Header — Fixed top navigation bar.
 * All-seeing-eye icon + TAROT NUMEROLOGY branding on the left,
 * navigation links on the right that scroll to sections.
 */

import { useCallback } from "react";

const EYE_ICON_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663391558975/oXdMK86fqsJKPKfV4ifck6/all-seeing-eye-2KRvLqjuzTsEM4rvUtzDzU.webp";

interface NavItem {
  label: string;
  target: string; // CSS selector or id
}

const NAV_ITEMS: NavItem[] = [
  { label: "Personality Check", target: "#birthday-form" },
  { label: "Trend Analysis", target: "#course-cta" },
  { label: "About Us", target: "#site-footer" },
];

export default function Header() {
  const handleNavClick = useCallback((target: string) => {
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] border-b border-gold/10"
      style={{
        height: "60px",
        background: "oklch(0.10 0.03 260 / 85%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="h-full mx-auto flex items-center justify-between"
        style={{ paddingLeft: "32px", paddingRight: "32px", maxWidth: "1200px" }}
      >
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/30 flex-shrink-0">
            <img
              src={EYE_ICON_URL}
              alt="Tarot Numerology"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="leading-tight">
            <p className="font-cinzel text-sm sm:text-base text-gold font-bold tracking-wide">
              TAROT NUMEROLOGY
            </p>
            <p className="text-[10px] sm:text-xs text-gold/50 font-sans-tc">
              塔羅靈數系統
            </p>
          </div>
        </div>

        {/* Right: Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.target)}
              className="font-cinzel text-xs sm:text-sm text-gold/70 hover:text-gold transition-all duration-300 tracking-wide"
              style={{
                textShadow: "none",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.textShadow =
                  "0 0 12px rgba(200,149,42,0.6)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.textShadow = "none";
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile: Hamburger-free — just show abbreviated nav */}
        <nav className="flex sm:hidden items-center gap-3">
          <button
            onClick={() => handleNavClick("#birthday-form")}
            className="font-cinzel text-[10px] text-gold/70 hover:text-gold transition-all tracking-wide"
          >
            Check
          </button>
          <button
            onClick={() => handleNavClick("#course-cta")}
            className="font-cinzel text-[10px] text-gold/70 hover:text-gold transition-all tracking-wide"
          >
            Trend
          </button>
        </nav>
      </div>
    </header>
  );
}
