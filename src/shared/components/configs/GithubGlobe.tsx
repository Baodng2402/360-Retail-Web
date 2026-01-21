"use client";
import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

// Marker data for Vietnam cities
const markers = [
    {
        location: [21.0285, 105.8542] as [number, number], // Hà Nội
        label: "Hà Nội",
        shops: "1,200+",
        color: "#06b6d4", // Cyan
    },
    {
        location: [16.0544, 108.2022] as [number, number], // Đà Nẵng  
        label: "Đà Nẵng",
        shops: "500+",
        color: "#10b981", // Emerald
    },
    {
        location: [10.8231, 106.6297] as [number, number], // TP.HCM
        label: "TP.HCM",
        shops: "2,000+",
        color: "#f97316", // Orange
    },
];

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    label: string;
    shops: string;
    color: string;
}

// Project lat/lng to screen position based on globe state
function projectToScreen(
    lat: number,
    lng: number,
    phi: number,
    theta: number,
    centerX: number,
    centerY: number,
    radius: number
): { x: number; y: number; visible: boolean } {
    // Convert degrees to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate 3D position on unit sphere
    // X: left-right, Y: up-down, Z: front-back
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);
    const cosLng = Math.cos(lngRad);
    const sinLng = Math.sin(lngRad);

    // Position on sphere before any rotation
    let x = cosLat * sinLng;
    let y = sinLat;
    let z = cosLat * cosLng;

    // Apply horizontal rotation (phi) - rotate around Y axis
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const x1 = x * cosPhi - z * sinPhi;
    const z1 = x * sinPhi + z * cosPhi;
    x = x1;
    z = z1;

    // Apply vertical tilt (theta) - rotate around X axis
    const cosTheta = Math.cos(-theta);
    const sinTheta = Math.sin(-theta);
    const y1 = y * cosTheta - z * sinTheta;
    const z2 = y * sinTheta + z * cosTheta;
    y = y1;
    z = z2;

    // Point is visible if z > 0 (in front of globe)
    const visible = z > 0.15;

    // Project to 2D screen coordinates
    const screenX = centerX + x * radius;
    const screenY = centerY - y * radius;

    return { x: screenX, y: screenY, visible };
}

