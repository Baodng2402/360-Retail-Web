"use client";
import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { SavePass } from "three/addons/postprocessing/SavePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { CopyShader } from "three/addons/shaders/CopyShader.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";

// Rounded square wave — Matt Rossman / Codrops tutorial
const roundedSquareWave = (t: number, delta: number, a: number, f: number) =>
  ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);

// Deterministic random for consistent positions
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ── Config ──
interface MouseState {
  x: number;
  y: number;
  active: boolean;
  pressed: boolean;
}

const getConfig = (isMobile: boolean) => ({
  dotCount: isMobile ? 5000 : 12000,
  dotRadius: isMobile ? 0.18 : 0.15,
  gridWidth: isMobile ? 100 : 120,
});

// ── Breathing Dots Mesh ──
interface DotsMeshProps {
  isDark: boolean;
  mouseRef: React.MutableRefObject<MouseState>;
  isIdleRef: React.MutableRefObject<boolean>;
}

function BreathingDotsMesh({ isDark, mouseRef, isIdleRef }: DotsMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const config = useMemo(() => getConfig(isMobile), [isMobile]);
  const pressFactorRef = useRef(0);
  const idleTimeRef = useRef(0);
  const focusRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  const { positions, distances, vec, transform } = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const distances: number[] = [];
    const right = new THREE.Vector3(1, 0, 0);
    const gridHeight = Math.ceil(config.dotCount / config.gridWidth);

    for (let i = 0; i < config.dotCount; i++) {
      const pos = new THREE.Vector3();
      pos.x = (i % config.gridWidth) - config.gridWidth / 2;
      pos.y = Math.floor(i / config.gridWidth) - gridHeight / 2;
      pos.y += (i % 2) * 0.5;
      pos.x += seededRandom(i * 2 + 1) * 0.3;
      pos.y += seededRandom(i * 2 + 2) * 0.3;
      positions.push(pos);
      distances.push(pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5);
    }
    return { positions, distances, vec: new THREE.Vector3(), transform: new THREE.Matrix4() };
  }, [config.dotCount, config.gridWidth]);

  useFrame(({ clock }, dt) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;

    // ── Idle detection ──
    if (mouseRef.current.active) {
      idleTimeRef.current = 0;
      isIdleRef.current = false;
      targetRef.current.x = mouseRef.current.x;
      targetRef.current.y = mouseRef.current.y;
    } else {
      idleTimeRef.current += dt;
      if (idleTimeRef.current > 1.5) isIdleRef.current = true;
    }

    // ── Smooth focus lerp ──
    const lr = isIdleRef.current ? 0.015 : 0.08;
    focusRef.current.x += (targetRef.current.x - focusRef.current.x) * lr;
    focusRef.current.y += (targetRef.current.y - focusRef.current.y) * lr;

    // ── Smooth press factor (0→1 on press, 1→0 on release) ──
    const pt = mouseRef.current.pressed ? 1 : 0;
    pressFactorRef.current += (pt - pressFactorRef.current) * 0.06;
    const pf = pressFactorRef.current;

    // ── Mouse world coords (compute once) ──
    const interactive = !isIdleRef.current;
    const mx = interactive ? (focusRef.current.x - 0.5) * config.gridWidth : 0;
    const my = interactive ? (focusRef.current.y - 0.5) * config.gridWidth : 0;

    for (let i = 0; i < config.dotCount; i++) {
      const dist = distances[i];

      // Tutorial exact: distance-dependent phase & roundness
      const waveT = t - dist / 25;
      const waveDelta = 0.15 + (0.2 * dist) / 72;
      const wave = roundedSquareWave(waveT, waveDelta, 0.4, 1 / 3.8);
      let scale = wave + 1.3; // range ~0.9–1.7

      if (interactive) {
        const pos = positions[i];
        const dx = pos.x - mx;
        const dy = pos.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);

        // Press/hold: pull dots inward toward cursor (tight radius)
        if (pf > 0.01) {
          const pull = Math.max(0, 1 - d / (config.gridWidth * 0.17));
          scale -= pull * pf * 0.45;
        }

        // Hover: gentle push outward from cursor (tight radius)
        if (pf < 0.5) {
          const push = Math.max(0, 1 - d / (config.gridWidth * 0.12));
          scale += push * (1 - pf) * 0.15;
        }
      }

      vec.copy(positions[i]).multiplyScalar(scale);
      transform.setPosition(vec);
      meshRef.current.setMatrixAt(i, transform);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const dotColor = useMemo(() => (isDark ? "#ffffff" : "#1e293b"), [isDark]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, config.dotCount]}>
      <circleGeometry args={[config.dotRadius, 8]} />
      <meshBasicMaterial color={dotColor} />
    </instancedMesh>
  );
}

