"use client";
import { useRef, useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  ChevronDown,
} from "lucide-react";
import TrueFocus from "@/shared/components/TrueFocus";
import { useTranslation } from "react-i18next";

// Lazy load Three.js canvas — code-splits the heavy 3D bundle
const BreathingDotsBackground = lazy(() =>
  import("./BreathingDotsBackground").then((m) => ({ default: m.BreathingDotsBackground }))
);

// ===============================
// CSS FLOATING CUBES
// ===============================
function MiniFloatingCube({ size = 40, color = "#0ea5e9", delay = 0, className = "" }: { size?: number; color?: string; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [0, 18, 0, -12, 0], rotateY: [0, 360], y: [0, -10, 0, -6, 0] }}
        transition={{ duration: 20 + delay * 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute border rounded-lg"
          style={{
            width: size * 0.65, height: size * 0.65,
            left: size * 0.175, top: size * 0.175,
            borderColor: `${color}90`, background: `${color}10`,
            transform: "translateZ(0px)", boxShadow: `0 0 15px ${color}30, inset 0 0 15px ${color}08`,
          }}
        />
        <div
          className="absolute border rounded-lg"
          style={{
            width: size, height: size,
            borderColor: `${color}35`,
            background: `linear-gradient(135deg, ${color}12, transparent)`,
            transform: `rotateX(60deg) translateZ(${size * 0.3}px) translateY(${-size * 0.5}px)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ===============================
// MAIN HERO SECTION
// ===============================
export function HeroSection() {
  const { t } = useTranslation("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms for content
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55, 0.92], [1, 0.35, 0]);

  // Overlay fades out as you scroll
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08, 0.25], [1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-background dark:bg-[#020617]"
      style={{ height: "min(95svh, 105vh)", minHeight: "87svh" }}
    >
      {/* ====================== STICKY WRAPPER ====================== */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* ===== LAYER 0: FALLBACK GRADIENT BACKGROUND ===== */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #010408 0%, #020c1b 50%, #051525 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          }}
        />

        {/* ===== LAYER 1: AMBIENT LIGHT ZONES (dark mode only) ===== */}
        <motion.div
          className="absolute inset-0 z-1 hidden dark:block"
          animate={{
            background: [
              "radial-gradient(ellipse 70% 50% at 20% 40%, rgba(14, 165, 233, 0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(255, 123, 33, 0.14) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 50% 70%, rgba(25, 214, 200, 0.1) 0%, transparent 60%)",
              "radial-gradient(ellipse 70% 50% at 22% 38%, rgba(14, 165, 233, 0.22) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 78% 32%, rgba(255, 123, 33, 0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 48% 72%, rgba(25, 214, 200, 0.12) 0%, transparent 60%)",
              "radial-gradient(ellipse 70% 50% at 20% 40%, rgba(14, 165, 233, 0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(255, 123, 33, 0.14) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 50% 70%, rgba(25, 214, 200, 0.1) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ===== LAYER 2: CSS GRID OVERLAY ===== */}
        <div
          className="absolute inset-0 z-2 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(14, 165, 233, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        {/* ===== LAYER 3: BREATHING DOTS BACKGROUND (Matt Rossman technique) ===== */}
        {/* 
          - Full-screen Canvas with InstancedMesh + Chromatic Aberration
          - Idle mode: automatic continuous breathing wave
          - Interactive mode: mouse warps/pushes dots
          - 60fps+, reduces dots on mobile
        */}
        <div className="absolute inset-0 z-5">
          <Suspense fallback={null}>
            <BreathingDotsBackground isDark={isDark} />
          </Suspense>
        </div>

        {/* ===== LAYER 4: OVERLAY (text readability) ===== */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{
            opacity: overlayOpacity,
            background: isDark
              ? "linear-gradient(to bottom, rgba(1,4,8,0.5) 0%, rgba(1,4,8,0.35) 40%, rgba(1,4,8,0.55) 70%, rgba(1,4,8,0.85) 100%)"
              : "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.45) 70%, rgba(255,255,255,0.65) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* ===== LAYER 5: DECORATIVE CSS FLOATING CUBES ===== */}
        <div className="pointer-events-none">
          <MiniFloatingCube className="top-[7%] right-[5%]" size={50} color="#0ea5e9" delay={0.3} />
          <MiniFloatingCube className="top-[16%] right-[17%]" size={30} color="#FF7B21" delay={0.7} />
          <MiniFloatingCube className="bottom-[14%] right-[7%]" size={38} color="#19D6C8" delay={1.1} />
          <MiniFloatingCube className="top-[28%] left-[3%]" size={34} color="#a78bfa" delay={0.5} />
          <MiniFloatingCube className="bottom-[24%] left-[5%]" size={24} color="#34d399" delay={1.4} />
          <MiniFloatingCube className="top-[4%] left-[14%]" size={20} color="#0ea5e9" delay={1.8} />
        </div>

        {/* ===== LAYER 6: CONTENT (pointer-events-none so mouse reaches canvas) ===== */}
        <div className="relative z-20 flex items-center w-full h-full px-4 sm:px-8 lg:px-16 xl:px-20 pointer-events-none">
          <motion.div
            className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl lg:max-w-[50%] pt-20 lg:pt-0"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-4 w-full"
            >
              <h1
                className="dark:text-white text-slate-900"
                style={{
                  fontSize: "clamp(32px, 5vw, 62px)",
                  fontWeight: "800",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                }}
              >
                Quản lý bán hàng đa kênh
              </h1>
            </motion.div>

            {/* TrueFocus — pointer-events-auto so it stays interactive */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mb-6 sm:mb-8 flex justify-center lg:justify-start w-full pointer-events-auto"
            >
              <TrueFocus
                sentence="Cùng 360 Retail"
                manualMode
                blurAmount={5}
                borderColor="#FF7B21"
                animationDuration={0.5}
                pauseBetweenAnimations={1}
                textGradient="from-[#FF7B21] to-[#19D6C8]"
                fontSize="clamp(1rem, 4vw, 2.75rem)"
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto items-center"
            >
              <Link
                to="/dashboard"
                className="pointer-events-auto group relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-9 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base overflow-hidden transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #FF7B21 0%, #FF9F45 45%, #19D6C8 100%)", boxShadow: "0 8px 40px rgba(255, 123, 33, 0.45), 0 2px 10px rgba(0,0,0,0.3)", color: "white" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)" }} />
                <span className="relative z-10">Bắt đầu miễn phí</span>
                <ArrowRight className="relative z-10 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>

              <Link
                to="/login"
                className="pointer-events-auto group flex items-center justify-center gap-2 px-5 sm:px-6 md:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 border backdrop-blur-md hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto dark:bg-white/10 dark:border-white/20 dark:text-slate-100 bg-slate-900/10 border-slate-700/30 text-slate-800"
                style={{ backdropFilter: "blur(12px)" }}
              >
                Đăng nhập
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
              {([
                { icon: <ShieldCheck className="w-4 h-4" />, text: t("hero.trust.noCreditCard") },
                { icon: <Zap className="w-4 h-4" />, text: t("hero.trust.fiveMinSetup") },
                { icon: <Headphones className="w-4 h-4" />, text: t("hero.trust.support247") },
              ] as const).map((item, i) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "rgba(148, 163, 184, 0.9)" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.95 + i * 0.08 }}
                >
                  <span style={{ color: "#19D6C8" }}>{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <div className="hidden lg:block flex-1 h-full" />
        </div>

        {/* ===== SCROLL INDICATOR ===== */}
        <motion.div
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase dark:text-slate-400/50 text-slate-600">
            Scroll để khám phá
          </span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 dark:text-slate-400/50 text-slate-600" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
