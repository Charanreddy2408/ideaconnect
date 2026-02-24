"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface HorizontalCardScrollProps {
    ideas: any[];
}

const catMeta: Record<string, { color: string; bg: string; border: string; glow: string; accent: string }> = {
    Tech: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", glow: "shadow-blue-500/20", accent: "#3b82f6" },
    Social: { color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/25", glow: "shadow-pink-500/20", accent: "#ec4899" },
    Fintech: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", glow: "shadow-emerald-500/20", accent: "#10b981" },
    Health: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", glow: "shadow-red-500/20", accent: "#ef4444" },
    Education: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", glow: "shadow-amber-500/20", accent: "#f59e0b" },
    AI: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25", glow: "shadow-violet-500/20", accent: "#8b5cf6" },
    Web3: { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", glow: "shadow-indigo-500/20", accent: "#6366f1" },
    SaaS: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", glow: "shadow-sky-500/20", accent: "#0ea5e9" },
};

const catIcon: Record<string, ReactElement> = {
    Tech: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Social: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Fintech: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Health: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Education: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    AI: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Web3: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    SaaS: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
};

export default function HorizontalCardScroll({ ideas }: HorizontalCardScrollProps) {
    const { user } = useAuth();
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleMessage = async (e: React.MouseEvent, idea: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { router.push("/login"); return; }
        try {
            const res = await fetch("/api/messages/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: idea.userId._id }),
            });
            if (res.ok) router.push("/messages");
        } catch (err) { console.error("Start chat error:", err); }
    };

    // Animate cards on mount
    useEffect(() => {
        if (!scrollContainerRef.current) return;
        const cards = scrollContainerRef.current.querySelectorAll('.stream-card');
        gsap.from(cards, {
            x: 100,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: "power3.out",
        });
    }, [ideas]);

    if (ideas.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-theme-secondary text-sm">No ideas to display</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
                style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {ideas.map((idea: any) => {
                    const meta = catMeta[idea.category] || catMeta.Tech;
                    const scoreColor = idea.voteScore > 0 ? "text-emerald-400" : idea.voteScore < 0 ? "text-red-400" : "text-theme-muted";
                    const scoreSign = idea.voteScore > 0 ? "+" : "";
                    const createdAt = new Date(idea.createdAt || Date.now());
                    const year = createdAt.getFullYear();
                    const month = createdAt.toLocaleDateString('en-US', { month: 'short' });

                    const handleCardClick = () => {
                        router.push(`/ideas/${idea._id}`);
                    };

                    return (
                        <div
                            key={idea._id}
                            className="stream-card flex-shrink-0 w-[85vw] max-w-sm relative group"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            <div
                                className={`relative h-[500px] rounded-3xl overflow-hidden border ${meta.border} bg-gradient-to-br from-[var(--card-bg)] via-[var(--card-bg)] to-[var(--card-bg)] backdrop-blur-xl shadow-2xl ${meta.glow} transition-transform duration-300 group-active:scale-[0.98]`}
                                onClick={handleCardClick}
                            >
                                {/* Background gradient overlay */}
                                <div 
                                    className="absolute inset-0 opacity-80"
                                    style={{
                                        background: `linear-gradient(135deg, ${meta.accent}15, ${meta.accent}05, transparent)`,
                                    }}
                                />

                                {/* Top badge - "New Release" style */}
                                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                                        <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-[9px] font-black text-white uppercase tracking-[0.15em]">New Idea</span>
                                    </div>
                                </div>

                                {/* Category badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${meta.bg} border ${meta.border} ${meta.color} text-[8px] font-black uppercase tracking-[0.15em] backdrop-blur-sm`}>
                                        {catIcon[idea.category] || null}
                                        {idea.category}
                                    </span>
                                </div>

                                {/* Main content area */}
                                <div className="relative z-10 flex flex-col h-full p-6 pt-20">
                                    {/* Title */}
                                    <h3 className="text-2xl font-black text-white mb-3 leading-tight line-clamp-2 drop-shadow-lg">
                                        {idea.title}
                                    </h3>

                                    {/* Metadata row */}
                                    <div className="flex items-center gap-3 mb-4 text-white/70 text-xs font-bold">
                                        <span>{year}</span>
                                        <span>•</span>
                                        <span className="uppercase tracking-wider">{idea.category}</span>
                                        <span>•</span>
                                        <span>Idea</span>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 mb-4">
                                        {/* Vote Score */}
                                        <div className="flex items-center gap-1.5">
                                            <svg className={`w-4 h-4 ${scoreColor}`} fill="currentColor" viewBox="0 0 24 24">
                                                {idea.voteScore >= 0
                                                    ? <path d="M12 4L4 12H9V20H15V12H20L12 4Z" />
                                                    : <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />
                                                }
                                            </svg>
                                            <span className={`text-sm font-black tabular-nums ${scoreColor}`}>{scoreSign}{idea.voteScore}</span>
                                        </div>

                                        {/* Comments */}
                                        <div className="flex items-center gap-1.5 text-white/60">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            <span className="text-xs font-bold">{idea.commentCount || 0}</span>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-auto">
                                        {idea.summary}
                                    </p>

                                    {/* Bottom action bar */}
                                    <div className="mt-auto pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            {/* Primary action: click card navigates, so this area can be a subtle play icon only if needed */}
                                            {/* Add to list button */}
                                            <button
                                                className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                                title="Save idea"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>

                                            {/* Message button */}
                                            {user && user.id !== idea.userId._id && (
                                                <button
                                                    onClick={(e) => handleMessage(e, idea)}
                                                    className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                                    title="Message founder"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Founder info */}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-violet-500/30">
                                                {idea.userId.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Founder</p>
                                                <p className="text-xs font-black text-white truncate">{idea.userId.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
