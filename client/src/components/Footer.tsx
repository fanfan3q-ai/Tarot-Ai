/**
 * Footer — Site footer with copyright and social media links.
 * Platform brand first, no personal teacher info.
 */

const SOCIAL_LINKS = [
  { label: "Instagram", url: "https://www.instagram.com/tarot_song6866" },
  { label: "TikTok", url: "https://www.tiktok.com/@tarot_song6866" },
  { label: "YouTube", url: "https://youtube.com/channel/UC_R-YgTI-LDL1v2xhD0eilg" },
  { label: "Facebook", url: "https://www.facebook.com/share/1DQyhk8tLd/" },
  { label: "LINE", url: "https://line.me/R/ti/p/@mam7263z" },
];

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t border-gold/10 py-6 sm:py-8 px-6 sm:px-8"
      style={{ background: "oklch(0.08 0.02 260 / 90%)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Copyright */}
        <p className="font-cinzel text-xs sm:text-sm text-gold/40 tracking-wide">
          &copy; 2026 Tarot Numerology &middot; All Rights Reserved
        </p>

        {/* Right: Social links */}
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-cinzel text-xs sm:text-sm text-gold/60 hover:text-gold transition-all duration-300 tracking-wide"
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.textShadow =
                  "0 0 10px rgba(200,149,42,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.textShadow = "none";
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
