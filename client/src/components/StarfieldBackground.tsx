import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

/**
 * GSAP-powered starfield particle background.
 * Renders on a fixed canvas behind all content.
 * Mobile-optimized: fewer particles on small screens.
 */
export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);
      initStars();
    }

    function initStars() {
      // Fewer stars on mobile for performance
      const isMobile = width < 768;
      const starCount = isMobile ? 80 : 180;
      starsRef.current = [];

      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.15 + 0.02,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }

      // Initialize shooting stars pool
      shootingStarsRef.current = [];
      for (let i = 0; i < 3; i++) {
        shootingStarsRef.current.push({
          x: 0, y: 0, length: 0, speed: 0, angle: 0, opacity: 0, active: false,
        });
      }
    }

    function spawnShootingStar() {
      const inactive = shootingStarsRef.current.find(s => !s.active);
      if (!inactive) return;
      inactive.x = Math.random() * width * 0.8;
      inactive.y = Math.random() * height * 0.3;
      inactive.length = Math.random() * 80 + 40;
      inactive.speed = Math.random() * 4 + 3;
      inactive.angle = (Math.random() * 30 + 15) * (Math.PI / 180);
      inactive.opacity = 1;
      inactive.active = true;

      gsap.to(inactive, {
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => { inactive.active = false; },
      });
    }

    let frame = 0;
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Draw nebula gradient
      const gradient = ctx.createRadialGradient(
        width * 0.3, height * 0.4, 0,
        width * 0.3, height * 0.4, width * 0.6
      );
      gradient.addColorStop(0, "rgba(30, 20, 60, 0.15)");
      gradient.addColorStop(0.5, "rgba(15, 10, 40, 0.08)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Second nebula
      const gradient2 = ctx.createRadialGradient(
        width * 0.7, height * 0.6, 0,
        width * 0.7, height * 0.6, width * 0.4
      );
      gradient2.addColorStop(0, "rgba(100, 60, 20, 0.06)");
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      frame++;
      for (const star of starsRef.current) {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 210, 190, ${alpha})`;
        ctx.fill();

        // Subtle glow for larger stars
        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 149, 42, ${alpha * 0.1})`;
          ctx.fill();
        }

        // Slow drift
        star.y -= star.speed;
        if (star.y < -5) {
          star.y = height + 5;
          star.x = Math.random() * width;
        }
      }

      // Draw shooting stars
      for (const ss of shootingStarsRef.current) {
        if (!ss.active) continue;
        const endX = ss.x + Math.cos(ss.angle) * ss.length;
        const endY = ss.y + Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
        grad.addColorStop(0, `rgba(200, 149, 42, ${ss.opacity})`);
        grad.addColorStop(1, `rgba(200, 149, 42, 0)`);

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
      }

      // Randomly spawn shooting stars
      if (frame % 180 === 0 && Math.random() > 0.5) {
        spawnShootingStar();
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
