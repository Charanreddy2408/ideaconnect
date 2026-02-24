"use client";

import type { ReactElement } from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import IdeaCardAiMetrics from "@/components/IdeaCardAiMetrics";
import gsap from "gsap";

const catMeta: Record<string, { color: string; bg: string; border: string; glow: string }> = {
    Tech: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", glow: "shadow-blue-500/20" },
    Social: { color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/25", glow: "shadow-pink-500/20" },
    Fintech: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", glow: "shadow-emerald-500/20" },
    Health: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", glow: "shadow-red-500/20" },
    Education: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", glow: "shadow-amber-500/20" },
    AI: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25", glow: "shadow-violet-500/20" },
    Web3: { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", glow: "shadow-indigo-500/20" },
    SaaS: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", glow: "shadow-sky-500/20" },
};

const catIcon: Record<string, ReactElement> = {
    Tech: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Social: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Fintech: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Health: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Education: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    AI: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Web3: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    SaaS: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
};

interface Idea {
    _id: string;
    title: string;
    summary: string;
    category: string;
    voteScore: number;
    commentCount: number;
    userVote?: number | null;
    userId: { _id: string; name: string };
    aiReport?: import("./IdeaCardAiMetrics").AiReportForCard | null;
}

interface TinderStackProps {
    ideas: Idea[];
}

const SWIPE_THRESHOLD = 40;
const DURATION = 0.25;

/** Mobile Tinder-style carousel: swipe right = next, swipe left = previous. Same card content with View more. */
export default function TinderStack({ ideas }: TinderStackProps) {
    const { user } = useAuth();
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const startX = useRef(0);
    const deltaX = useRef(0);
    const animating = useRef(false);
    const justNavigated = useRef(false);
    const isFirstMount = useRef(true);
    const swipeDirectionRef = useRef<1 | -1>(1);

    const [current, setCurrent] = useState(0);
    const [expanded, setExpanded] = useState(false);

    const n = ideas.length;
    const idea = n > 0 ? ideas[current] : null;

    useEffect(() => {
        setCurrent(0);
        setExpanded(false);
        isFirstMount.current = true;
    }, [ideas]);

    useEffect(() => {
        if (n === 0 || !wrapperRef.current || !containerRef.current) return;
        const w = containerRef.current.offsetWidth;
        if (isFirstMount.current) {
            isFirstMount.current = false;
            gsap.set(wrapperRef.current, { x: 0 });
            return;
        }
        if (!justNavigated.current) return;
        justNavigated.current = false;
        const dir = swipeDirectionRef.current;
        gsap.fromTo(
            wrapperRef.current,
            { x: -dir * w },
            { x: 0, duration: DURATION, ease: "power2.out", overwrite: true, onComplete: () => { animating.current = false; } }
        );
    }, [current, n]);

    const go = useCallback((dir: 1 | -1) => {
        if (animating.current || n === 0) return;
        const next = current + dir;
        if (next < 0 || next >= n) return;
        animating.current = true;
        swipeDirectionRef.current = dir;
        const el = wrapperRef.current;
        const container = containerRef.current;
        const w = container?.offsetWidth ?? 320;
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.set(el, { x: 0 });
        gsap.to(el, {
            x: dir * w,
            duration: DURATION,
            ease: "power2.in",
            overwrite: true,
            onComplete: () => {
                setCurrent(next);
                setExpanded(false);
                gsap.set(el, { x: -dir * w });
                justNavigated.current = true;
            },
        });
    }, [current, n]);

    const onStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (animating.current) return;
        dragging.current = true;
        startX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
        deltaX.current = 0;
        gsap.killTweensOf(wrapperRef.current);
    }, []);

    const onMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (!dragging.current || !wrapperRef.current) return;
        const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
        const dx = cx - startX.current;
        deltaX.current = dx;
        gsap.set(wrapperRef.current, { x: dx });
    }, []);

    const onEnd = useCallback(() => {
        if (!dragging.current) return;
        dragging.current = false;
        const dx = deltaX.current;
        const el = wrapperRef.current;
        if (!el) return;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            if (dx > 0) go(1);
            else go(-1);
        } else {
            gsap.to(el, { x: 0, duration: DURATION, ease: "power2.out", overwrite: true });
        }
    }, [go]);

    // Prevent page scroll when swiping on touch devices (passive: false required for preventDefault)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const onTouchMove = (e: TouchEvent) => {
            if (dragging.current && e.cancelable) e.preventDefault();
        };
        container.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => container.removeEventListener("touchmove", onTouchMove);
    }, []);

    const handleMessage = async (e: React.MouseEvent, uid: string) => {
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

    if (!idea || n === 0) return null;

    const meta = catMeta[idea.category] || catMeta.Tech;
    const scoreColor = idea.voteScore > 0 ? "text-emerald-400" : idea.voteScore < 0 ? "text-red-400" : "text-theme-muted";
    const scoreSign = idea.voteScore > 0 ? "+" : "";

    return (
        <div className="w-full px-3 sm:px-4 pb-6">
            <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-2 text-center">
                Swipe right for next · Swipe left for previous
            </p>
            <div
                ref={containerRef}
                className="relative w-full max-w-[min(100%,380px)] mx-auto select-none touch-none"
                style={{ height: "min(72vh, 520px)", touchAction: "none" }}
                onMouseMove={onMove}
                onMouseUp={onEnd}
                onMouseLeave={onEnd}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
                onTouchCancel={onEnd}
            >
                <div
                    ref={wrapperRef}
                    className="absolute inset-0 will-change-transform cursor-grab active:cursor-grabbing"
                    onMouseDown={onStart}
                    onTouchStart={onStart}
                >
                    <div
                        className={`w-full h-full rounded-3xl overflow-hidden border bg-[var(--card-bg)] shadow-xl flex flex-col ${meta.border} ${meta.glow}`}
                        onClick={() => router.push(`/ideas/${idea._id}`)}
                    >
                        <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 shrink-0" />
                        <div className="relative z-10 flex flex-col flex-1 min-h-0 p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${meta.bg} border ${meta.border} ${meta.color} text-[9px] font-black uppercase tracking-[0.2em]`}>
                                    {catIcon[idea.category] ?? null}
                                    {idea.category}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                    {idea.userId.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-bold ${scoreColor}`}>{scoreSign}{idea.voteScore}</span>
                                    <span className="text-theme-muted text-xs">·</span>
                                    <span className="text-xs font-bold text-theme-muted">{idea.commentCount || 0}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-theme-primary tracking-tight leading-snug line-clamp-2 mb-2">
                                {idea.title}
                            </h3>

                            <p className={`text-theme-secondary text-sm leading-relaxed mb-3 flex-1 min-h-0 overflow-y-auto ${expanded ? "" : "line-clamp-3"}`}>
                                {idea.summary}
                            </p>

                            {expanded && idea.aiReport && (
                                <div className="mb-3">
                                    <IdeaCardAiMetrics aiReport={idea.aiReport} />
                                </div>
                            )}

                            <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <VoteButtons ideaId={idea._id} initialScore={idea.voteScore} initialStatus={idea.userVote ?? null} layout="horizontal" compact />
                                    <span className="text-xs font-bold text-theme-muted">{idea.commentCount || 0} comments</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v); }}
                                        className="text-xs font-bold text-violet-400 hover:text-violet-300"
                                    >
                                        {expanded ? "Show less" : "View more"}
                                    </button>
                                    {expanded && user && user.id !== idea.userId._id && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleMessage(e, idea.userId._id)}
                                            className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prev / Next buttons + position */}
            <div className="flex items-center justify-center gap-4 mt-4">
                <button
                    type="button"
                    onClick={() => go(-1)}
                    disabled={current <= 0}
                    className="w-12 h-12 rounded-full border-2 border-violet-500/40 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-opacity"
                    aria-label="Previous card"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-sm font-bold text-theme-muted tabular-nums min-w-16 text-center">
                    {current + 1} / {n}
                </span>
                <button
                    type="button"
                    onClick={() => go(1)}
                    disabled={current >= n - 1}
                    className="w-12 h-12 rounded-full border-2 border-violet-500/40 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-opacity"
                    aria-label="Next card"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Dots */}
            {n > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                    {ideas.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                if (i === current) return;
                                const el = wrapperRef.current;
                                const container = containerRef.current;
                                const w = container?.offsetWidth ?? 320;
                                if (el) {
                                    gsap.killTweensOf(el);
                                    swipeDirectionRef.current = i > current ? 1 : -1;
                                    gsap.set(el, { x: swipeDirectionRef.current * w });
                                }
                                justNavigated.current = true;
                                animating.current = true;
                                setCurrent(i);
                                setExpanded(false);
                            }}
                            className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-violet-500" : "w-2 bg-theme-muted/40"}`}
                            aria-label={`Card ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
