"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import createGlobe from "cobe";

// ====================
// CONSTANTS & DATA
// ====================

interface Marker {
  location: [number, number];
  size: number;
  city: string;
  shops: string;
  color: string;
}

// Vietnam cities with precise coordinates [latitude, longitude]
const VIETNAM_MARKERS: Marker[] = [
    {
        location: [21.0285, 105.8542], // Hà Nội
        size: 0.08,
        city: "Hà Nội",
        shops: "1,200+",
        color: "#06b6d4", // Cyan
    },
    {
        location: [16.0544, 108.2022], // Đà Nẵng
        size: 0.08,
        city: "Đà Nẵng",
        shops: "800+",
        color: "#10b981", // Green
    },
    {
        location: [10.8231, 106.6297], // TP. Hồ Chí Minh
        size: 0.08,
        city: "TP.HCM",
        shops: "2,000+",
        color: "#f97316", // Orange
    },
];

// Vietnam centered position - focus on Vietnam center (latitude ~16°N, longitude ~106°E)
const VIETNAM_PHI = 1.83; // Longitude rotation
const INITIAL_THETA = 0.45; // Latitude tilt - adjusted to center Vietnam better

// Globe size
const GLOBE_SIZE = 500;

// Convert hex to RGB array for cobe
const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
        ]
        : [1, 1, 1];
};

// ====================
// COMPONENT
// ====================

export const GithubGlobe = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<any>(null);

    // Interaction state
    const pointerInteracting = useRef<{ x: number; y: number; id: number } | null>(null);

    // Globe state
    const [currentMarkerIndex, setCurrentMarkerIndex] = useState<number>(-1);
    const [zoom, setZoom] = useState(1);
    const zoomRef = useRef(1);

    const phiRef = useRef(VIETNAM_PHI);
    const thetaRef = useRef(INITIAL_THETA);

    // ====================
    // GLOBE SETUP
    // ====================

    useEffect(() => {
        if (!canvasRef.current) return;

        let phi = phiRef.current;
        let theta = thetaRef.current;
        let width = GLOBE_SIZE * 2;

        // Initialize globe with Vietnam markers
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width,
            height: width,
            phi: phi,
            theta: theta,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.15, 0.15, 0.2],
            markerColor: [0.1, 0.8, 1],
            glowColor: [0.1, 0.1, 0.15],
            markers: VIETNAM_MARKERS.map((m) => ({
                location: m.location,
                size: m.size,
                color: hexToRgb(m.color),
            })),
            onRender: (state) => {
                phi = phiRef.current;
                theta = thetaRef.current;

                // Auto-rotate slowly when not interacting
                if (!pointerInteracting.current) {
                    phi += 0.002;
                }

                state.phi = phi;
                state.theta = theta;

                phiRef.current = phi;
                thetaRef.current = theta;
            },
        });

        globeRef.current = globe;

        // Fade in animation
        setTimeout(() => {
            if (canvasRef.current) {
                canvasRef.current.style.opacity = "1";
            }
        }, 100);

        return () => {
            globe.destroy();
            globeRef.current = null;
        };
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(0.8, Math.min(1.5, zoomRef.current + delta));
            zoomRef.current = newZoom;
            setZoom(newZoom);

            thetaRef.current = Math.max(-0.5, Math.min(0.5, thetaRef.current - delta * 0.1));
        };

        el.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", onWheel);
        };
    }, []);

    // ====================
    // EVENT HANDLERS
    // ====================

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        pointerInteracting.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = "grabbing";
        }
        e.preventDefault();
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (pointerInteracting.current?.id === e.pointerId) {
            pointerInteracting.current = null;
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (pointerInteracting.current?.id === e.pointerId) {
            const deltaX = e.clientX - pointerInteracting.current.x;
            const deltaY = e.clientY - pointerInteracting.current.y;

            phiRef.current += deltaX * 0.008;
            thetaRef.current = Math.max(-1.1, Math.min(1.1, thetaRef.current + deltaY * 0.008));

            pointerInteracting.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        }
    }, []);

    // ====================
    // RENDER
    // ====================

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
            style={{ touchAction: "none", userSelect: "none" }}
        >
            {/* Globe Canvas */}
            <div
                className="relative"
                style={{ width: GLOBE_SIZE, height: GLOBE_SIZE }}
            >
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerOut={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerMove={handlePointerMove}
                    className="opacity-0 transition-opacity duration-500 cursor-grab active:cursor-grabbing select-none"
                    style={{
                        width: GLOBE_SIZE,
                        height: GLOBE_SIZE,
                        transform: `scale(${zoom})`,
                        transition: "transform 0.2s ease-out",
                        transformOrigin: "center center",
                        touchAction: "none",
                    }}
                />
            </div>

            {/* Legend - Location Info */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
                <div className="flex flex-col gap-2 text-xs bg-slate-900/90 backdrop-blur-md rounded-xl px-4 py-3 border border-slate-700/50 shadow-xl">
                    <div className="text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wide">
                        📍 Phạm vi hoạt động
                    </div>
                    {VIETNAM_MARKERS.map((marker, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 text-slate-200 hover:text-white transition-all duration-200 cursor-pointer hover:scale-105"
                            onMouseEnter={() => setCurrentMarkerIndex(idx)}
                            onMouseLeave={() => setCurrentMarkerIndex(-1)}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-lg animate-pulse"
                                style={{
                                    backgroundColor: marker.color,
                                    boxShadow: `0 0 8px ${marker.color}`,
                                    animationDuration: "2s",
                                }}
                            />
                            <span className="font-medium">{marker.city}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold" style={{ color: marker.color }}>
                                {marker.shops}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hover Tooltip - displays when hovering legend items */}
            {currentMarkerIndex >= 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
                    <div
                        className="backdrop-blur-md rounded-xl px-5 py-3 shadow-2xl border-2"
                        style={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            borderColor: VIETNAM_MARKERS[currentMarkerIndex].color,
                            boxShadow: `0 8px 32px ${VIETNAM_MARKERS[currentMarkerIndex].color}40`,
                        }}
                    >
                        <p className="text-base font-bold text-white mb-1">
                            {VIETNAM_MARKERS[currentMarkerIndex].city}
                        </p>
                        <p
                            className="text-sm font-semibold flex items-center gap-2"
                            style={{ color: VIETNAM_MARKERS[currentMarkerIndex].color }}
                        >
                            <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{
                                    backgroundColor: VIETNAM_MARKERS[currentMarkerIndex].color,
                                }}
                            />
                            {VIETNAM_MARKERS[currentMarkerIndex].shops} cửa hàng
                        </p>
                    </div>
                </div>
            )}

            {/* Controls Instructions */}
            <div className="absolute top-4 right-4 z-20 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50 shadow-lg pointer-events-none">
                <p className="flex items-center gap-1.5 mb-1">
                    <span>🖱️</span>
                    <span className="font-medium">Kéo để xoay</span>
                </p>
                <p className="flex items-center gap-1.5">
                    <span>🔍</span>
                    <span className="font-medium">Scroll để zoom</span>
                </p>
            </div>

            {/* Zoom Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-xs text-slate-300 bg-slate-900/70 backdrop-blur-sm rounded-full px-3 py-1 border border-slate-700/50 pointer-events-none">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
};