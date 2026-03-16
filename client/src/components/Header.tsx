/**
 * Header — Fixed top navigation bar.
 * Desktop: All-seeing-eye icon + TAROT NUMEROLOGY + nav links.
 * Mobile: Hamburger menu → full-screen slide-in overlay from right.
 */

import { useCallback, useState, useEffect, useRef } from "react";
import gsap from "gsap";

const EYE_ICON_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663391558975/oXdMK86fqsJKPKfV4ifck6/all-seeing-eye-2KRvLqjuzTsEM4rvUtzDzU.webp";

interface NavItem {
  label: string;
  target: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Personality Check", target: "#birthday-form" },
  { label: "Trend Analysis", target: "#course-cta" },
  { label: "About Us", target: "#site-footer" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const handleNavClick = useCallback(
    (target: string) => {
      setMenuOpen(false);
      // Small delay to let menu close animation start
      setTimeout(() => {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    },
    []
  );

  // GSAP animation for mobile menu
  useEffect(() => {
    if (!overlayRef.current || !menuPanelRef.current) return;

    if (menuOpen) {
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      gsap.to(overlayRef.current, {
        opacity: 1,
        visibility: "visible",
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        menuPanelRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.4, ease: "power3.out" }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(menuPanelRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power3.in",
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.visibility = "hidden";
          }
        },
      });
    }
  }, [menuOpen]);

  return (
    <>
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
          style={{ paddingLeft: "16px", paddingRight: "16px", maxWidth: "1200px" }}
        >
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-gold/30 flex-shrink-0">
              <img
                src={EYE_ICON_URL}
                alt="Tarot Numerology"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div className="leading-tight">
              <p className="font-cinzel text-xs sm:text-base text-gold font-bold tracking-wide">
                TAROT NUMEROLOGY
              </p>
              <p className="text-[9px] sm:text-xs text-gold/50 font-sans-tc">
                塔羅靈數系統
              </p>
            </div>
          </div>

          {/* Right: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.target)}
                className="font-cinzel text-xs sm:text-sm text-gold/70 hover:text-gold transition-all duration-300 tracking-wide"
                style={{ textShadow: "none" }}
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

          {/* Right: Mobile Hamburger Button */}
          <button
            className="flex md:hidden flex-col items-center justify-center gap-[5px] w-8 h-8 p-1"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span
              className="block w-5 h-[2px] rounded-full"
              style={{ background: "oklch(0.72 0.14 75)" }}
            />
            <span
              className="block w-5 h-[2px] rounded-full"
              style={{ background: "oklch(0.72 0.14 75)" }}
            />
            <span
              className="block w-5 h-[2px] rounded-full"
              style={{ background: "oklch(0.72 0.14 75)" }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Menu Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200]"
        style={{ opacity: 0, visibility: "hidden" }}
        onClick={() => setMenuOpen(false)}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: "oklch(0.08 0.03 260 / 80%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        />

        {/* Slide-in Panel from Right */}
        <div
          ref={menuPanelRef}
          className="absolute top-0 right-0 h-full w-[75%] max-w-[320px] flex flex-col items-center justify-center gap-10"
          style={{
            background: "oklch(0.10 0.03 260 / 95%)",
            borderLeft: "1px solid oklch(0.72 0.14 75 / 15%)",
            transform: "translateX(100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gold/70 hover:text-gold transition-colors"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>

          {/* Nav Items */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.target)}
              className="font-cinzel text-lg text-gold/80 hover:text-gold transition-all duration-300 tracking-widest"
              style={{ fontSize: "1.1rem" }}
            >
              {item.label}
            </button>
          ))}

          {/* Decorative Divider */}
          <p className="text-gold/20 text-xs tracking-[0.3em]">
            ──── ✦ ────
          </p>
        </div>
      </div>
    </>
  );
}
