"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
    loading: () => null,
});

/* ═══════ Helpers ═══════ */
function splitChars(text: string, className: string) {
    return text.split("").map((ch, i) => (
        <span
            key={i}
            className={`${className} inline-block`}
            style={ch === " " ? { width: "0.3em" } : undefined}
        >
            {ch === " " ? "\u00A0" : ch}
        </span>
    ));
}

/* ═══════ Static Data ═══════ */
const featureIcons = [
    // Smart Matching — crosshair/target
    <svg key="f0" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg>,
    // Real-time Chat — inbox
    <svg key="f1" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
    // Trust Scores — shield check
    <svg key="f2" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    // Launch Tools — rocket
    <svg key="f3" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>,
];

const features = [
    { title: "Smart Matching", desc: "AI finds partners with complementary skills, aligned goals, and shared vision.", num: "01" },
    { title: "Real-time Chat", desc: "End-to-end encrypted messaging, file sharing, voice — everything built in.", num: "02" },
    { title: "Trust Scores", desc: "Community-driven verification & reputation system for quality connections.", num: "03" },
    { title: "Launch Tools", desc: "From prototype to market — milestone planning, resource sharing, analytics.", num: "04" },
];

const steps = [
    { num: "01", title: "Share Your Vision", desc: "Post your idea with rich details — the problem, the market, and the skills you need to make it real." },
    { num: "02", title: "Get Matched", desc: "Our intelligent algorithm analyzes complementary strengths and connects you with the right co-founders." },
    { num: "03", title: "Build Together", desc: "Collaborate through integrated tools — real-time chat, shared milestones, file sharing, and more." },
    { num: "04", title: "Launch & Scale", desc: "Take your validated product to market backed by a passionate, aligned team ready to execute." },
];

const testimonials = [
    { name: "Sarah Chen", role: "Founder, DataFlow", quote: "Found my technical co-founder in 2 days. We raised our seed round 3 months later.", avatar: "S" },
    { name: "Alex Rivera", role: "CTO, BuildStack", quote: "The matching algorithm connected me with the perfect business partner. Now a team of 12.", avatar: "A" },
    { name: "Maya Patel", role: "CEO, GreenLeaf", quote: "Trust scoring gave me confidence to collaborate with strangers who became family.", avatar: "M" },
];

const stats = [
    { value: 1200, suffix: "+", label: "Active Founders" },
    { value: 450, suffix: "+", label: "Partners Matched" },
    { value: 89, suffix: "%", label: "Success Rate" },
    { value: 300, suffix: "+", label: "Products Launched" },
];

const marqueeWords = ["Innovate", "Connect", "Build", "Launch", "Grow", "Scale", "Dream", "Create", "Ship", "Disrupt"];

/* ═══════ Hero image with fallback when missing ═══════ */
function HeroImage({ src, alt, className = "", loading = "eager" }: { src: string; alt: string; className?: string; loading?: "eager" | "lazy" }) {
    const [error, setError] = useState(false);
    return (
        <>
            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    className={className}
                    loading={loading}
                    decoding="async"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                    <svg className="w-1/3 h-1/3 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
            )}
        </>
    );
}

/* ═══════════════════════════════════
   COMPONENT
   ═══════════════════════════════════ */
