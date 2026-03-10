"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface GlobeProps {
  className?: string;
  size?: number;
}

export function Globe({ className = "", size = 600 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    let width = 0;

    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
    window.addEventListener("resize", onResize);
    onResize();

    // Dynamic import to avoid SSR issues
    let globe: { destroy: () => void } | null = null;
    
    import("cobe").then((cobeModule) => {
      if (!canvasRef.current) return;
      const createGlobeFn =
        // default export (ESM)
        (cobeModule as unknown as { default?: (canvas: HTMLCanvasElement, options: unknown) => { destroy: () => void } }).default ??
        // or named export "createGlobe" (for older typings)
        (cobeModule as unknown as { createGlobe?: (canvas: HTMLCanvasElement, options: unknown) => { destroy: () => void } }).createGlobe;

      if (!createGlobeFn) {
        console.error("cobe module does not export createGlobe function");
        return;
      }

      globe = createGlobeFn(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.1],
        markerColor: [0.1, 0.8, 0.5],
        glowColor: [0.05, 0.4, 0.35],
        markers: [
          { location: [14.5995, 120.9842], size: 0.1 },
          { location: [35.6762, 139.6503], size: 0.1 },
          { location: [51.5074, -0.1278], size: 0.1 },
          { location: [40.7128, -74.006], size: 0.1 },
          { location: [-23.5505, -46.6333], size: 0.1 },
        ],
        onRender: (state: { phi: number; width: number; height: number }) => {
          if (!canvasRef.current) return;
          state.phi = phi;
          phi += 0.005;
          canvasRef.current.style.width = `${state.width / 2}px`;
          canvasRef.current.style.height = `${state.height / 2}px`;
        },
      });
    });

    return () => {
      window.removeEventListener("resize", onResize);
      if (globe) globe.destroy();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          maxWidth: "100%",
          aspectRatio: "1",
        }}
      />
    </motion.div>
  );
}

// Simple animated dots background
export function AnimatedDots({ className = "" }: { className?: string }) {
  const [dots, setDots] = useState<
    { left: string; top: string; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDots(
        Array.from({ length: 20 }, () => ({
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          duration: 2 + Math.random() * 2,
          delay: Math.random() * 2,
        })),
      );
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {dots.map((d, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-30"
            style={{
              left: d.left,
              top: d.top,
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: d.duration,
              repeat: Infinity,
              delay: d.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Floating particles
export function FloatingParticles({ className = "" }: { className?: string }) {
  const [particles, setParticles] = useState<
    {
      left: string;
      top: string;
      driftX: number;
      duration: number;
      delay: number;
    }[]
  >([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setParticles(
        Array.from({ length: 15 }, () => ({
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          driftX: Math.random() * 50 - 25,
          duration: 5 + Math.random() * 5,
          delay: Math.random() * 5,
        })),
      );
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 opacity-20"
          style={{
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, p.driftX, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Gradient orb for visual interest
export function GradientOrb({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Glassmorphism card wrapper
export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl
        border border-white/20 dark:border-gray-700/30
        rounded-2xl shadow-xl
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Animated counter component
export function AnimatedCounter({
  value,
  duration = 1,
}: {
  value: number;
  duration?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}
