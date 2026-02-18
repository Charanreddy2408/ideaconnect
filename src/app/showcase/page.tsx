"use client";

import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  MeshTransmissionMaterial, 
  Text, 
  OrbitControls, 
  Stars,
  Sparkles
} from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";

// --- Scene Helpers ---
const GlassMaterial = ({ color = "#ffffff", thickness = 2 }) => (
    <MeshTransmissionMaterial
        backside
        backsideThickness={0.5}
        thickness={thickness}
        samples={16}
        transmission={0.95}
        clearcoat={1}
        clearcoatRoughness={0}
        distortion={0.1}
        chromaticAberration={0.05}
        anisotropy={0.1}
        roughness={0}
        color={color}
        attenuationDistance={0.5}
        attenuationColor={color}
    />
);

// --- Scene 1: The Spark ---
function Spark({ refProp }: { refProp: React.RefObject<THREE.Group | null> }) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (refProp.current) {
        refProp.current.scale.setScalar(1 + Math.sin(t * 8) * 0.2);
    }
  });

  return (
    <group ref={refProp}>
      <mesh>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
            color="#818cf8" 
            emissive="#818cf8" 
            emissiveIntensity={50} 
            toneMapped={false} 
        />
        <pointLight color="#818cf8" intensity={15} distance={10} />
      </mesh>
    </group>
  );
}

// --- Component: Comment Bubble ---
function CommentBubble({ position, text, delay, visible }: { position: [number, number, number], text: string, delay: number, visible: boolean }) {
    const ref = useRef<THREE.Group>(null!);
    
    useEffect(() => {
        if (visible) {
            gsap.fromTo(ref.current.scale, 
                { x: 0, y: 0, z: 0 }, 
                { x: 1, y: 1, z: 1, duration: 1.2, delay, ease: "back.out(2)" }
            );
        }
    }, [visible]);

    return (
        <group ref={ref} position={position} scale={[0,0,0]}>
            <mesh>
                <capsuleGeometry args={[0.15, 0.6, 4, 16]} />
                <GlassMaterial color="#4f46e5" thickness={0.5} />
            </mesh>
            <Text position={[0, 0, 0.12]} fontSize={0.08} color="white" maxWidth={0.5} textAlign="center">
                {text}
            </Text>
        </group>
    );
}

// --- Component: Chat Window ---
function ChatWindow({ refProp }: { refProp: React.RefObject<THREE.Group | null> }) {
    return (
        <group ref={refProp} position={[12, 0, 0]}>
            <mesh>
                <boxGeometry args={[4, 6, 0.1]} />
                <GlassMaterial color="#1e1b4b" thickness={1.5} />
            </mesh>
            <Text position={[0, 2.6, 0.08]} fontSize={0.2} font="black" color="white">LIVE NETWORK</Text>
            
            {[
                { y: 1.8, t: "Visionary found! 🤝", c: "#6366f1" },
                { y: 0.9, t: "Scaling to 10k users...", c: "#818cf8" },
                { y: 0, t: "Collaboration is power", c: "#4f46e5" }
            ].map((m, i) => (
                <group key={i} position={[0, m.y, 0.08]}>
                    <mesh position={[0, 0, -0.01]}>
                        <planeGeometry args={[3.2, 0.6]} />
                        <meshStandardMaterial color={m.c} transparent opacity={0.25} />
                    </mesh>
                    <Text position={[0, 0, 0.01]} fontSize={0.12} color="white">{m.t}</Text>
                </group>
            ))}
        </group>
    );
}

// --- Scene 5: Community Network ---
function NetworkLines({ visible }: { visible: boolean }) {
    const count = 60;
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < count; i++) {
            p.push(new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20
            ));
        }
        return p;
    }, []);

    const linesRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (visible && linesRef.current) {
            linesRef.current.rotation.y += 0.0005;
            linesRef.current.rotation.x += 0.0002;
        }
    });

    return (
        <group ref={linesRef} visible={visible}>
            {points.map((p, i) => (
                <group key={i}>
                    <mesh position={p}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial 
                            color="#818cf8" 
                            emissive="#818cf8" 
                            emissiveIntensity={10} 
                            toneMapped={false}
                        />
                    </mesh>
                    {i < points.length - 1 && (
                        <line>
                            <bufferGeometry attach="geometry" setFromPoints={[p, points[i+1]]} />
                            <lineBasicMaterial attach="material" color="#6366f1" transparent opacity={0.1} />
                        </line>
                    )}
                </group>
            ))}
        </group>
    );
}

// --- Final Reveal Content ---
function FinalLogo({ refProp }: { refProp: React.RefObject<THREE.Group | null> }) {
    return (
        <group ref={refProp} scale={[0,0,0]}>
            <Text
                fontSize={2}
                font="black"
                color="white"
                position={[0, 0, 0]}
            >
                IdeaConnect
                <MeshTransmissionMaterial 
                    transmission={1} 
                    thickness={2} 
                    roughness={0} 
                    chromaticAberration={0.1}
                    backside
                />
            </Text>
            <pointLight position={[0, 0, 2]} intensity={20} color="#6366f1" />
        </group>
    );
}

