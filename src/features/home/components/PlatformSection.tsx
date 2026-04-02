"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Users,
  ShoppingBag,
  Heart,
  Cpu,
  Globe,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleData {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  accentColor: string;
}

const platformModules: ModuleData[] = [
  {
    id: "people",
    label: "People",
    subtitle: "Quản lý Nhân viên & Ca làm",
    description: "Hệ thống chấm công GPS, phân ca tự động, tính lương thông minh. Không còn sổ sách, không còn nhầm lẫn.",
    features: ["Chấm công GPS", "Phân ca tự động", "Tính lương thông minh", "Báo cáo nhân sự"],
    icon: <Users className="w-8 h-8" />,
    color: "#0ea5e9",
    glowColor: "rgba(14, 165, 233, 0.4)",
    accentColor: "rgba(14, 165, 233, 0.08)",
  },
  {
    id: "product",
    label: "Product",
    subtitle: "POS & Quản lý Hàng hóa",
    description: "Bán hàng cực nhanh, tự động trừ tồn kho, đồng bộ online-offline. Một điểm bán, mọi kênh đều quản lý được.",
    features: ["POS cực nhanh", "Tự động trừ tồn", "Đồng bộ kênh online", "Báo cáo bán hàng"],
    icon: <ShoppingBag className="w-8 h-8" />,
    color: "#FF7B21",
    glowColor: "rgba(255, 123, 33, 0.4)",
    accentColor: "rgba(255, 123, 33, 0.08)",
  },
  {
    id: "customer",
    label: "Customer",
    subtitle: "CRM & Chương trình Loyalty",
    description: "Khách mua là có điểm, có ưu đãi. Hệ thống tự ghi nhận, tự động chăm sóc khách hàng theo segment.",
    features: ["Tích điểm tự động", "Voucher thông minh", "Phân khúc khách hàng", "Chăm sóc tự động"],
    icon: <Heart className="w-8 h-8" />,
    color: "#19D6C8",
    glowColor: "rgba(25, 214, 200, 0.4)",
    accentColor: "rgba(25, 214, 200, 0.08)",
  },
];

