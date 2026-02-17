"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const catAccent: Record<string, string> = {
    Tech: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Social: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    Fintech: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Health: "text-red-400 bg-red-500/10 border-red-500/20",
    Education: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    AI: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    Web3: "text-violet-400 bg-indigo-500/10 border-indigo-500/20",
    SaaS: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

const catIcon: Record<string, JSX.Element> = {
    Tech: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Social: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Fintech: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Health: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Education: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    AI: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Web3: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    SaaS: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
};

interface Idea {
    _id: string;
    title: string;
    summary: string;
    category: string;
    voteScore: number;
    validationScore: number;
    commentCount: number;
    userVote?: number | null;
    userId: { _id: string; name: string };
}

interface DesktopCardStackProps {
    ideas: Idea[];
}

const CARD_WIDTH = 460;
const CARD_HEIGHT = 520;
const STACK_OFFSET = 48; // ~10% of card width – each card peeks out horizontally (right side)
const STACK_DEPTH = 4;   // how many cards visible in stack
const OFFSCREEN_X = 600;

export default function DesktopCardStack({ ideas }: DesktopCardStackProps) {
    const { user } = useAuth();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const stackSectionRef = useRef<HTMLDivElement>(null);
    const stackWrapperRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const animating = useRef(false);

    const [current, setCurrent] = useState(0);
    const [hoveredTop, setHoveredTop] = useState(false);

    const go = useCallback((dir: "prev" | "next") => {
        if (animating.current || ideas.length === 0) return;
        const next = dir === "next" ? Math.min(current + 1, ideas.length - 1) : Math.max(current - 1, 0);
        if (next === current) return;

        animating.current = true;
        setHoveredTop(false);

        const elCurrent = cardRefs.current[current];
        const elNext = cardRefs.current[next];

        if (dir === "next" && elCurrent && elNext) {
            gsap.to(elCurrent, {
                x: -OFFSCREEN_X,
                opacity: 0,
                duration: 0.45,
                ease: "power3.in",
            });
            gsap.fromTo(
                elNext,
                { x: STACK_OFFSET },
                {
                    x: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    onComplete: () => {
                        setCurrent(next);
                        animating.current = false;
                    },
                }
            );
        } else if (dir === "prev" && elCurrent && elNext) {
            gsap.to(elCurrent, {
                x: STACK_OFFSET,
                duration: 0.45,
                ease: "power3.in",
            });
            gsap.fromTo(
                elNext,
                { x: -OFFSCREEN_X, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power3.out",
                    onComplete: () => {
                        setCurrent(next);
                        animating.current = false;
                    },
                }
            );
        } else if (dir === "prev") {
            setCurrent(next);
            animating.current = false;
        } else {
            setCurrent(next);
            animating.current = false;
        }
    }, [current, ideas.length]);

    useEffect(() => {
        cardRefs.current = [];
    }, [ideas]);

    /* GSAP ScrollTrigger: scroll-in reveal + parallax on stack section */
    useEffect(() => {
        const section = stackSectionRef.current;
        const wrapper = stackWrapperRef.current;
        if (!section || !wrapper || ideas.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                wrapper,
                {
                    rotationX: 12,
                    y: 80,
                    opacity: 0.6,
                    scale: 0.96,
                },
                {
                    rotationX: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 88%",
                        end: "top 40%",
                        scrub: 1.2,
                    },
                }
            );
            /* Parallax: subtle rotationY while scrolling through section */
            gsap.to(wrapper, {
                rotationY: 4,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top 70%",
                    end: "bottom 20%",
                    scrub: 2,
                },
            });
        }, stackSectionRef);

        return () => ctx.revert();
    }, [ideas.length]);

    const handleMsg = async (uid: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { router.push("/login"); return; }
        try {
            const res = await fetch("/api/messages/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: uid }),
            });
            if (res.ok) router.push("/messages");
        } catch (err) { console.error(err); }
    };

    if (ideas.length === 0) {
        return (
            <div className="py-16 text-center text-theme-secondary text-sm">
                No ideas to display
            </div>
        );
    }

    const start = Math.max(0, current - 1);
    const end = Math.min(ideas.length, current + STACK_DEPTH);
    const visibleIndices = Array.from({ length: end - start }, (_, i) => start + i);

    const stackWidth = CARD_WIDTH + (STACK_DEPTH - 1) * STACK_OFFSET;

    return (
        <section
            ref={stackSectionRef}
            className="card-stack-section relative w-full flex flex-col items-center px-4 py-8"
            style={{ minHeight: CARD_HEIGHT + 140, perspective: "1400px", perspectiveOrigin: "50% 50%" }}
        >
            <div ref={containerRef} className="relative w-full flex flex-col items-center">
            {/* Left arrow – fixed to the left of the stack, always visible and on top */}
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); go("prev"); }}
                disabled={current <= 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-[200] w-14 h-14 rounded-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] shadow-2xl flex items-center justify-center text-theme-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-violet-500/15 hover:border-violet-500/40 hover:text-violet-400 transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Previous card"
            >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Right arrow – fixed to the right of the stack, always visible */}
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); go("next"); }}
                disabled={current >= ideas.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-[200] w-14 h-14 rounded-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] shadow-2xl flex items-center justify-center text-theme-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-violet-500/15 hover:border-violet-500/40 hover:text-violet-400 transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Next card"
            >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <div
                ref={stackWrapperRef}
                className="relative overflow-visible mx-16"
                style={{
                    width: stackWidth,
                    height: CARD_HEIGHT,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                }}
            >
                {visibleIndices.map((i) => {
                    const idea = ideas[i];
                    const rel = i - current;
                    const isTop = rel === 0;
                    const accent = catAccent[idea.category] || catAccent.Tech;
                    const icon = catIcon[idea.category] || null;
                    const showDescription = isTop && hoveredTop;

                    const xOffset = rel * STACK_OFFSET;
                    const zIndex = 100 - rel;
                    const isPrevCard = rel === -1;
                    const initialX = isPrevCard ? -OFFSCREEN_X : xOffset;
                    const initialOpacity = isPrevCard ? 0 : 1;
                    const rotateY = rel * -6;
                    const translateZ = rel * -18;

                    return (
                        <div
                            key={idea._id}
                            ref={el => { cardRefs.current[i] = el; }}
                            className="absolute left-0 top-0 w-full will-change-transform"
                            style={{
                                width: CARD_WIDTH,
                                height: CARD_HEIGHT,
                                zIndex,
                                transform: `translateX(${initialX}px)`,
                                opacity: initialOpacity,
                                pointerEvents: isPrevCard ? "none" : "auto",
                                transformStyle: "preserve-3d",
                            }}
                            onMouseEnter={() => isTop && setHoveredTop(true)}
                            onMouseLeave={() => setHoveredTop(false)}
                        >
                            <div
                                className="card-3d-inner w-full h-full"
                                style={{
                                    transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                                    transformStyle: "preserve-3d",
                                }}
                            >
                            <div
                                className={`rounded-[28px] flex flex-col overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xl relative transition-all duration-300 ease-out cursor-pointer ${
                                    showDescription ? "shadow-2xl shadow-violet-500/10 ring-2 ring-violet-500/30" : ""
                                }`}
                                style={{
                                    height: CARD_HEIGHT,
                                    boxShadow: isTop
                                        ? "0 20px 60px -12px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                                        : "0 10px 30px -8px rgba(0,0,0,0.15)",
                                }}
                            >
                                <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 shrink-0" />

                                <div className="flex-1 flex flex-col p-5 overflow-hidden min-h-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.18em] ${accent}`}>
                                            {icon}
                                            {idea.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)]">
                                            <div className={`w-2 h-2 rounded-full ${idea.validationScore >= 70 ? "bg-emerald-400" : idea.validationScore >= 40 ? "bg-yellow-400" : "bg-orange-400"}`} />
                                            <span className="text-[11px] font-black text-theme-primary">{idea.validationScore}%</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                                        <div className="flex items-center gap-1">
                                            <svg className={`w-5 h-5 ${idea.voteScore >= 0 ? "text-emerald-400" : "text-red-400"}`} fill="currentColor" viewBox="0 0 24 24">
                                                {idea.voteScore >= 0 ? <path d="M12 4L4 12H9V20H15V12H20L12 4Z" /> : <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />}
                                            </svg>
                                            <span className={`text-xl font-black tabular-nums ${idea.voteScore > 0 ? "text-emerald-400" : idea.voteScore < 0 ? "text-red-400" : "text-theme-muted"}`}>
                                                {idea.voteScore > 0 ? "+" : ""}{idea.voteScore}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-bold text-theme-muted uppercase tracking-[0.15em]">votes</span>
                                        <div className="ml-auto flex items-center gap-1.5 text-theme-muted">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                            <span className="text-xs font-bold">{idea.commentCount || 0}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-black text-theme-primary tracking-tight leading-tight mb-3 line-clamp-2">
                                        {idea.title}
                                    </h2>

                                    {/* Description + all metrics: only visible on hover (top card) */}
                                    {showDescription ? (
                                        <>
                                            {/* All metrics on hover */}
                                            <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">Validation</span>
                                                    <span className={`text-sm font-black tabular-nums ${idea.validationScore >= 70 ? "text-emerald-400" : idea.validationScore >= 40 ? "text-yellow-400" : "text-orange-400"}`}>
                                                        {idea.validationScore}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">Votes</span>
                                                    <span className={`text-sm font-black tabular-nums ${idea.voteScore > 0 ? "text-emerald-400" : idea.voteScore < 0 ? "text-red-400" : "text-theme-muted"}`}>
                                                        {idea.voteScore > 0 ? "+" : ""}{idea.voteScore}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">Comments</span>
                                                    <span className="text-sm font-black tabular-nums text-theme-primary">{idea.commentCount ?? 0}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">Category</span>
                                                    <span className={`text-sm font-bold ${accent}`}>{idea.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto min-h-0 mb-3">
                                                <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1">Description</p>
                                                <p className="text-theme-secondary text-sm leading-relaxed pr-1">
                                                    {idea.summary}
                                                </p>
                                            </div>
                                            <div className="mt-auto pt-3 border-t border-[var(--border-color)] flex items-center gap-3 shrink-0">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-violet-500/20 shrink-0">
                                                    {idea.userId.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[8px] font-bold text-theme-muted uppercase tracking-[0.15em] block">Founded by</span>
                                                    <span className="text-sm font-bold text-theme-primary truncate block">{idea.userId.name}</span>
                                                </div>
                                                {user && user.id !== idea.userId._id && (
                                                    <button onClick={e => handleMsg(idea.userId._id, e)} className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 hover:bg-violet-500/20 transition-colors">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border-color)]">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                                                {idea.userId.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-theme-primary truncate">{idea.userId.name}</span>
                                            {isTop && (
                                                <span className="text-[9px] text-theme-muted font-bold ml-auto">Hover for description</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-[var(--border-color)] px-5 py-3 flex items-center justify-between shrink-0">
                                    <VoteButtons ideaId={idea._id} initialScore={idea.voteScore} initialStatus={idea.userVote ?? null} layout="horizontal" compact />
                                    <div className="flex items-center gap-1.5">
                                        <Link href={`/ideas/${idea._id}#comments`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[var(--input-bg)] text-theme-muted text-xs font-bold">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                            {idea.commentCount || 0}
                                        </Link>
                                        <Link href={`/ideas/${idea._id}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition-colors">
                                            View
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Counter + Dots */}
            <div className="flex flex-col items-center gap-3 mt-6">
                <span className="text-sm font-bold text-theme-muted tabular-nums">
                    {current + 1} / {ideas.length}
                </span>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
                {ideas.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => {
                            if (animating.current || i === current) return;
                            if (i > current) go("next");
                            else go("prev");
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-violet-500 w-6" : "bg-[var(--border-color)] hover:bg-violet-500/50"}`}
                        aria-label={`Go to card ${i + 1}`}
                    />
                ))}
            </div>
            </div>
        </section>
    );
}
