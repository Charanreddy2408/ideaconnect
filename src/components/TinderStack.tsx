"use client";

import type { ReactElement } from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import gsap from "gsap";

/* ── category accent colours ── */
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

const catIcon: Record<string, ReactElement> = {
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

interface TinderStackProps {
    ideas: Idea[];
}

/* ═══════════════════════════════════════════════════════
   TINDER STACK — full-screen stacked card swipe
   ═══════════════════════════════════════════════════════ */
export default function TinderStack({ ideas }: TinderStackProps) {
    const { user } = useAuth();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const deltaX = useRef(0);
    const animLock = useRef(false);

    const [current, setCurrent] = useState(0);
    const [gone, setGone] = useState<Set<number>>(new Set());

    const VISIBLE = 3;
    const THRESHOLD = 80;

    /* reset on new data */
    useEffect(() => {
        setCurrent(0);
        setGone(new Set());
        cardRefs.current = [];
    }, [ideas]);

    /* ── DRAG HANDLERS ── */
    const onStart = useCallback((e: React.TouchEvent | React.MouseEvent, idx: number) => {
        if (animLock.current || idx !== current) return;
        dragging.current = true;
        const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
        const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
        startX.current = cx;
        startY.current = cy;
        deltaX.current = 0;
    }, [current]);

    const onMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (!dragging.current) return;
        const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
        const dx = cx - startX.current;
        deltaX.current = dx;

        const card = cardRefs.current[current];
        if (!card) return;

        const rot = (dx / window.innerWidth) * 20;
        gsap.set(card, { x: dx, rotation: rot });

        // Scale next card up proportionally
        const progress = Math.min(Math.abs(dx) / THRESHOLD, 1);
        const next = cardRefs.current[current + 1];
        if (next) {
            gsap.set(next, {
                scale: 0.94 + progress * 0.06,
                y: 10 - progress * 10,
            });
        }
    }, [current]);

    const onEnd = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;

        const dx = deltaX.current;
        const card = cardRefs.current[current];
        if (!card) return;

        if (Math.abs(dx) > THRESHOLD) {
            /* ── fly away ── */
            animLock.current = true;
            const dir = dx > 0 ? 1 : -1;

            gsap.to(card, {
                x: dir * (window.innerWidth + 200),
                rotation: dir * 25,
                opacity: 0,
                duration: 0.45,
                ease: "power3.in",
                onComplete: () => {
                    setGone(prev => new Set(prev).add(current));
                    setCurrent(prev => prev + 1);
                    animLock.current = false;
                },
            });

            const next = cardRefs.current[current + 1];
            if (next) {
                gsap.to(next, { scale: 1, y: 0, duration: 0.35, ease: "power2.out" });
            }
        } else {
            /* ── snap back ── */
            gsap.to(card, {
                x: 0,
                rotation: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)",
            });
            const next = cardRefs.current[current + 1];
            if (next) {
                gsap.to(next, { scale: 0.94, y: 10, duration: 0.35, ease: "power2.out" });
            }
        }
    }, [current]);

    /* ── BUTTON SWIPE ── */
    const swipe = useCallback((dir: "left" | "right") => {
        if (animLock.current || current >= ideas.length) return;
        animLock.current = true;
        const card = cardRefs.current[current];
        if (!card) { animLock.current = false; return; }

        const d = dir === "right" ? 1 : -1;
        gsap.to(card, {
            x: d * (window.innerWidth + 200),
            rotation: d * 25,
            opacity: 0,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                setGone(prev => new Set(prev).add(current));
                setCurrent(prev => prev + 1);
                animLock.current = false;
            },
        });
        const next = cardRefs.current[current + 1];
        if (next) {
            gsap.to(next, { scale: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.05 });
        }
    }, [current, ideas.length]);

    /* ── UNDO ── */
    const undo = useCallback(() => {
        if (animLock.current || current <= 0) return;
        animLock.current = true;
        const prev = current - 1;
        const card = cardRefs.current[prev];
        if (!card) { animLock.current = false; return; }

        setGone(p => { const s = new Set(p); s.delete(prev); return s; });
        setCurrent(prev);

        gsap.fromTo(card,
            { x: -window.innerWidth, rotation: -25, opacity: 0 },
            { x: 0, rotation: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", onComplete: () => { animLock.current = false; } }
        );
    }, [current]);

    /* ── message founder ── */
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

    const allDone = current >= ideas.length;

    return (
        <div className="flex flex-col items-center w-full gap-5 pb-4">
            {/* ═══ CARD STACK AREA ═══ */}
            <div
                ref={containerRef}
                className="relative w-full max-w-[380px] mx-auto select-none touch-pan-y"
                style={{ height: "min(70vh, 520px)" }}
                onMouseMove={onMove}
                onMouseUp={onEnd}
                onMouseLeave={onEnd}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
            >
                {allDone ? (
                    /* ── empty ── */
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-[28px] border-2 border-dashed border-[var(--border-color)] bg-[var(--card-bg)]">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        </div>
                        <h3 className="text-lg font-black text-theme-primary">You&apos;ve seen them all!</h3>
                        <p className="text-xs text-theme-secondary mt-1">Check back later for fresh ideas.</p>
                        {gone.size > 0 && (
                            <button onClick={() => { setGone(new Set()); setCurrent(0); }} className="mt-4 px-5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold">
                                Start Over
                            </button>
                        )}
                    </div>
                ) : (
                    /* ── Stacked cards ── */
                    ideas.map((idea, i) => {
                        if (gone.has(i) || i < current || i > current + VISIBLE - 1) return null;

                        const offset = i - current;
                        const isTop = offset === 0;
                        const accent = catAccent[idea.category] || catAccent.Tech;
                        const icon = catIcon[idea.category] || null;

                        return (
                            <div
                                key={idea._id}
                                ref={el => { cardRefs.current[i] = el; }}
                                className="absolute inset-0 will-change-transform"
                                style={{
                                    zIndex: ideas.length - i,
                                    transform: `scale(${1 - offset * 0.03}) translateY(${offset * 10}px)`,
                                    opacity: 1,
                                    cursor: isTop ? "grab" : "default",
                                    pointerEvents: isTop ? "auto" : "none",
                                    transformOrigin: "center bottom",
                                }}
                                onMouseDown={e => onStart(e, i)}
                                onTouchStart={e => onStart(e, i)}
                            >
                                {/* Card Body */}
                                <div className="w-full h-full rounded-[28px] flex flex-col overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xl relative"
                                    style={{
                                        boxShadow: isTop
                                            ? "0 20px 60px -12px rgba(0,0,0,0.3), 0 8px 20px -8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)"
                                            : "0 10px 30px -8px rgba(0,0,0,0.15)",
                                    }}
                                >
                                    {/* Top gradient accent */}
                                    <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 flex-shrink-0" />

                                    {/* ── Content ── */}
                                    <div className="flex-1 flex flex-col p-5 sm:p-6 overflow-hidden">
                                        {/* Row: category + trust */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.18em] ${accent}`}>
                                                {icon}
                                                {idea.category}
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)]">
                                                <div className={`w-2 h-2 rounded-full ${idea.validationScore >= 70 ? 'bg-emerald-400' : idea.validationScore >= 40 ? 'bg-yellow-400' : 'bg-orange-400'}`} />
                                                <span className="text-[11px] font-black text-theme-primary">{idea.validationScore}%</span>
                                            </div>
                                        </div>

                                        {/* ═══ VOTE SCORE — prominent on mobile too ═══ */}
                                        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                                            <div className="flex items-center gap-1">
                                                <svg className={`w-5 h-5 ${idea.voteScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 24 24">
                                                    {idea.voteScore >= 0
                                                        ? <path d="M12 4L4 12H9V20H15V12H20L12 4Z" />
                                                        : <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />
                                                    }
                                                </svg>
                                                <span className={`text-xl font-black tabular-nums ${idea.voteScore > 0 ? 'text-emerald-400' : idea.voteScore < 0 ? 'text-red-400' : 'text-theme-muted'}`}>
                                                    {idea.voteScore > 0 ? '+' : ''}{idea.voteScore}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-bold text-theme-muted uppercase tracking-[0.15em]">votes</span>
                                            <div className="ml-auto flex items-center gap-1.5 text-theme-muted">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                                <span className="text-xs font-bold">{idea.commentCount || 0}</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight leading-tight mb-3 line-clamp-2">
                                            {idea.title}
                                        </h2>

                                        {/* Summary */}
                                        <p className="text-theme-secondary text-sm leading-relaxed line-clamp-3 mb-auto">
                                            {idea.summary}
                                        </p>

                                        {/* Founder */}
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-violet-500/20 flex-shrink-0">
                                                {idea.userId.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[8px] font-bold text-theme-muted uppercase tracking-[0.15em] block">Founded by</span>
                                                <span className="text-sm font-bold text-theme-primary truncate block">{idea.userId.name}</span>
                                            </div>
                                            {user && user.id !== idea.userId._id && (
                                                <button onClick={e => handleMsg(idea.userId._id, e)} className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom action bar */}
                                    <div className="border-t border-[var(--border-color)] px-5 py-3 flex items-center justify-between flex-shrink-0">
                                        <VoteButtons ideaId={idea._id} initialScore={idea.voteScore} initialStatus={idea.userVote ?? null} layout="horizontal" compact />
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/ideas/${idea._id}#comments`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[var(--input-bg)] text-theme-muted text-xs font-bold">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                                {idea.commentCount || 0}
                                            </Link>
                                            <Link href={`/ideas/${idea._id}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold">
                                                View
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Progress */}
            {!allDone && (
                <div className="flex items-center gap-2.5 w-full max-w-[280px] mx-auto">
                    <div className="flex-1 h-[3px] rounded-full bg-[var(--border-color)] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-400" style={{ width: `${((current + 1) / ideas.length) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-theme-muted tabular-nums">{current + 1} / {ideas.length}</span>
                </div>
            )}
        </div>
    );
}
