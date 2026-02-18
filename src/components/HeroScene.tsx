"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    PerspectiveCamera,
    Environment,
    Stars,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface SceneProps {
    scrollProgress: React.MutableRefObject<number>;
}

/* ═══════════════════════════════════════════════════════
   CAMERA PATH — Bézier curve the camera flies along
   ═══════════════════════════════════════════════════════ */
const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1, 12),      // Start: looking at scene from front
    new THREE.Vector3(-3, 2, 8),       // Drift left & up
    new THREE.Vector3(-1, 3, 4),       // Rise higher, move deeper
    new THREE.Vector3(2, 2.5, 0),      // Sweep right through the middle
    new THREE.Vector3(4, 1, -4),       // Continue right, descend
    new THREE.Vector3(1, 0.5, -8),     // Swing back center, go deeper
    new THREE.Vector3(-2, 2, -12),     // Pull left, rise
    new THREE.Vector3(0, 3, -18),      // Final — deep into the void
], false, "catmullrom", 0.5);

const lookAtPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(0, 1, -2),
    new THREE.Vector3(1, 1.5, -4),
    new THREE.Vector3(0, 1, -6),
    new THREE.Vector3(-1, 0.5, -10),
    new THREE.Vector3(0, 1, -14),
    new THREE.Vector3(0, 2, -20),
    new THREE.Vector3(0, 2, -25),
], false, "catmullrom", 0.5);

/* ═══════════════════════════════════════════════════════
   FLOATING OBJECT — glass / metallic shapes
   ═══════════════════════════════════════════════════════ */
interface FloatObjProps {
    position: [number, number, number];
    geometry: "icosa" | "torus" | "box" | "octahedron" | "torusKnot";
    color: string;
    size: number;
    rotSpeed: [number, number, number];
    floatSpeed: number;
    floatAmp: number;
}

function FloatingObject({ position, geometry, color, size, rotSpeed, floatSpeed, floatAmp }: FloatObjProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const initialY = position[1];

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        ref.current.rotation.x += rotSpeed[0];
        ref.current.rotation.y += rotSpeed[1];
        ref.current.rotation.z += rotSpeed[2];
        ref.current.position.y = initialY + Math.sin(t * floatSpeed) * floatAmp;
    });

    const geo = useMemo(() => {
        switch (geometry) {
            case "icosa": return <icosahedronGeometry args={[size, 0]} />;
            case "torus": return <torusGeometry args={[size, size * 0.35, 16, 32]} />;
            case "box": return <boxGeometry args={[size, size, size]} />;
            case "octahedron": return <octahedronGeometry args={[size, 0]} />;
            case "torusKnot": return <torusKnotGeometry args={[size * 0.7, size * 0.2, 64, 16]} />;
        }
    }, [geometry, size]);

    return (
        <mesh ref={ref} position={position} castShadow>
            {geo}
            <meshPhysicalMaterial
                color={color}
                roughness={0.08}
                metalness={0.6}
                clearcoat={1}
                clearcoatRoughness={0.05}
                envMapIntensity={2.5}
                emissive={color}
                emissiveIntensity={0.15}
                transparent
                opacity={0.85}
            />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════
   GLOW RING — ethereal rings floating in space
   ═══════════════════════════════════════════════════════ */
function GlowRing({ position, radius, color, tilt, speed }: {
    position: [number, number, number];
    radius: number;
    color: string;
    tilt: [number, number, number];
    speed: number;
}) {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        ref.current.rotation.z = t * speed;
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.15 + Math.sin(t * 0.5 + position[2]) * 0.08;
    });

    return (
        <mesh ref={ref} position={position} rotation={tilt}>
            <torusGeometry args={[radius, 0.015, 16, 100]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={4}
                transparent
                opacity={0.2}
                toneMapped={false}
            />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════
   LIGHT BEAM — vertical/angled light pillars
   ═══════════════════════════════════════════════════════ */
function LightBeam({ position, height, color, width }: {
    position: [number, number, number];
    height: number;
    color: string;
    width: number;
}) {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.04 + Math.sin(t * 0.3 + position[0]) * 0.02;
    });

    return (
        <mesh ref={ref} position={position}>
            <cylinderGeometry args={[width, width, height, 8, 1, true]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={0.05}
                side={THREE.DoubleSide}
                toneMapped={false}
            />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════
   PARTICLE FIELD — dense floating dust
   ═══════════════════════════════════════════════════════ */
function ParticleField() {
    const count = 600;
    const ref = useRef<THREE.Points>(null!);

    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const colorPalette = [
            new THREE.Color("#6366f1"),
            new THREE.Color("#a855f7"),
            new THREE.Color("#06b6d4"),
            new THREE.Color("#818cf8"),
            new THREE.Color("#c084fc"),
        ];

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 5;

            const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }
        return { positions: pos, colors: col };
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        ref.current.rotation.y = t * 0.002;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                toneMapped={false}
            />
        </points>
    );
}

/* ═══════════════════════════════════════════════════════
   SPEED LINES — streaks that intensify with scroll
   ═══════════════════════════════════════════════════════ */
function SpeedLines({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
    const count = 120;
    const ref = useRef<THREE.Points>(null!);
    const basePositions = useRef<Float32Array>(new Float32Array(count * 3));

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 2] = Math.random() * -30;
            basePositions.current[i * 3] = pos[i * 3];
            basePositions.current[i * 3 + 1] = pos[i * 3 + 1];
            basePositions.current[i * 3 + 2] = pos[i * 3 + 2];
        }
        return pos;
    }, []);

    useFrame(() => {
        if (!ref.current) return;
        const sp = scrollProgress.current;
        const attrs = ref.current.geometry.attributes.position;

        // Stretch lines with speed
        for (let i = 0; i < count; i++) {
            const bz = basePositions.current[i * 3 + 2];
            attrs.setZ(i, bz + sp * bz * 0.5);
        }
        attrs.needsUpdate = true;

        // Opacity based on scroll speed
        const mat = ref.current.material as THREE.PointsMaterial;
        mat.opacity = Math.min(sp * 0.8, 0.4);
        mat.size = 0.015 + sp * 0.03;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                color="#818cf8"
                size={0.015}
                transparent
                opacity={0}
                sizeAttenuation
                toneMapped={false}
            />
        </points>
    );
}