export default function Home() {
    const { user } = useAuth();
    const mainRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const scrollProgressRef = useRef(0);

    useEffect(() => {
        if (!mainRef.current) return;

        /* ═══ Lenis Smooth Scroll ═══ */
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        /* ═══ Custom Cursor ═══ */
        const cursor = cursorRef.current!;
        const cursorDot = cursorDotRef.current!;
        let cx = 0, cy = 0, dx = 0, dy = 0;

        const onMouseMove = (e: MouseEvent) => {
            cx = e.clientX;
            cy = e.clientY;
            gsap.to(cursorDot, { x: cx, y: cy, duration: 0.1, ease: "power2.out" });
        };
        window.addEventListener("mousemove", onMouseMove);

        const cursorTick = () => {
            dx += (cx - dx) * 0.12;
            dy += (cy - dy) * 0.12;
            gsap.set(cursor, { x: dx, y: dy });
        };
        gsap.ticker.add(cursorTick);

        const hoverEls = mainRef.current.querySelectorAll("a, button, .magnetic");
        hoverEls.forEach((el) => {
            el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
        });

        /* ═══ GSAP Master Context ═══ */
        const mm = gsap.matchMedia();
        const ctx = gsap.context(() => {

            /* ── Scroll Progress Bar ── */
            gsap.to("#scroll-progress", {
                scaleX: 1, ease: "none",
                scrollTrigger: { trigger: mainRef.current, start: "top top", end: "bottom bottom", scrub: 0.3 },
            });

            /* ── 3D Background Scroll Progress ── */
            ScrollTrigger.create({
                trigger: mainRef.current,
                start: "top top",
                end: "bottom bottom",
                onUpdate(self) {
                    scrollProgressRef.current = self.progress;
                },
            });

            /* ── Velocity Skew ── */
            const skewProxy = { skew: 0 };
            const skewSetter = gsap.quickSetter(".skew-on-scroll", "skewY", "deg");
            const skewClamp = gsap.utils.clamp(-2, 2);
            ScrollTrigger.create({
                onUpdate(self) {
                    const v = self.getVelocity();
                    const skew = skewClamp(v / -300);
                    if (Math.abs(skew) > Math.abs(skewProxy.skew)) {
                        skewProxy.skew = skew;
                        gsap.to(skewProxy, {
                            skew: 0, duration: 0.8, ease: "power3.out", overwrite: true,
                            onUpdate: () => skewSetter(skewProxy.skew),
                        });
                    }
                },
            });

            /* ═══════════════════════════════════════════
               HERO — character-level entrance + parallax
               ═══════════════════════════════════════════ */
            const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });

            // Decorative line
            heroTl.from(".hero-line", { scaleX: 0, transformOrigin: "left center", duration: 1.2 });

            // Badge
            heroTl.from(".hero-badge", { y: 30, opacity: 0, duration: 0.8 }, 0.2);

            // Character-by-character reveal for title
            heroTl.from(".hero-char", {
                y: 80,
                rotateX: -90,
                opacity: 0,
                stagger: 0.02,
                duration: 1,
                ease: "back.out(1.7)",
            }, 0.3);

            // Description blur-in
            heroTl.from(".hero-desc", {
                y: 40, opacity: 0, filter: "blur(12px)", duration: 1.2,
            }, 0.9);

            // Buttons stagger
            heroTl.from(".hero-btn", {
                y: 30, opacity: 0, stagger: 0.12, duration: 0.8,
            }, 1.1);

            // Scroll hint
            heroTl.from(".hero-scroll-hint", { opacity: 0, y: 20, duration: 0.8 }, 1.5);

            // Hero illustrations: staggered float-in + subtle scale
            heroTl.from(".hero-img-wrap", { y: 60, opacity: 0, scale: 0.9, stagger: 0.15, duration: 1, ease: "power3.out" }, 0.7);
            // Gentle floating loop (run after entrance)
            gsap.to(".hero-img-float", { y: -14, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.4 } });

            // Hero images scroll parallax (move at different speeds)
            gsap.to(".hero-img-left", { y: -80, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1.2 } });
            gsap.to(".hero-img-right", { y: -50, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1.5 } });

            // Parallax on scroll-out — text fades and rises
            gsap.to(".hero-text-block", {
                y: -200, opacity: 0, scale: 0.9, ease: "none",
                scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
            });
            // Hint fades on scroll
            gsap.to(".hero-scroll-hint", {
                opacity: 0, y: -20,
                scrollTrigger: { trigger: "#hero", start: "5% top", end: "15% top", scrub: true },
            });

            /* ═══════════════════════════════════════════
               CREATIVE STRIP — horizontal drift on scroll
               ═══════════════════════════════════════════ */
            gsap.fromTo(".creative-strip-text", { x: -40 }, { x: 0, ease: "none", scrollTrigger: { trigger: "#creative-strip", start: "top 85%", end: "top 45%", scrub: 1.2 } });
            gsap.fromTo(".creative-strip-img", { x: 40 }, { x: 0, ease: "none", scrollTrigger: { trigger: "#creative-strip", start: "top 85%", end: "top 45%", scrub: 1.2 } });

            /* ═══════════════════════════════════════════
               MARQUEE — single scrolling row (visible), run once
               ═══════════════════════════════════════════ */
            ScrollTrigger.getById("marquee-skew")?.kill();
            gsap.killTweensOf("#marquee-1");
            const mTrack1 = mainRef.current?.querySelector("#marquee-1") as HTMLElement;
            if (mTrack1) {
                const w1 = mTrack1.scrollWidth / 4;
                gsap.to(mTrack1, { x: -w1, ease: "none", repeat: -1, duration: 24 });
            }
            ScrollTrigger.create({
                id: "marquee-skew",
                trigger: "#marquee-section",
                start: "top bottom",
                end: "bottom top",
                onUpdate(self) {
                    const v = self.getVelocity() / 500;
                    gsap.to("#marquee-1", { skewX: gsap.utils.clamp(-5, 5, v), duration: 0.5, overwrite: true });
                },
            });

            /* ═══════════════════════════════════════════
               FEATURES — horizontal pinned gallery with 3D card tilt
               ═══════════════════════════════════════════ */
            mm.add("(min-width: 768px)", () => {
                const hPanel = document.querySelector("#h-scroll-panel") as HTMLElement;
                if (!hPanel) return;
                const totalWidth = hPanel.scrollWidth - window.innerWidth;

                gsap.to(hPanel, {
                    x: -totalWidth, ease: "none",
                    scrollTrigger: {
                        trigger: "#features",
                        start: "top top",
                        end: () => `+=${totalWidth}`,
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                    },
                });

                // 3D tilt: cards rotate as they enter/leave view
                gsap.utils.toArray<HTMLElement>(".feat-card").forEach((card, i) => {
                    gsap.fromTo(card, {
                        rotateY: 15, scale: 0.9, opacity: 0.5,
                    }, {
                        rotateY: 0, scale: 1, opacity: 1,
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: gsap.getById?.("hScroll") || undefined,
                            start: "left 90%", end: "left 50%", scrub: 1,
                        },
                    });
                });
            });

            mm.add("(max-width: 767px)", () => {
                gsap.utils.toArray<HTMLElement>(".feat-card").forEach((card) => {
                    gsap.from(card, {
                        y: 80, opacity: 0, scale: 0.9, rotateX: 8,
                        scrollTrigger: { trigger: card, start: "top 90%", end: "top 60%", scrub: 1 },
                    });
                });
            });

            /* ═══════════════════════════════════════════
               PROCESS — cinematic stagger with draw + morph
               ═══════════════════════════════════════════ */
            // Header slides up with a smooth clip-path wipe
            gsap.fromTo(".process-header", {
                clipPath: "inset(100% 0 0 0)",
                y: 60,
            }, {
                clipPath: "inset(0% 0 0 0)",
                y: 0,
                ease: "power4.out",
                scrollTrigger: { trigger: "#process", start: "top 85%", end: "top 50%", scrub: 1 },
            });

            // Pinned process section — one timeline drives line + cards (no duplicate)
            ScrollTrigger.getById("process-pin")?.kill();
            const processTl = gsap.timeline({
                scrollTrigger: {
                    id: "process-pin",
                    trigger: "#process",
                    start: "top 20%",
                    end: "+=200%",
                    scrub: 1,
                    pin: "#process-pin-wrap",
                    pinSpacing: true,
                    anticipatePin: 1,
                },
            });

            // Timeline line draws once with the same scroll range
            processTl.fromTo(".process-timeline-line", { scaleY: 0 }, { scaleY: 1, ease: "none" }, 0);

            gsap.utils.toArray<HTMLElement>(".step-card").forEach((card, i) => {
                const fromLeft = i % 2 === 0;
                const inner = card.querySelector(".step-card-inner") as HTMLElement;
                const icon = card.querySelector(".step-num-icon") as HTMLElement;

                // Icon pops in with spring
                processTl.fromTo(icon, {
                    scale: 0, rotation: -180, opacity: 0,
                }, {
                    scale: 1, rotation: 0, opacity: 1,
                    ease: "back.out(1.7)", duration: 0.4,
                }, i * 0.6);

                // Card slides in from alternating side with 3D rotation
                processTl.fromTo(card, {
                    x: fromLeft ? -120 : 120,
                    opacity: 0,
                    rotateY: fromLeft ? -15 : 15,
                }, {
                    x: 0, opacity: 1, rotateY: 0,
                    ease: "power3.out", duration: 0.6,
                }, i * 0.6 + 0.1);

                // Inner card gets a subtle scale-up
                if (inner) {
                    processTl.fromTo(inner, { scale: 0.92 }, {
                        scale: 1, ease: "power2.out", duration: 0.4,
                    }, i * 0.6 + 0.2);
                }
            });

            /* ═══════════════════════════════════════════
               STATS — pinned counter with 3D card flip
               ═══════════════════════════════════════════ */
            const statsTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#stats",
                    start: "top top",
                    end: "+=150%",
                    scrub: 1,
                    pin: true,
                },
            });

            statsTl.from(".stats-bg-text", { scale: 0.3, opacity: 0, duration: 1 });

            stats.forEach((stat, i) => {
                const obj = { val: 0 };
                // 3D flip entrance
                statsTl.from(`.stat-card-${i}`, {
                    rotateY: 90, opacity: 0, scale: 0.7, duration: 0.6,
                    ease: "back.out(1.7)",
                }, 0.3 + i * 0.15);
                // Counter
                statsTl.to(obj, {
                    val: stat.value, duration: 1, ease: "power2.out",
                    onUpdate() {
                        const el = document.querySelector(`#sn-${i}`);
                        if (el) el.textContent = Math.floor(obj.val).toLocaleString() + stat.suffix;
                    },
                }, 0.3 + i * 0.15);
            });

            statsTl.to(".stats-bg-text", { scale: 1.5, opacity: 0.01, duration: 0.5 }, ">");

            /* ═══════════════════════════════════════════
               BIG TEXT — text fill on scroll
               ═══════════════════════════════════════════ */
            // Each word has an outline version and a fill version
            // Fill reveals via clip-path as you scroll
            gsap.utils.toArray<HTMLElement>(".bt-fill").forEach((el, i) => {
                gsap.fromTo(el, {
                    clipPath: "inset(0 100% 0 0)",
                }, {
                    clipPath: "inset(0 0% 0 0)",
                    ease: "none",
                    scrollTrigger: {
                        trigger: el.parentElement,
                        start: "top 75%",
                        end: "top 35%",
                        scrub: 1,
                    },
                });
            });

            // Words slide in from alternating sides
            gsap.from(".bt-word-1", {
                x: "-120%",
                scrollTrigger: { trigger: "#big-text", start: "top 85%", end: "top 55%", scrub: 1 },
            });
            gsap.from(".bt-word-2", {
                x: "120%",
                scrollTrigger: { trigger: "#big-text", start: "top 80%", end: "top 50%", scrub: 1 },
            });
            gsap.from(".bt-word-3", {
                y: 150, scale: 0.3, rotateZ: -5,
                scrollTrigger: { trigger: "#big-text", start: "top 75%", end: "top 40%", scrub: 1 },
            });

            /* ═══════════════════════════════════════════
               CTA — circle expand + stagger
               ═══════════════════════════════════════════ */
            gsap.from("#cta-card", {
                scale: 0.1, borderRadius: "50%", opacity: 0,
                scrollTrigger: { trigger: "#cta", start: "top 90%", end: "top 30%", scrub: 1 },
            });
            gsap.from(".cta-inner > *", {
                y: 40, opacity: 0, stagger: 0.1,
                scrollTrigger: { trigger: "#cta", start: "top 40%", end: "top 10%", scrub: 1 },
            });
            gsap.to(".cta-orb", {
                rotation: 200, scale: 1.4, ease: "none",
                scrollTrigger: { trigger: "#cta", start: "top bottom", end: "bottom top", scrub: true },
            });

            /* ═══════════════════════════════════════════
               TESTIMONIALS — 3D fan cascade
               ═══════════════════════════════════════════ */
            gsap.from(".test-header", {
                clipPath: "inset(100% 0 0 0)",
                scrollTrigger: { trigger: "#testimonials", start: "top 80%", end: "top 55%", scrub: 1 },
            });

            gsap.utils.toArray<HTMLElement>(".test-card").forEach((card, i) => {
                gsap.from(card, {
                    x: i === 0 ? -200 : i === 2 ? 200 : 0,
                    y: 80,
                    opacity: 0,
                    scale: 0.8,
                    rotateY: i === 0 ? -25 : i === 2 ? 25 : 0,
                    rotateZ: i === 0 ? -4 : i === 2 ? 4 : 0,
                    scrollTrigger: { trigger: card, start: "top 92%", end: "top 55%", scrub: 1 },
                });
            });

            /* ═══════════════════════════════════════════
               FOOTER — clip-path + stagger
               ═══════════════════════════════════════════ */
            gsap.from(".footer-inner", {
                clipPath: "inset(100% 0 0 0)",
                scrollTrigger: { trigger: "footer", start: "top 95%", end: "top 70%", scrub: 1 },
            });
            gsap.from(".footer-inner > *", {
                y: 50, opacity: 0, stagger: 0.08,
                scrollTrigger: { trigger: "footer", start: "top 85%", end: "top 55%", scrub: 1 },
            });

            setTimeout(() => ScrollTrigger.refresh(), 500);

        }, mainRef);

        return () => {
            ctx.revert();
            mm.revert();
            lenis.destroy();
            window.removeEventListener("mousemove", onMouseMove);
            gsap.ticker.remove(cursorTick);
        };
    }, []);

    /* ═══════════════════════════════════════════════════
       JSX
       ═══════════════════════════════════════════════════ */
    return (
        <div ref={mainRef} className="relative overflow-x-hidden cursor-none md:cursor-none">

            {/* ── Custom Cursor ── */}
            <div ref={cursorRef} className="custom-cursor pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block">
                <div className="w-10 h-10 -ml-5 -mt-5 rounded-full border border-violet-400/50 mix-blend-difference transition-all duration-300" />
            </div>
            <div ref={cursorDotRef} className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block">
                <div className="w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-white mix-blend-difference" />
            </div>

            {/* ── Noise Overlay ── */}
            <div className="noise-overlay pointer-events-none fixed inset-0 z-[99] opacity-[0.025]" />

            {/* ── Scroll Progress ── */}
            <div className="fixed top-0 left-0 right-0 h-[2px] z-[100]">
                <div id="scroll-progress" className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
            </div>

            {/* ── 3D Background — fixed, covers entire viewport ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <HeroScene scrollProgress={scrollProgressRef} />
                {/* Light mode frosted overlay */}
                <div className="absolute inset-0 hero-3d-overlay" />
                </div>

            {/* ════════════════════════════════════════
                HERO
               ════════════════════════════════════════ */}
            <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
                <div className="hero-text-block relative z-10 text-center max-w-4xl mx-auto space-y-8" style={{ perspective: "600px" }}>
                    <div className="hero-line w-16 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full mx-auto" />

                    <span className="hero-badge inline-block px-5 py-2 rounded-full backdrop-blur-sm text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase" style={{ background: "var(--hero-badge-bg)", border: "1px solid var(--hero-badge-border)" }}>
                        ✨ Where Ideas Meet Partners
                    </span>

                    <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.04em] leading-[1] hero-text-adaptive">
                        <span className="block overflow-hidden">
                            {splitChars("Where Ideas", "hero-char")}
                        </span>
                        <span className="block overflow-hidden">
                            {splitChars("Find Their", "hero-char")}
                        </span>
                        <span className="block overflow-hidden text-gradient">
                            {splitChars("Partners.", "hero-char")}
                            </span>
                            </h1>

                    <p className="hero-desc text-base sm:text-lg hero-text-dim max-w-lg leading-relaxed font-medium mx-auto">
                        The ultimate ecosystem where visionary founders and elite builders unite to create world-changing products.
                            </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                            {user ? (
                            <Link href="/ideas" className="hero-btn magnetic group relative px-10 py-4.5 rounded-full font-bold text-sm overflow-hidden pointer-events-auto" style={{ background: "var(--hero-btn-bg)", color: "var(--hero-btn-text)" }}>
                                <span className="relative z-10 flex items-center gap-2">
                                    Explore Hub
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                                </Link>
                            ) : (
                                <>
                                <Link href="/register" className="hero-btn magnetic group relative px-10 py-4.5 rounded-full font-bold text-sm overflow-hidden hover:text-white transition-colors duration-500 pointer-events-auto" style={{ background: "var(--hero-btn-bg)", color: "var(--hero-btn-text)" }}>
                                    <span className="relative z-10 flex items-center gap-2">
                                        Get Started Free
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                                    </Link>
                                <Link href="/ideas" className="hero-btn magnetic px-10 py-4.5 rounded-full border font-bold text-sm hover:border-violet-500/40 transition-all duration-300 backdrop-blur-sm pointer-events-auto" style={{ borderColor: "var(--hero-btn-secondary-border)", color: "var(--hero-btn-secondary-text)" }}>
                                        Browse Ideas
                                    </Link>
                                </>
                            )}
                        </div>

                    {/* Hero character illustrations — idea + thinking */}
                    <div className="hero-visuals flex flex-wrap items-end justify-center gap-8 sm:gap-12 lg:gap-16 mt-10 sm:mt-14 lg:mt-16 max-w-5xl mx-auto">
                        <div className="hero-img-wrap hero-img-left w-[140px] sm:w-[180px] lg:w-[220px] flex-shrink-0">
                            <div className="hero-img-float relative aspect-square rounded-3xl overflow-hidden border-2 border-violet-500/20 bg-white/5 shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
                                <HeroImage src="/images/hero-idea.webp" alt="Lightbulb moment — where ideas spark" className="absolute inset-0 w-full h-full object-contain p-2" />
                            </div>
                            <p className="text-center mt-3 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Idea</p>
                        </div>
                        <div className="hidden sm:flex items-center justify-center flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </div>
                        </div>
                        <div className="hero-img-wrap hero-img-right w-[140px] sm:w-[180px] lg:w-[220px] flex-shrink-0">
                            <div className="hero-img-float relative aspect-square rounded-3xl overflow-hidden border-2 border-indigo-500/20 bg-white/5 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm">
                                <HeroImage src="/images/hero-thinking.webp" alt="Think it through — brainstorm and connect" className="absolute inset-0 w-full h-full object-contain p-2" />
                            </div>
                            <p className="text-center mt-3 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Connect</p>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="hero-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hero-scroll-color z-20">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll to explore</span>
                    <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
                        <div className="w-1 h-2 rounded-full bg-current animate-bounce" />
                    </div>
                </div>
            </section>

            {/* ═══════ Content sections — layered over the 3D background ═══════ */}
            <div className="relative z-10" style={{ background: "var(--bg)" }}>

            {/* ════════════════════════════════════════
                CREATIVE STRIP — idea + visual
               ════════════════════════════════════════ */}
            <section id="creative-strip" className="py-20 sm:py-28 overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <div className="creative-strip-text flex-1 text-center lg:text-left space-y-6 order-2 lg:order-1">
                        <span className="inline-block px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black tracking-[0.3em] text-amber-400 uppercase">Creative Process</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.04em] text-theme-primary leading-[1.1]">
                            Where Ideas<br /><span className="text-gradient">Come to Life.</span>
                        </h2>
                        <p className="text-theme-secondary text-base sm:text-lg max-w-xl mx-auto lg:mx-0">From the first lightbulb moment to building with the right partners — think it through, then connect and ship.</p>
                    </div>
                    <div className="creative-strip-img flex-shrink-0 w-full max-w-sm lg:max-w-md order-1 lg:order-2">
                        <div className="relative aspect-square rounded-[32px] overflow-hidden border-2 border-violet-500/20 bg-white/5 shadow-2xl shadow-violet-500/10">
                            <HeroImage src="/images/hero-thinking.webp" alt="Brainstorm and build" className="absolute inset-0 w-full h-full object-contain p-6" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                MARQUEE DIVIDER
               ════════════════════════════════════════ */}
            <section id="marquee-section" className="py-16 sm:py-24 overflow-hidden select-none">
                <div id="marquee-1" className="flex whitespace-nowrap">
                    {[...marqueeWords, ...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
                        <span key={i} className="text-[8vw] sm:text-[6vw] font-black text-theme-muted uppercase tracking-tighter mx-4 sm:mx-6 shrink-0" style={{ opacity: 0.45 }}>{w}</span>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════
                FEATURES — horizontal scroll gallery
               ════════════════════════════════════════ */}
            <section id="features" className="relative">
                <div id="h-scroll-panel" className="flex items-stretch md:flex-nowrap flex-wrap md:h-screen" style={{ perspective: "1200px" }}>
                    {/* Intro */}
                    <div className="md:w-screen md:shrink-0 w-full md:h-screen flex items-center justify-center px-6 sm:px-12">
                        <div className="max-w-lg space-y-6 text-center md:text-left">
                            <span className="inline-block px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase">Why IdeaConnect</span>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] text-theme-primary leading-[1.05]">
                                Built for<br /><span className="text-gradient">Builders.</span>
                            </h2>
                            <p className="text-theme-secondary text-base sm:text-lg leading-relaxed">Four pillars that make IdeaConnect the #1 platform for turning ideas into products.</p>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <span className="text-theme-muted text-sm font-bold">Scroll</span>
                                <div className="w-12 h-[2px] bg-gradient-to-r from-violet-500 to-transparent" />
                            </div>
                        </div>
                    </div>

                    {features.map((f, i) => (
                        <div key={i} className="feat-card md:w-[60vw] lg:w-[50vw] md:shrink-0 w-full md:h-screen flex items-center px-6 sm:px-12 py-12 md:py-0" style={{ transformStyle: "preserve-3d" }}>
                            <div className="feat-card-inner w-full max-w-xl">
                                <div className="glass-card rounded-[32px] p-8 sm:p-12 space-y-6 group magnetic skew-on-scroll">
                                    <div className="flex items-start justify-between">
                                        <span className="text-6xl sm:text-7xl font-black text-theme-muted opacity-10 leading-none">{f.num}</span>
                                        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all duration-300">
                                            {featureIcons[i]}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-theme-primary group-hover:text-gradient transition-all duration-300">{f.title}</h3>
                                    <p className="text-theme-secondary text-base sm:text-lg leading-relaxed">{f.desc}</p>
                                    <div className="w-full h-px bg-gradient-to-r from-violet-500/30 via-indigo-500/30 to-transparent" />
                                    <div className="flex items-center gap-2 text-violet-400 text-sm font-bold">
                                        Learn more
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════
                PROCESS — timeline with alternating cards
               ════════════════════════════════════════ */}
            <section id="process" className="relative" style={{ perspective: "1200px" }}>
                <div id="process-pin-wrap" className="px-4 sm:px-6 py-24 sm:py-40 max-w-6xl mx-auto w-full">
                    <div className="process-header text-center mb-16 sm:mb-24 space-y-4">
                        <span className="inline-block px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase">The Process</span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] text-theme-primary leading-[1.05]">
                            From Zero to <span className="text-gradient">Launch.</span>
                        </h2>
                    </div>

                    <div id="process-cards" className="relative" style={{ transformStyle: "preserve-3d" }}>
                        {/* Vertical timeline line (left on mobile, center on desktop) */}
                        <div className="absolute left-[26px] sm:left-[34px] md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-[1px] z-0">
                            <div className="process-timeline-line w-full h-full bg-gradient-to-b from-violet-500 via-indigo-500 to-cyan-500 origin-top rounded-full" />
                        </div>

                        <div className="space-y-12 sm:space-y-16">
                            {steps.map((step, i) => {
                                const isEven = i % 2 === 0;
                                return (
                                    <div key={i} className="step-card relative pl-16 sm:pl-20 md:pl-0 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-0 items-start" style={{ transformStyle: "preserve-3d" }}>
                                        {/* Left side (card for even, empty for odd) */}
                                        {isEven ? (
                                            <div className="hidden md:block md:pr-10">
                                                <div className="step-card-inner rounded-[24px] p-8 sm:p-10 group magnetic relative overflow-hidden text-right backdrop-blur-xl"
                                                    style={{ background: "var(--surface)", border: "1px solid var(--border-color)" }}>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="flex flex-col gap-4 items-end relative z-10">
                                                        <span className="text-6xl font-black text-theme-muted opacity-[0.06]">{step.num}</span>
                                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-theme-primary group-hover:text-gradient transition-all duration-300">{step.title}</h3>
                                                        <p className="text-theme-secondary text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg">{step.desc}</p>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-700" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hidden md:block" />
                                        )}

                                        {/* Center timeline node */}
                                        <div className="step-num-icon absolute left-2 sm:left-4 md:relative md:left-auto z-10 flex items-start justify-center pt-2">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--bg)] flex items-center justify-center ring-4 ring-[var(--bg)]">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                                    <span className="text-xs sm:text-sm font-black text-white">{step.num}</span>
                                                </div>
                                            </div>
                           </div>
                           
                                        {/* Right side (card for odd, empty for even) */}
                                        {!isEven ? (
                                            <div className="hidden md:block md:pl-10">
                                                <div className="step-card-inner rounded-[24px] p-8 sm:p-10 group magnetic relative overflow-hidden backdrop-blur-xl"
                                                    style={{ background: "var(--surface)", border: "1px solid var(--border-color)" }}>
                                                    <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="flex flex-col gap-4 items-start relative z-10">
                                                        <span className="text-6xl font-black text-theme-muted opacity-[0.06]">{step.num}</span>
                                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-theme-primary group-hover:text-gradient transition-all duration-300">{step.title}</h3>
                                                        <p className="text-theme-secondary text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg">{step.desc}</p>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hidden md:block" />
                                        )}

                                        {/* Mobile card (visible only on mobile) */}
                                        <div className="md:hidden col-span-full">
                                            <div className="step-card-inner rounded-[24px] p-6 sm:p-8 group magnetic relative overflow-hidden backdrop-blur-xl"
                                                style={{ background: "var(--surface)", border: "1px solid var(--border-color)" }}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="flex flex-col gap-3 relative z-10">
                                                    <span className="text-4xl font-black text-theme-muted opacity-[0.08]">{step.num}</span>
                                                    <h3 className="text-xl sm:text-2xl font-black text-theme-primary group-hover:text-gradient transition-all duration-300">{step.title}</h3>
                                                    <p className="text-theme-secondary text-sm sm:text-base leading-relaxed">{step.desc}</p>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                                            </div>
                                        </div>
                           </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                STATS — pinned counter
               ════════════════════════════════════════ */}
            <section id="stats" className="relative overflow-hidden">
                <div className="h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative">
                    <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
                        <span className="stats-bg-text text-[25vw] sm:text-[18vw] font-black text-theme-muted opacity-[0.03] uppercase tracking-widest select-none">IMPACT</span>
                    </div>
                    <div className="text-center mb-16 relative z-10">
                        <span className="inline-block px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase mb-4">Our Numbers</span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] text-theme-primary">Real <span className="text-gradient">Impact.</span></h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 max-w-5xl w-full relative z-10" style={{ perspective: "800px" }}>
                        {stats.map((s, i) => (
                            <div key={i} className={`stat-card-${i} text-center group`} style={{ transformStyle: "preserve-3d" }}>
                                <div className="glass-card rounded-[24px] p-6 sm:p-8 mb-3 group-hover:border-violet-500/30 transition-all duration-500">
                                    <div id={`sn-${i}`} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-theme-primary tabular-nums leading-none">
                                        0{s.suffix}
                                    </div>
                                </div>
                                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-theme-muted">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                BIG TEXT — text fill on scroll
               ════════════════════════════════════════ */}
            <section id="big-text" className="py-20 sm:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center space-y-2 sm:space-y-4">
                    {[
                        { text: "Connect.", cls: "bt-word-1" },
                        { text: "Collaborate.", cls: "bt-word-2" },
                        { text: "Create.", cls: "bt-word-3" },
                    ].map((item, i) => (
                        <div key={i} className={`${item.cls} overflow-hidden relative`}>
                            {/* Outline version */}
                            <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.05em] leading-none text-stroke-thick select-none">
                                {item.text}
                            </span>
                            {/* Filled version — clip-path reveals on scroll */}
                            <span className="bt-fill absolute inset-0 block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.05em] leading-none text-gradient" style={{ clipPath: "inset(0 100% 0 0)" }}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════
                CTA
               ════════════════════════════════════════ */}
            <section id="cta" className="px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto w-full">
                <div id="cta-card" className="relative overflow-hidden p-10 sm:p-14 lg:p-24"
                    style={{ background: "linear-gradient(135deg, #6d28d9, #4338ca, #0891b2)", borderRadius: "48px" }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="cta-orb absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[100px]" />
                        <div className="cta-orb absolute bottom-[-30%] left-[-20%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px]" />
                    </div>
                    <div className="cta-inner relative z-10 text-center space-y-8 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] leading-[1.1]">
                            Ready to Build Something<br /><span className="text-white/60">Extraordinary?</span>
                        </h2>
                        <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">Join thousands of innovators turning ideas into reality.</p>
                        <div className="flex flex-wrap justify-center gap-4 pt-2">
                            <Link href={user ? "/ideas" : "/register"} className="magnetic group relative px-10 sm:px-14 py-4.5 rounded-full bg-white text-gray-900 font-bold text-sm overflow-hidden hover:text-white transition-colors duration-500">
                                <span className="relative z-10">{user ? "Explore Ideas" : "Start Free Today"}</span>
                                <span className="absolute inset-0 bg-gray-900 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                            </Link>
                            <Link href="/ideas" className="magnetic px-10 sm:px-14 py-4.5 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-all duration-300">
                                Browse Marketplace
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                TESTIMONIALS
               ════════════════════════════════════════ */}
            <section id="testimonials" className="px-4 sm:px-6 py-24 sm:py-32 max-w-7xl mx-auto w-full">
                <div className="test-header text-center mb-16 space-y-4">
                    <span className="inline-block px-5 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-[10px] font-black tracking-[0.3em] text-pink-400 uppercase">Testimonials</span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] text-theme-primary leading-[1.05]">
                        Loved by <span className="text-gradient">Founders.</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="test-card skew-on-scroll" style={{ transformStyle: "preserve-3d" }}>
                            <div className="glass-card p-8 sm:p-10 rounded-[28px] space-y-6 group magnetic h-full">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, j) => (
                                        <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-theme-secondary text-sm sm:text-base leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/20">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-theme-primary">{t.name}</p>
                                        <p className="text-[10px] text-theme-muted font-bold uppercase tracking-[0.15em]">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════
                FOOTER
               ════════════════════════════════════════ */}
            <footer className="px-4 sm:px-6 py-20 sm:py-24 max-w-7xl mx-auto w-full">
                <div className="footer-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
                        <div className="space-y-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <span className="text-lg font-black text-theme-primary tracking-[-0.02em]">IdeaConnect</span>
                            </div>
                            <p className="text-sm text-theme-secondary leading-relaxed">The platform where ideas meet execution. Built for founders, by founders.</p>
                        </div>
                        {[
                            { title: "Product", links: ["Marketplace", "Network", "Showcase", "Pricing"] },
                            { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
                            { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
                        ].map((col, i) => (
                            <div key={i} className="space-y-4">
                                <h4 className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">{col.title}</h4>
                                <ul className="space-y-2.5">
                                    {col.links.map((lnk) => (
                                        <li key={lnk}><a href="#" className="text-sm text-theme-secondary hover:text-theme-primary transition-colors font-medium">{lnk}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[var(--border-color)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-theme-muted font-medium tracking-wider">© 2026 IdeaConnect. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            {/* Twitter / X */}
                            <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--input-bg)] text-theme-muted hover:text-theme-primary transition-all" aria-label="Twitter">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            {/* GitHub */}
                            <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--input-bg)] text-theme-muted hover:text-theme-primary transition-all" aria-label="GitHub">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                            {/* Discord */}
                            <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--input-bg)] text-theme-muted hover:text-theme-primary transition-all" aria-label="Discord">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            </div>{/* End content sections wrapper */}
        </div>
    );
}
