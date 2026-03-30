"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  ChevronDown,
} from "lucide-react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import TrueFocus from "@/shared/components/TrueFocus";

// ===============================
// VIDEO CONFIG — Edit your video path here
// ===============================
const VIDEO_PATH = "/videos/hero.mp4";

// ===============================
// THREE.JS SCENE COMPONENTS
// ===============================

function FloatingRing({
  radius = 2,
  tubeWidth = 0.012,
  color = "#0ea5e9",
  rotationSpeed = 0.3,
  tiltX = Math.PI / 4,
  tiltZ = 0,
  opacity = 0.3,
}: {
  radius?: number;
  tubeWidth?: number;
  color?: string;
  rotationSpeed?: number;
  tiltX?: number;
  tiltZ?: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.z += rotationSpeed * 0.01;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tubeWidth, 8, 120]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function PlatformModule({
  position = [0, 0, 0] as [number, number, number],
  color = "#0ea5e9",
  size = 0.3,
}: {
  position?: [number, number, number];
  color?: string;
  size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const floatOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const baseY = position[1];
    const floatY = Math.sin(t * 0.7 + floatOffset.current) * 0.14;
    ref.current.position.y = baseY + floatY;
    ref.current.rotation.y += 0.006;
    ref.current.rotation.x = Math.sin(t * 0.25 + floatOffset.current) * 0.08;
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size * 2.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.03} />
      </mesh>
      <mesh ref={ref}>
        <boxGeometry args={[size, size * 0.65, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.08}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh ref={ref} scale={1.05}>
        <boxGeometry args={[size, size * 0.65, size]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function OrbitingDot({
  parentPos = [0, 0, 0] as [number, number, number],
  radius = 0.65,
  color = "#0ea5e9",
  speed = 1,
  size = 0.035,
}: {
  parentPos?: [number, number, number];
  radius?: number;
  color?: string;
  speed?: number;
  size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame(() => {
    if (!ref.current) return;
    angle.current += speed * 0.012;
    ref.current.position.x = parentPos[0] + Math.cos(angle.current) * radius;
    ref.current.position.z = parentPos[2] + Math.sin(angle.current) * radius;
    ref.current.position.y = parentPos[1] + Math.sin(angle.current * 0.4) * 0.18;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function StarField() {
  const count = 1000;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, []);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}

function ConnectionLine({
  from = [0, 0, 0] as [number, number, number],
  to = [1, 1, 1] as [number, number, number],
  color = "#0ea5e9",
}: {
  from?: [number, number, number];
  to?: [number, number, number];
  color?: string;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2;
  const midZ = (from[2] + to[2]) / 2;

  const axis = new THREE.Vector3(dx, dy, dz).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, axis);
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  return (
    <mesh position={[midX, midY, midZ]} rotation={euler}>
      <cylinderGeometry args={[0.003, 0.003, length, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

function PlatformScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.04;
  });

  const moduleConfigs = [
    { position: [-1.9, 0.5, -1.2] as [number, number, number], color: "#0ea5e9", size: 0.36, name: "People" },
    { position: [0, 1.1, -0.9] as [number, number, number], color: "#FF7B21", size: 0.42, name: "Product" },
    { position: [1.9, 0.5, -1.2] as [number, number, number], color: "#19D6C8", size: 0.36, name: "Customer" },
  ];

  const centerHub = [0, 0.3, 0] as [number, number, number];

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={2} color="#0ea5e9" />
      <pointLight position={[-6, -4, -6]} intensity={1.2} color="#FF7B21" />
      <pointLight position={[0, -6, 4]} intensity={1} color="#19D6C8" />
      <pointLight position={[3, -3, 5]} intensity={0.6} color="#a78bfa" />

      <StarField />

      <FloatingRing radius={2.0} color="#0ea5e9" rotationSpeed={0.4} tiltX={Math.PI / 3} opacity={0.22} />
      <FloatingRing radius={2.5} color="#FF7B21" rotationSpeed={-0.25} tiltX={Math.PI / 4.5} tiltZ={0.4} opacity={0.18} />
      <FloatingRing radius={3.0} color="#19D6C8" rotationSpeed={0.18} tiltX={Math.PI / 2.5} opacity={0.1} />

      <group position={centerHub}>
        <mesh>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1.2} metalness={0.95} roughness={0.05} transparent opacity={0.92} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.48, 16, 16]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.06} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.55, 0.008, 8, 80]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.4} />
        </mesh>
      </group>

      {moduleConfigs.map((cfg) => (
        <group key={cfg.name}>
          <PlatformModule position={cfg.position} color={cfg.color} size={cfg.size} />
          {[0, 1, 2].map((j) => (
            <OrbitingDot key={j} parentPos={cfg.position} radius={cfg.size + 0.25 + j * 0.18} color={cfg.color} speed={0.8 + j * 0.5} size={0.03 + j * 0.008} />
          ))}
        </group>
      ))}

      {moduleConfigs.map((cfg) => (
        <ConnectionLine key={`line-${cfg.name}`} from={centerHub} to={cfg.position} color={cfg.color} />
      ))}
    </group>
  );
}

// ===============================
// CANVAS PARTICLE SYSTEM
// ===============================

function useCanvasParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; life: number; maxLife: number }[] = [];
    const colors = ["#0ea5e9", "#FF7B21", "#19D6C8", "#a78bfa", "#f0abfc", "#38bdf8"];

    const resize = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (particles.length > 50) return;
      const maxLife = 120 + Math.random() * 60;
      particles.push({
        x: Math.random() * (canvas?.width ?? 800),
        y: Math.random() * (canvas?.height ?? 600),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.1,
        life: 0,
        maxLife,
      });
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.06) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.2 ? (progress / 0.2) * p.alpha : progress > 0.8 ? ((1 - progress) / 0.2) * p.alpha : p.alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animationId); };
  }, [canvasRef]);
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms — fade later so users don’t scroll through a long “empty black” strip
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55, 0.92], [1, 0.35, 0]);

  // Video parallax
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Three.js scene parallax
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const sceneScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.65]);
  const sceneX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-10%"]);

  // Overlay fades out as you scroll
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08, 0.25], [1, 1, 0]);

  // Canvas particles
  useCanvasParticles(canvasRef);

  // Mark scene ready
  useEffect(() => {
    const timer = setTimeout(() => setSceneReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-background dark:bg-[#020617]"
      style={{ height: "min(95svh, 105vh)", minHeight: "87svh" }}
    >
      {/* ====================== STICKY WRAPPER ====================== */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">

        {/* ===== LAYER 0: VIDEO BACKGROUND ===== */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            y: videoY,
            opacity: videoError ? 0 : 1,
          }}
        >
          {/* Fallback dark background (shows while video loads) */}
          <div
            className="absolute inset-0 dark:hidden"
            style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)" }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{ background: "linear-gradient(135deg, #010408 0%, #020c1b 50%, #051525 100%)" }}
          />
          
          {/* Video element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23010408'/%3E%3Cstop offset='50%25' style='stop-color:%23020c1b'/%3E%3Cstop offset='100%25' style='stop-color:%23051525'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1920' height='1080'/%3E%3C/svg%3E"
            onLoadedData={() => {
              console.log("Video loaded successfully");
            }}
            onError={() => {
              setVideoError(true);
              console.log("Video failed to load from:", VIDEO_PATH);
            }}
          >
            <source src={VIDEO_PATH} type="video/mp4" />
          </video>
        </motion.div>

        {/* ===== LAYER 1: FALLBACK GRADIENT ===== */}
        {videoError && (
          <>
            <div
              className="absolute inset-0 z-0 dark:hidden"
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 72%, #f8fafc 100%)",
              }}
            />
            <div
              className="absolute inset-0 z-0 hidden dark:block"
              style={{
                background: "linear-gradient(135deg, #010408 0%, #020c1b 25%, #051525 50%, #071828 72%, #020a16 100%)",
              }}
            />
          </>
        )}

        {/* ===== LAYER 2: AMBIENT LIGHT ZONES (dark mode only) ===== */}
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

        {/* ===== LAYER 3: CSS GRID OVERLAY (dark mode only) ===== */}
        <div
          className="absolute inset-0 z-2 opacity-[0.04] hidden dark:block"
          style={{
            backgroundImage: "linear-gradient(rgba(14, 165, 233, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        {/* ===== LAYER 4: CANVAS PARTICLES (dark mode only) ===== */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-3 pointer-events-none hidden dark:block"
          style={{ opacity: 0.9 }}
        />

        {/* ===== LAYER 5: THREE.JS 3D SCENE (dark mode only) ===== */}
        <motion.div
          className="absolute inset-0 z-4 hidden dark:block"
          style={{ y: sceneY, x: sceneX, scale: sceneScale }}
        >
          {sceneReady && (
            <Canvas
              camera={{ position: [0, 0, 6.5], fov: 48 }}
              gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
              style={{ background: "transparent" }}
              onCreated={({ gl, scene }) => {
                gl.setClearColor(0x000000, 0);
                scene.background = null;
              }}
            >
              <PlatformScene />
            </Canvas>
          )}
        </motion.div>

        {/* ===== LAYER 6: OVERLAY (text readability) ===== */}
        <motion.div
          className="absolute inset-0 z-10 hidden dark:block"
          style={{
            opacity: overlayOpacity,
            background: "linear-gradient(to bottom, rgba(1,4,8,0.5) 0%, rgba(1,4,8,0.35) 40%, rgba(1,4,8,0.55) 70%, rgba(1,4,8,0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          className="absolute inset-0 z-10 block dark:hidden"
          style={{
            opacity: overlayOpacity,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0.7) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* ===== LAYER 7: DECORATIVE CSS FLOATING CUBES (dark mode only) ===== */}
        <div className="hidden dark:block">
          <MiniFloatingCube className="top-[7%] right-[5%]" size={50} color="#0ea5e9" delay={0.3} />
          <MiniFloatingCube className="top-[16%] right-[17%]" size={30} color="#FF7B21" delay={0.7} />
          <MiniFloatingCube className="bottom-[14%] right-[7%]" size={38} color="#19D6C8" delay={1.1} />
          <MiniFloatingCube className="top-[28%] left-[3%]" size={34} color="#a78bfa" delay={0.5} />
          <MiniFloatingCube className="bottom-[24%] left-[5%]" size={24} color="#34d399" delay={1.4} />
          <MiniFloatingCube className="top-[4%] left-[14%]" size={20} color="#0ea5e9" delay={1.8} />
        </div>

        {/* ===== LAYER 8: CONTENT ===== */}
        <div className="relative z-20 flex items-center w-full h-full px-4 sm:px-8 lg:px-16 xl:px-20">
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

            {/* TrueFocus — move up to right below headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mb-6 sm:mb-8 flex justify-center lg:justify-start w-full"
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
                className="group relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-9 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base overflow-hidden transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #FF7B21 0%, #FF9F45 45%, #19D6C8 100%)", boxShadow: "0 8px 40px rgba(255, 123, 33, 0.45), 0 2px 10px rgba(0,0,0,0.3)", color: "white" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)" }} />
                <span className="relative z-10">Bắt đầu miễn phí</span>
                <ArrowRight className="relative z-10 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>

              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 px-5 sm:px-6 md:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 border backdrop-blur-md hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto dark:bg-white/10 dark:border-white/20 dark:text-slate-100 bg-slate-900/10 border-slate-700/30 text-slate-800"
                style={{ backdropFilter: "blur(12px)" }}
              >
                Đăng nhập
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
              {([
                { icon: <ShieldCheck className="w-4 h-4" />, text: "No credit card" },
                { icon: <Zap className="w-4 h-4" />, text: "5-min setup" },
                { icon: <Headphones className="w-4 h-4" />, text: "24/7 Support" },
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