/* ═══════════════════════════════════════════════════════
   CAMERA CONTROLLER — moves along path with scroll
   ═══════════════════════════════════════════════════════ */
function CameraController({ scrollProgress }: SceneProps) {
    const { camera } = useThree();
    const smoothProgress = useRef(0);
    const lookTarget = useRef(new THREE.Vector3());

    useFrame(() => {
        const target = scrollProgress.current;
        // Super smooth interpolation
        smoothProgress.current += (target - smoothProgress.current) * 0.04;
        const p = THREE.MathUtils.clamp(smoothProgress.current, 0, 0.98);

        // Position along the camera path
        const pos = cameraPath.getPoint(p);
        camera.position.lerp(pos, 0.08);

        // Look-at along the look-at path
        const look = lookAtPath.getPoint(Math.min(p + 0.05, 0.98));
        lookTarget.current.lerp(look, 0.06);
        camera.lookAt(lookTarget.current);
    });

    return null;
}

/* ═══════════════════════════════════════════════════════
   SCENE — the 3D world
   ═══════════════════════════════════════════════════════ */
function Scene({ scrollProgress }: SceneProps) {
    // Scattered objects throughout the scene
    const objects: FloatObjProps[] = useMemo(() => [
        // Near camera start — visible immediately
        { position: [-2.5, 0.5, 6], geometry: "icosa", color: "#6366f1", size: 0.5, rotSpeed: [0.003, 0.005, 0.002], floatSpeed: 0.6, floatAmp: 0.3 },
        { position: [3, 1.5, 5], geometry: "torus", color: "#a855f7", size: 0.4, rotSpeed: [0.002, 0.004, 0.001], floatSpeed: 0.5, floatAmp: 0.2 },
        { position: [1, -0.5, 3], geometry: "octahedron", color: "#06b6d4", size: 0.35, rotSpeed: [0.004, 0.003, 0.005], floatSpeed: 0.7, floatAmp: 0.25 },

        // Mid section
        { position: [-4, 2, 0], geometry: "torusKnot", color: "#818cf8", size: 0.5, rotSpeed: [0.002, 0.003, 0.001], floatSpeed: 0.4, floatAmp: 0.35 },
        { position: [3.5, -1, -2], geometry: "box", color: "#c084fc", size: 0.45, rotSpeed: [0.005, 0.002, 0.004], floatSpeed: 0.55, floatAmp: 0.2 },
        { position: [-1, 3, -3], geometry: "icosa", color: "#6366f1", size: 0.6, rotSpeed: [0.003, 0.004, 0.002], floatSpeed: 0.35, floatAmp: 0.4 },
        { position: [2, 0, -5], geometry: "torus", color: "#a855f7", size: 0.55, rotSpeed: [0.001, 0.005, 0.003], floatSpeed: 0.6, floatAmp: 0.3 },

        // Deep section
        { position: [-3, 1, -7], geometry: "octahedron", color: "#06b6d4", size: 0.5, rotSpeed: [0.004, 0.002, 0.003], floatSpeed: 0.5, floatAmp: 0.25 },
        { position: [4, 2, -9], geometry: "torusKnot", color: "#818cf8", size: 0.45, rotSpeed: [0.002, 0.004, 0.001], floatSpeed: 0.45, floatAmp: 0.3 },
        { position: [0, -1, -10], geometry: "box", color: "#c084fc", size: 0.6, rotSpeed: [0.003, 0.001, 0.005], floatSpeed: 0.5, floatAmp: 0.2 },
        { position: [-2, 2.5, -11], geometry: "icosa", color: "#6366f1", size: 0.4, rotSpeed: [0.005, 0.003, 0.002], floatSpeed: 0.6, floatAmp: 0.35 },

        // Far section
        { position: [3, 0.5, -13], geometry: "torus", color: "#a855f7", size: 0.5, rotSpeed: [0.002, 0.005, 0.004], floatSpeed: 0.4, floatAmp: 0.3 },
        { position: [-1, 1.5, -15], geometry: "torusKnot", color: "#06b6d4", size: 0.55, rotSpeed: [0.003, 0.002, 0.001], floatSpeed: 0.55, floatAmp: 0.25 },
        { position: [2, 3, -16], geometry: "octahedron", color: "#818cf8", size: 0.35, rotSpeed: [0.004, 0.001, 0.005], floatSpeed: 0.65, floatAmp: 0.2 },
        { position: [-3, 0, -18], geometry: "icosa", color: "#c084fc", size: 0.5, rotSpeed: [0.001, 0.004, 0.003], floatSpeed: 0.5, floatAmp: 0.4 },
    ], []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 1, 12]} fov={60} near={0.1} far={100} />
            <CameraController scrollProgress={scrollProgress} />

            <Environment preset="night" />

            {/* Fog for depth */}
            <fog attach="fog" args={["#050510", 8, 35]} />

            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} color="#e0e7ff" />
            <directionalLight position={[-6, 3, -5]} intensity={0.5} color="#6366f1" />
            <pointLight position={[0, 5, 0]} intensity={1.0} color="#a855f7" distance={20} />
            <pointLight position={[-4, -2, -8]} intensity={0.6} color="#06b6d4" distance={15} />
            <pointLight position={[4, 3, -14]} intensity={0.8} color="#818cf8" distance={15} />

            {/* Stars background */}
            <Stars radius={50} depth={50} count={3000} factor={3} saturation={0.3} fade speed={0.3} />

            {/* Floating geometric objects */}
            {objects.map((obj, i) => (
                <FloatingObject key={i} {...obj} />
            ))}

            {/* Glow rings */}
            <GlowRing position={[0, 1, 4]} radius={2.5} color="#6366f1" tilt={[0.3, 0.2, 0]} speed={0.05} />
            <GlowRing position={[-2, 2, -4]} radius={1.8} color="#a855f7" tilt={[0.8, 0, 0.3]} speed={-0.04} />
            <GlowRing position={[1.5, 0.5, -9]} radius={2.2} color="#06b6d4" tilt={[0.5, -0.3, 0.6]} speed={0.06} />
            <GlowRing position={[0, 2, -15]} radius={3.0} color="#818cf8" tilt={[0.2, 0.5, 0]} speed={-0.03} />

            {/* Light beams */}
            <LightBeam position={[-3, 3, 2]} height={12} color="#6366f1" width={0.3} />
            <LightBeam position={[4, 3, -6]} height={10} color="#a855f7" width={0.25} />
            <LightBeam position={[-1, 4, -12]} height={14} color="#06b6d4" width={0.35} />
            <LightBeam position={[2, 3, -17]} height={10} color="#818cf8" width={0.2} />

            {/* Dense particle field */}
            <ParticleField />

            {/* Speed lines (scroll-reactive) */}
            <SpeedLines scrollProgress={scrollProgress} />
        </>
    );
}