// --- Main Showcase Controller ---
export default function ShowcasePage() {
  const sparkRef = useRef<THREE.Group>(null!);
  const cardRef = useRef<THREE.Group>(null!);
  const chatRef = useRef<THREE.Group>(null!);
  const logoRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  
  const [showComments, setShowComments] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    // SCENE 1: The Spark (0-3s)
    tl.to(sparkRef.current.position, { z: 5, duration: 2, ease: "power2.inOut" });
    tl.to(sparkRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "-=0.3");
    
    // SCENE 2: The Card (3-6s)
    tl.to(cardRef.current.position, { y: 0, duration: 1.5, ease: "expo.out" }, "-=0.5");
    tl.to(cardRef.current.rotation, { y: Math.PI * 0.08, duration: 2 }, "-=1");

    // SCENE 3: Comments (6-9s)
    tl.add(() => setShowComments(true), 6);
    tl.to(cardRef.current.position, { x: -3, duration: 2, ease: "power3.inOut" }, 8.5);

    // SCENE 4: Chat (9-13s)
    tl.to(chatRef.current.position, { x: 2.5, duration: 2, ease: "power3.inOut" }, 9);
    tl.to(cameraRef.current.position, { z: 12, duration: 3 }, 10);

    // SCENE 5: Network (13-17s)
    tl.add(() => setShowNetwork(true), 13);
    tl.to(cardRef.current.scale, { x: 0, y: 0, z: 0, duration: 1 }, 13);
    tl.to(chatRef.current.scale, { x: 0, y: 0, z: 0, duration: 1 }, 13.5);
    tl.to(cameraRef.current.position, { z: 35, duration: 4, ease: "power2.inOut" }, 13);

    // SCENE 6: Logo Reveal (17-21s)
    tl.to(logoRef.current.scale, { x: 1, y: 1, z: 1, duration: 2, ease: "back.out(1.5)" }, 17.5);
    tl.fromTo(".cta-text", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.5 }, 19);

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="h-screen w-full bg-[#020617] relative overflow-hidden">
      {/* Cinematic 2D UI */}
      <div className="cta-text absolute inset-x-0 bottom-24 flex flex-col items-center z-40 pointer-events-none">
          <div className="space-y-6 flex flex-col items-center">
            <p className="text-violet-400 font-black uppercase tracking-[0.5em] text-xs opacity-70">The Future of Collaboration</p>
            <h2 className="text-3xl font-black text-white/50 tracking-widest uppercase">IdeaConnect</h2>
            <button className="mt-4 px-14 py-5 bg-white text-black font-black rounded-full shadow-[0_0_50px_rgba(139,92,246,0.3)] pointer-events-auto hover:bg-violet-50 hover:shadow-[0_0_80px_rgba(139,92,246,0.5)] transition-all duration-500 transform hover:scale-110 active:scale-95">
                Launch Platform
            </button>
          </div>
      </div>

      <Canvas shadows gl={{ antialias: false, powerPreference: "high-performance" }}>
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={50} />
        
        <color attach="background" args={['#010413']} />
        
        <ambientLight intensity={0.1} />
        <spotLight position={[20, 20, 20]} angle={0.15} penumbra={1} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#d946ef" />
        
        <Suspense fallback={null}>
          <Spark refProp={sparkRef} />
          
          <group ref={cardRef} position={[0, -10, 0]}>
             <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh>
                    <boxGeometry args={[3.2, 4.4, 0.15]} />
                    <GlassMaterial />
                </mesh>
                <Text position={[0, 1.4, 0.1]} fontSize={0.22} font="black" color="white">
                    NEXT-GEN STARTUP
                </Text>
                
                {showComments && (
                    <>
                        <CommentBubble position={[2.4, 1.2, 0]} text="Insane vision! ✨" delay={0.1} visible={showComments} />
                        <CommentBubble position={[2.6, 0.2, 0.2]} text="I'm in! 🤝" delay={0.4} visible={showComments} />
                        <CommentBubble position={[2.4, -1, 0.1]} text="Let's build together" delay={0.7} visible={showComments} />
                    </>
                )}
             </Float>
          </group>

          <ChatWindow refProp={chatRef} />

          <NetworkLines visible={showNetwork} />

          <FinalLogo refProp={logoRef} />

          <Sparkles count={400} scale={[40, 40, 20]} size={1.5} speed={0.4} color="#818cf8" opacity={0.5} />
          <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
          
          <Environment preset="night" />

          {/* Cinematic Post Processing */}
          <EffectComposer multisampling={0}>
              <Bloom 
                intensity={1.5} 
                luminanceThreshold={0.4} 
                luminanceSmoothing={0.9} 
              />
              <Noise opacity={0.02} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>

      </Canvas>
    </div>
  );
}