// ── RGB Delay Post-Processing (imperative EffectComposer) ──
function Effects() {
  const composerRef = useRef<InstanceType<typeof EffectComposer> | null>(null);
  const blendRef = useRef<InstanceType<typeof ShaderPass> | null>(null);
  const saveRef = useRef<InstanceType<typeof SavePass> | null>(null);
  const rtARef = useRef<THREE.WebGLRenderTarget | null>(null);
  const rtBRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const swap = useRef(false);
  const { scene, gl, size, camera } = useThree();

  const triColorMix = useMemo(() => ({
    uniforms: {
      tDiffuse1: { value: null as THREE.Texture | null },
      tDiffuse2: { value: null as THREE.Texture | null },
      tDiffuse3: { value: null as THREE.Texture | null },
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: `varying vec2 vUv;uniform sampler2D tDiffuse1;uniform sampler2D tDiffuse2;uniform sampler2D tDiffuse3;void main(){vec4 d0=texture2D(tDiffuse1,vUv);vec4 d1=texture2D(tDiffuse2,vUv);vec4 d2=texture2D(tDiffuse3,vUv);gl_FragColor=vec4(d0.r,d1.g,d2.b,min(min(d0.a,d1.a),d2.a));}`,
  }), []);

  useEffect(() => {
    const rtA = new THREE.WebGLRenderTarget(size.width, size.height);
    const rtB = new THREE.WebGLRenderTarget(size.width, size.height);
    rtARef.current = rtA;
    rtBRef.current = rtB;

    const composer = new EffectComposer(gl);
    composer.setSize(size.width, size.height);

    composer.addPass(new RenderPass(scene, camera));

    const blend = new ShaderPass(triColorMix, "tDiffuse1");
    blend.needsSwap = false;
    composer.addPass(blend);
    blendRef.current = blend;

    const sp = new SavePass(rtA);
    sp.needsSwap = true;
    composer.addPass(sp);
    saveRef.current = sp;

    const pr = gl.getPixelRatio();
    const fxaa = new ShaderPass(FXAAShader);
    fxaa.uniforms["resolution"].value.set(1 / (size.width * pr), 1 / (size.height * pr));
    composer.addPass(fxaa);
    composer.addPass(new ShaderPass(CopyShader));

    composerRef.current = composer;

    return () => {
      composer.dispose();
      rtA.dispose();
      rtB.dispose();
      composerRef.current = null;
      blendRef.current = null;
      saveRef.current = null;
      rtARef.current = null;
      rtBRef.current = null;
    };
  }, [gl, scene, camera, size, triColorMix]);

  // Swap delay buffers & render each frame
  useFrame(() => {
    if (!composerRef.current || !blendRef.current || !saveRef.current || !rtARef.current || !rtBRef.current) return;

    const delay1 = swap.current ? rtBRef.current : rtARef.current;
    const delay2 = swap.current ? rtARef.current : rtBRef.current;

    saveRef.current.renderTarget = delay2;
    blendRef.current.uniforms["tDiffuse2"].value = delay1.texture;
    blendRef.current.uniforms["tDiffuse3"].value = delay2.texture;

    swap.current = !swap.current;
    composerRef.current.render();
  }, 1);

  return null;
}

// ── Main Export ──
interface BreathingDotsBackgroundProps {
  isDark: boolean;
}

export function BreathingDotsBackground({ isDark }: BreathingDotsBackgroundProps) {
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, active: false, pressed: false });
  const isIdleRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    mouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current.active = true;
  }, []);

  const onMouseDown = useCallback(() => {
    mouseRef.current.pressed = true;
    mouseRef.current.active = true;
  }, []);

  const onMouseUp = useCallback(() => {
    mouseRef.current.pressed = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
    mouseRef.current.pressed = false;
  }, []);

  // Touch support for mobile
  const onTouchStart = useCallback((e: TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    mouseRef.current.x = (e.touches[0].clientX - rect.left) / rect.width;
    mouseRef.current.y = 1 - (e.touches[0].clientY - rect.top) / rect.height;
    mouseRef.current.pressed = true;
    mouseRef.current.active = true;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    mouseRef.current.x = (e.touches[0].clientX - rect.left) / rect.width;
    mouseRef.current.y = 1 - (e.touches[0].clientY - rect.top) / rect.height;
    mouseRef.current.active = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    mouseRef.current.pressed = false;
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onMouseMove, onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair">
      <Canvas
        orthographic
        camera={{ zoom: 20, position: [0, 0, 100], near: 0.1, far: 200 }}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, isMobile ? 1 : 1.5]}
        style={{ background: "transparent" }}
      >
        <BreathingDotsMesh isDark={isDark} mouseRef={mouseRef} isIdleRef={isIdleRef} />
        <Effects />
      </Canvas>
    </div>
  );
}