/* ═══════════════════════════════════════════════════════
   POST PROCESSING — mount after GL context is ready (avoids null .alpha)
   ═══════════════════════════════════════════════════════ */
function PostProcessing() {
    const { gl } = useThree();
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (!gl) return;
        const id = requestAnimationFrame(() => {
            setReady(true);
        });
        return () => cancelAnimationFrame(id);
    }, [gl]);
    if (!ready) return null;
    return (
        <EffectComposer multisampling={4}>
            <Bloom
                luminanceThreshold={0.15}
                luminanceSmoothing={0.9}
                height={300}
                intensity={1.5}
            />
            <Vignette offset={0.3} darkness={0.7} />
        </EffectComposer>
    );
}

/* ═══════════════════════════════════════════════════════
   EXPORT
   ═══════════════════════════════════════════════════════ */
const glConfig = {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance" as const,
};

export default function HeroScene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
    const [mounted, setMounted] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const id = requestAnimationFrame(() => {
            setReady(true);
        });
        return () => cancelAnimationFrame(id);
    }, [mounted]);

    if (!mounted || !ready) return <div className="w-full h-full" />;

    return (
        <div className="w-full h-full">
            <Canvas
                gl={glConfig}
                dpr={[1, 1.5]}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x050510, 1);
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.0;
                }}
            >
                <Suspense fallback={null}>
                    <Scene scrollProgress={scrollProgress} />
                    <PostProcessing />
                </Suspense>
            </Canvas>
        </div>
    );
}