export const GithubGlobe = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
    const phiRef = useRef(0);
    const thetaRef = useRef(0.2);
    const animationRef = useRef<number>();

    const [markerScreenPositions, setMarkerScreenPositions] = useState<
        { x: number; y: number; visible: boolean; marker: (typeof markers)[0] }[]
    >([]);
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        label: "",
        shops: "",
        color: "#06b6d4",
    });
    const [zoom, setZoom] = useState(1);
    const zoomRef = useRef(1);

    const baseSize = 500;
    const minZoom = 0.7;
    const maxZoom = 2;

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        let phi = 0; // Will auto-rotate to show Vietnam
        let theta = 0.2;
        let targetPhi = phi;
        let targetTheta = theta;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: baseSize * 2,
            height: baseSize * 2,
            phi: phi,
            theta: theta,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.15],
            markerColor: [0.1, 0.1, 0.15], // Hide cobe's markers
            glowColor: [0.05, 0.05, 0.1],
            markers: [],
            onRender: (state) => {
                // Auto-rotate when not dragging
                if (pointerInteracting.current === null) {
                    targetPhi += 0.002;
                }

                // Smooth interpolation
                phi += (targetPhi - phi) * 0.05;
                theta += (targetTheta - theta) * 0.05;

                state.phi = phi;
                state.theta = theta;
                phiRef.current = phi;
                thetaRef.current = theta;
            },
        });

        // Update marker positions in a separate animation loop
        const updateMarkerPositions = () => {
            const container = containerRef.current;
            if (!container) return;

            const currentZoom = zoomRef.current;
            const displaySize = baseSize * currentZoom;
            const containerRect = container.getBoundingClientRect();

            // Center of the container (where globe is centered)
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            // Globe radius on screen
            const radius = displaySize / 2;

            const positions = markers.map((marker) => {
                const pos = projectToScreen(
                    marker.location[0],
                    marker.location[1],
                    phiRef.current,
                    thetaRef.current,
                    centerX,
                    centerY,
                    radius
                );
                return {
                    x: pos.x,
                    y: pos.y,
                    visible: pos.visible,
                    marker,
                };
            });

            setMarkerScreenPositions(positions);
            animationRef.current = requestAnimationFrame(updateMarkerPositions);
        };

        animationRef.current = requestAnimationFrame(updateMarkerPositions);

        // Pointer events
        const handlePointerDown = (e: PointerEvent) => {
            pointerInteracting.current = { x: e.clientX, y: e.clientY };
            if (containerRef.current) containerRef.current.style.cursor = "grabbing";
        };

        const handlePointerUp = () => {
            pointerInteracting.current = null;
            if (containerRef.current) containerRef.current.style.cursor = "grab";
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (pointerInteracting.current) {
                const dx = e.clientX - pointerInteracting.current.x;
                const dy = e.clientY - pointerInteracting.current.y;
                targetPhi += dx * 0.005;
                targetTheta = Math.max(-0.8, Math.min(0.8, targetTheta - dy * 0.005));
                pointerInteracting.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomRef.current + delta));
            zoomRef.current = newZoom;
            setZoom(newZoom);
        };

        const container = containerRef.current;
        container.addEventListener("pointerdown", handlePointerDown);
        container.addEventListener("pointerup", handlePointerUp);
        container.addEventListener("pointerleave", handlePointerUp);
        container.addEventListener("pointermove", handlePointerMove);
        container.addEventListener("wheel", handleWheel, { passive: false });
        container.style.cursor = "grab";

        return () => {
            globe.destroy();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            container.removeEventListener("pointerdown", handlePointerDown);
            container.removeEventListener("pointerup", handlePointerUp);
            container.removeEventListener("pointerleave", handlePointerUp);
            container.removeEventListener("pointermove", handlePointerMove);
            container.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const handleZoom = (delta: number) => {
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomRef.current + delta));
        zoomRef.current = newZoom;
        setZoom(newZoom);
    };

    const displaySize = baseSize * zoom;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
        >
            {/* Globe */}
            <canvas
                ref={canvasRef}
                style={{
                    width: displaySize,
                    height: displaySize,
                    maxWidth: "100%",
                    aspectRatio: "1",
                }}
                className="opacity-95"
            />

            {/* Markers */}
            {markerScreenPositions.map(({ x, y, visible, marker }) => (
                <div
                    key={marker.label}
                    className="absolute"
                    style={{
                        left: x,
                        top: y,
                        transform: "translate(-50%, -50%)",
                        opacity: visible ? 1 : 0,
                        pointerEvents: visible ? "auto" : "none",
                        zIndex: visible ? 25 : -1,
                        transition: "opacity 0.1s",
                    }}
                    onMouseEnter={(e) =>
                        visible &&
                        setTooltip({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                            label: marker.label,
                            shops: marker.shops,
                            color: marker.color,
                        })
                    }
                    onMouseLeave={() => setTooltip((p) => ({ ...p, visible: false }))}
                    onMouseMove={(e) =>
                        setTooltip((p) => ({ ...p, x: e.clientX, y: e.clientY }))
                    }
                >
                    <div
                        className="relative cursor-pointer"
                        style={{ width: 16 * zoom, height: 16 * zoom, minWidth: 12, minHeight: 12 }}
                    >
                        <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ backgroundColor: marker.color, opacity: 0.4, animationDuration: "1.5s" }}
                        />
                        <div
                            className="absolute inset-0 rounded-full border-2 border-white/70"
                            style={{
                                backgroundColor: marker.color,
                                boxShadow: `0 0 12px ${marker.color}, 0 0 24px ${marker.color}60`,
                            }}
                        />
                    </div>
                </div>
            ))}

            {/* Tooltip */}
            {tooltip.visible && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{ left: tooltip.x + 18, top: tooltip.y - 12 }}
                >
                    <div
                        className="backdrop-blur-md rounded-lg px-3 py-2 shadow-xl"
                        style={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: `2px solid ${tooltip.color}`,
                            boxShadow: `0 4px 20px ${tooltip.color}40`,
                        }}
                    >
                        <p className="text-sm font-bold text-white">{tooltip.label}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: tooltip.color }}>
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tooltip.color }}
                            />
                            {tooltip.shops} shop
                        </p>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-20">
                <div className="flex flex-col gap-1.5 text-xs bg-slate-900/80 backdrop-blur-md rounded-lg px-3 py-2 border border-slate-700/50">
                    {markers.map((m) => (
                        <div key={m.label} className="flex items-center gap-2 text-slate-200">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: m.color, boxShadow: `0 0 4px ${m.color}` }}
                            />
                            {m.label}: {m.shops}
                        </div>
                    ))}
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1">
                <button
                    onClick={() => handleZoom(0.2)}
                    className="w-8 h-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-600/50 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                >
                    +
                </button>
                <button
                    onClick={() => handleZoom(-0.2)}
                    className="w-8 h-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-600/50 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                >
                    −
                </button>
            </div>

            {/* Zoom indicator */}
            <div className="absolute top-3 right-3 z-20 text-xs text-slate-400 bg-slate-900/60 rounded px-2 py-1">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
};