/**
 * ShareDialog — Modal for sharing the result page link.
 * Generates a tracked share URL with the user's invite code.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Share2, Copy, Check, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import gsap from "gsap";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  birthday?: string; // YYYY-MM-DD to embed in share link
}

type Platform = "line" | "facebook" | "twitter" | "copy";

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "line",
    label: "LINE",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "bg-[#06C755] hover:bg-[#05b34d]",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "bg-[#1877F2] hover:bg-[#166fe5]",
  },
  {
    id: "twitter",
    label: "X",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-[#000] hover:bg-[#333]",
  },
];

export default function ShareDialog({ isOpen, onClose, birthday }: ShareDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createShareMutation = trpc.shares.create.useMutation();

  // Generate share URL
  const generateShareUrl = useCallback(
    async (platform: Platform) => {
      if (shareUrl && platform === "copy") return shareUrl;

      setIsGenerating(true);
      try {
        const result = await createShareMutation.mutateAsync({
          platform,
          birthday,
        });
        setShareUrl(result.shareUrl);
        return result.shareUrl;
      } catch {
        // Fallback: use current URL without tracking
        const fallback = window.location.href;
        setShareUrl(fallback);
        return fallback;
      } finally {
        setIsGenerating(false);
      }
    },
    [shareUrl, birthday, createShareMutation]
  );

  // Handle platform share
  const handleShare = useCallback(
    async (platform: Platform) => {
      const url = await generateShareUrl(platform);
      const text = "我剛算了塔羅靈數，超準的！來看看你的靈數密碼 ✦";

      switch (platform) {
        case "line":
          window.open(
            `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            "_blank",
            "width=600,height=500"
          );
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            "_blank",
            "width=600,height=500"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            "_blank",
            "width=600,height=500"
          );
          break;
        case "copy":
          break;
      }
    },
    [generateShareUrl]
  );

  // Handle copy link
  const handleCopy = useCallback(async () => {
    const url = await generateShareUrl("copy");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generateShareUrl]);

  // GSAP entrance/exit animation
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: 0.1, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!overlayRef.current || !panelRef.current) {
      onClose();
      return;
    }
    gsap.to(panelRef.current, { opacity: 0, y: 20, duration: 0.2, ease: "power2.in" });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      onComplete: onClose,
    });
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      style={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-sm mx-4 sm:mx-auto rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.14 0.03 260)",
          border: "1px solid oklch(0.25 0.03 260)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-gold" />
            <h3 className="font-serif-tc text-base text-foreground/90">分享你的靈數報告</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-foreground/50" />
          </button>
        </div>

        <p className="px-5 text-xs text-foreground/50 font-sans-tc mb-4">
          分享連結被點擊可獲得 <span className="text-gold">+10 積分</span>，好友完成計算再得 <span className="text-gold">+20 積分</span>
        </p>

        {/* Platform buttons */}
        <div className="px-5 grid grid-cols-3 gap-3 mb-4">
          {PLATFORMS.map(({ id, label, icon, color }) => (
            <button
              key={id}
              onClick={() => handleShare(id)}
              disabled={isGenerating}
              className={`${color} text-white rounded-xl py-3 flex flex-col items-center gap-1.5 transition-all active:scale-95`}
            >
              {icon}
              <span className="text-[11px] font-sans-tc">{label}</span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="px-5 pb-5">
          <button
            onClick={handleCopy}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/20 hover:border-gold/40 hover:bg-gold/5 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-sans-tc">已複製連結</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gold/70" />
                <span className="text-sm text-foreground/70 font-sans-tc">
                  {isGenerating ? "生成中..." : "複製連結"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