function ModuleCard({
  module,
  index,
  scrollYProgress,
  isDark = true,
}: {
  module: ModuleData;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  isDark?: boolean;
}) {
  const cardY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, -30 + index * 10, -60 + index * 20]
  );
  const cardRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, -3 + index * 3, -6 + index * 6]
  );
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15, 0.8], [0.3, 1, 1]);

  // Theme-aware colors
  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(10,15,30,0.92) 0%, rgba(15,23,42,0.88) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.7) 100%)";
  const textBackdrop = isDark
    ? "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.95) 100%)"
    : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)";
  const featureBg = isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255,255,255,0.85)";
  const descriptionColor = isDark ? "text-slate-300" : "text-slate-600";
  const textShadow = isDark ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)";
  const hoverShadow = isDark
    ? `0 24px 64px rgba(0,0,0,0.15), 0 0 40px ${module.glowColor}`
    : `0 24px 64px rgba(0,0,0,0.15), 0 0 30px ${module.glowColor}40`;
  const cardBorder = isDark ? `${module.color}25` : `${module.color}35`;
  const outerGlowOpacity = isDark ? "1" : "0"; // hide outer glow in light mode
  const cardBoxShadow = isDark
    ? `0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${module.color}15`
    : `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px ${module.color}20`;

  return (
    <motion.div
      className="relative w-full"
      style={{ y: cardY, rotateZ: cardRotate, opacity: cardOpacity }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700"
        style={{
          background: module.glowColor,
          opacity: outerGlowOpacity === "1" ? undefined : 0,
        }}
      />

      {/* Card */}
      <motion.div
        className="relative group rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-2xl"
        style={{
          background: cardBg,
          borderColor: cardBorder,
          boxShadow: cardBoxShadow,
        }}
        whileHover={{
          y: -8,
          boxShadow: hoverShadow,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Accent top bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${module.color} 50%, transparent 100%)`,
          }}
        />

        {/* Background overlay to block glow behind */}
        <div
          className="absolute inset-0 z-0 pointer-events-none rounded-3xl backdrop-blur-md"
          style={{ background: cardBg }}
        />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            {/* Icon */}
            <motion.div
              className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${module.color}25 0%, ${module.color}10 100%)`,
                color: module.color,
                boxShadow: `0 0 30px ${module.glowColor}`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {module.icon}
            </motion.div>

            <div className="flex-1 relative">
              {/* Backdrop so text pops against the 360° glow */}
              <div
                className="absolute -inset-4 -z-10 rounded-2xl"
                style={{
                  background: textBackdrop,
                  backdropFilter: "blur(8px)",
                }}
              />
              <h3
                className="text-2xl font-black tracking-tight mb-1 relative z-10"
                style={{
                  background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 8px ${module.glowColor})`,
                }}
              >
                {module.label}
              </h3>
              <p className="text-sm font-semibold relative z-10" style={{ color: `${module.color}bb` }}>
                {module.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            className={`text-sm leading-relaxed mb-6 font-medium ${descriptionColor}`}
            style={{ textShadow }}
          >
            {module.description}
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2">
            {module.features.map((feature, fIdx) => (
              <motion.span
                key={feature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 relative z-10"
                style={{
                  background: featureBg,
                  borderColor: `${module.color}60`,
                  color: module.color,
                  textShadow,
                  boxShadow: isDark
                    ? `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
                    : `0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: fIdx * 0.08 }}
                whileHover={{
                  background: `${module.color}25`,
                  borderColor: `${module.color}80`,
                }}
              >
                <Layers className="w-3 h-3 flex-shrink-0" />
                {feature}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Hover scan line effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${module.glowColor}10 50%, transparent 100%)`,
            animation: "scan-line 2s ease-in-out infinite",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function ConnectingLines({ isDark = true }: { isDark?: boolean }) {
  const gradientId = isDark ? "platform-line-grad" : "platform-line-grad-light";

  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 overflow-visible"
      style={{ pointerEvents: "none", height: "100%" }}
    >
      <defs>
        <linearGradient id="platform-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#FF7B21" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#19D6C8" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="platform-line-grad-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
        </linearGradient>
        <filter id="platform-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Center hub to left module */}
      <motion.path
        d="M 200 200 C 160 120, 100 120, 80 140"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeDasharray="8 5"
        filter={isDark ? "url(#platform-glow)" : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        style={{ strokeDashoffset: 0, animation: "dash-flow 3s linear infinite" }}
      />

      {/* Center hub to center module (top) */}
      <motion.path
        d="M 200 200 C 200 140, 200 100, 200 80"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeDasharray="8 5"
        filter={isDark ? "url(#platform-glow)" : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{ strokeDashoffset: 0, animation: "dash-flow 3s linear infinite reverse" }}
      />

      {/* Center hub to right module */}
      <motion.path
        d="M 200 200 C 240 120, 300 120, 320 140"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeDasharray="8 5"
        filter={isDark ? "url(#platform-glow)" : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.7 }}
        style={{ strokeDashoffset: 0, animation: "dash-flow 3s linear infinite" }}
      />

      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 13; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

function CenterHub({ isDark = true }: { isDark?: boolean }) {
  const ringBorderColor = isDark ? "#0ea5e9" : "#0ea5e9";
  const ring2BorderColor = isDark ? "#FF7B21" : "#f97316";
  const ring3BorderColor = isDark ? "#19D6C8" : "#14b8a6";

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute rounded-full border border-dashed"
          style={{
            width: "140px",
            height: "140px",
            borderColor: ringBorderColor,
            opacity: isDark ? 0.2 : 0.4,
            animation: "hub-spin 12s linear infinite",
          }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute rounded-full border"
          style={{
            width: "100px",
            height: "100px",
            borderColor: ring2BorderColor,
            opacity: isDark ? 0.3 : 0.45,
            animation: "hub-spin-reverse 8s linear infinite",
          }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute rounded-full border"
          style={{
            width: "70px",
            height: "70px",
            borderColor: ring3BorderColor,
            opacity: isDark ? 0.4 : 0.5,
            animation: "hub-spin 6s linear infinite",
          }}
        />

        {/* Core */}
        <motion.div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(255,123,33,0.1) 60%, transparent 100%)"
              : "radial-gradient(circle, rgba(14,165,233,0.25) 0%, rgba(249,115,22,0.12) 60%, transparent 100%)",
            boxShadow: isDark
              ? "0 0 40px rgba(14, 165, 233, 0.4), 0 0 80px rgba(255, 123, 33, 0.2)"
              : "0 0 30px rgba(14, 165, 233, 0.3), 0 0 60px rgba(249, 115, 22, 0.15), 0 4px 20px rgba(0,0,0,0.12)",
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center justify-center">
            <Globe
              className="w-8 h-8 mb-0.5"
              style={{ color: isDark ? "#22d3ee" : "#0ea5e9" }}
            />
            <span
              className="text-[10px] font-black tracking-wider"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #FF7B21, #19D6C8)"
                  : "linear-gradient(135deg, #f97316, #0ea5e9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              360°
            </span>
          </div>
        </motion.div>

        {/* Pulse rings */}
        {[1.5, 2, 2.5].map((scale, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${80 * scale}px`,
              height: `${80 * scale}px`,
              borderColor: isDark ? `rgba(14, 165, 233, ${0.12 - i * 0.04})` : `rgba(14, 165, 233, ${0.2 - i * 0.04})`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: isDark ? [0.12 - i * 0.04, 0.05, 0.12 - i * 0.04] : [0.2 - i * 0.04, 0.08, 0.2 - i * 0.04],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}
      </div>

      <style>{`
        @keyframes hub-spin {
          from { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
          to { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
        }
        @keyframes hub-spin-reverse {
          from { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
          to { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
        }
      `}</style>
    </motion.div>
  );
}

function FloatingParticles({ isDark = true }: { isDark?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(16)].map((_, i) => {
        const bgColor = isDark
          ? (i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#FF7B21" : "#19D6C8")
          : (i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#f97316" : "#14b8a6");
        const glowColor = isDark
          ? (i % 3 === 0 ? "rgba(14,165,233,0.5)" : i % 3 === 1 ? "rgba(255,123,33,0.5)" : "rgba(25,214,200,0.5)")
          : (i % 3 === 0 ? "rgba(14,165,233,0.3)" : i % 3 === 1 ? "rgba(249,115,22,0.3)" : "rgba(20,184,166,0.3)");

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 4) * 1.5}px`,
              height: `${2 + (i % 4) * 1.5}px`,
              background: bgColor,
              left: `${5 + i * 6}%`,
              top: `${10 + (i * 7) % 80}%`,
              opacity: isDark ? 0.2 + (i % 3) * 0.1 : 0.15 + (i % 3) * 0.05,
              boxShadow: `0 0 ${4 + (i % 3) * 2}px ${glowColor}`,
            }}
            animate={{
              y: [0, -15 - i * 2, 0],
              x: [0, (i % 2 === 0 ? 5 : -5) + i, 0],
              opacity: isDark
                ? [0.2 + (i % 3) * 0.1, 0.5 + (i % 3) * 0.1, 0.2 + (i % 3) * 0.1]
                : [0.15 + (i % 3) * 0.05, 0.3 + (i % 3) * 0.05, 0.15 + (i % 3) * 0.05],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

export function PlatformSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sectionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const sectionY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(to bottom, #020817, #050d1f, #071428)"
          : "linear-gradient(to bottom, #f8fafc, #ffffff, #f1f5f9)",
      }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14, 165, 233, ${isDark ? "0.12" : "0.06"}) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255, 123, 33, ${isDark ? "0.08" : "0.04"}) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(25, 214, 200, ${isDark ? "0.08" : "0.04"}) 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: isDark ? 0.04 : 0.06,
          backgroundImage: isDark
            ? `linear-gradient(rgba(14, 165, 233, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.6) 1px, transparent 1px)`
            : `linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <FloatingParticles isDark={isDark} />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ opacity: sectionOpacity, y: sectionY }}
      >
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{
              background: "rgba(255, 123, 33, 0.1)",
              borderColor: "rgba(255, 123, 33, 0.3)",
              color: "#FF9F45",
            }}
          >
            <Cpu className="w-3 h-3" />
            360° All-in-One Platform
          </motion.div>

          <motion.h2
            className="mb-4"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: "900",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            <span
              className="block"
              style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
            >
              Mọi thứ bạn cần,
            </span>
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #FF7B21 0%, #FF9F45 40%, #19D6C8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              trong một nền tảng
            </span>
          </motion.h2>

          <motion.p
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed dark:text-slate-400/80 text-slate-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Ba module chính hoạt động đồng bộ: People quản lý nhân sự, Product quản lý
            hàng hóa, Customer quản lý khách hàng. Dữ liệu liên thông, vận hành trơn tru.
          </motion.p>
        </motion.div>

        {/* Platform Visualization */}
        <div className="relative">
          <ConnectingLines isDark={isDark} />
          <CenterHub isDark={isDark} />

          {/* Module Cards */}
          <div className="relative grid md:grid-cols-3 gap-6 md:gap-8 items-start">
            {platformModules.map((module, index) => (
              <div
                key={module.id}
                className={cn(
                  "relative",
                  index === 0 && "md:pt-8",
                  index === 1 && "md:pt-0",
                  index === 2 && "md:pt-8"
                )}
              >
                <ModuleCard
                  module={module}
                  index={index}
                  scrollYProgress={scrollYProgress}
                  isDark={isDark}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          className="mt-16 md:mt-20 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            {[
              { value: "3", label: "Module tích hợp", color: "#0ea5e9" },
              { value: "1", label: "Giao diện duy nhất", color: "#FF7B21" },
              { value: "24/7", label: "Cloud tự động", color: "#a855f7" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 md:p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:border-opacity-60"
                style={{
                  background: isDark ? `${stat.color}08` : `${stat.color}10`,
                  borderColor: isDark ? `${stat.color}20` : `${stat.color}25`,
                  backdropFilter: "blur(8px)",
                }}
                whileHover={{ y: -4 }}
              >
                <p
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm md:text-base font-medium"
                  style={{ color: isDark ? "rgba(148,163,184,0.7)" : "rgba(71,85,105,0.8)" }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
