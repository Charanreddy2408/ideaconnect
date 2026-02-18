"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";

interface IdeaCardProps {
    idea: {
        _id: string;
        title: string;
        summary: string;
        category: string;
        voteScore: number;
        validationScore: number;
        commentCount: number;
        userVote?: number | null;
        userId: {
            _id: string;
            name: string;
        };
    };
}

/* ── Category styling ── */
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

export default function IdeaCard({ idea }: IdeaCardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const meta = catMeta[idea.category] || catMeta.Tech;

    const handleMessage = async (e: React.MouseEvent) => {
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

    const scoreColor = idea.voteScore > 0 ? "text-emerald-400" : idea.voteScore < 0 ? "text-red-400" : "text-theme-muted";
    const scoreSign = idea.voteScore > 0 ? "+" : "";

    return (
        <div className="idea-card group h-[400px]">
            <div className="flip-card-container relative w-full h-full">
                {/* ═══════ FRONT FACE ═══════ */}
                <div className="flip-card-front absolute inset-0">
                    <div className={`relative w-full h-full rounded-3xl overflow-hidden border ${meta.border} bg-[var(--card-bg)] backdrop-blur-xl transition-shadow duration-500 shadow-xl ${meta.glow}`}>
                        {/* Top gradient line */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

                        {/* Decorative corner glow */}
                        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${meta.bg} blur-3xl opacity-50 pointer-events-none`} />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

                        {/* Main content */}
                        <div className="relative z-10 flex flex-col h-full p-6">
                            {/* Category row */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ${meta.bg} border ${meta.border} ${meta.color} text-[9px] font-black uppercase tracking-[0.2em]`}>
                                    {catIcon[idea.category] || null}
                                    {idea.category}
                                </span>

                                {/* Founder avatar mini */}
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                                        {idea.userId.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-theme-secondary max-w-[80px] truncate">{idea.userId.name}</span>
                                </div>
                            </div>

                            {/* ═══ VALIDATION SCORE — prominent on front ═══ */}
                            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                                {/* Circular progress ring */}
                                <div className="relative w-11 h-11 flex-shrink-0">
                                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                                        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                                        <circle cx="22" cy="22" r="18" fill="none"
                                            stroke={idea.validationScore >= 70 ? '#34d399' : idea.validationScore >= 40 ? '#fbbf24' : '#fb923c'}
                                            strokeWidth="3" strokeLinecap="round"
                                            strokeDasharray={`${(idea.validationScore / 100) * 113.1} 113.1`}
                                        />
                                    </svg>
                                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums ${idea.validationScore >= 70 ? 'text-emerald-400' : idea.validationScore >= 40 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                        {idea.validationScore}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-theme-muted uppercase tracking-[0.2em] leading-none">Validation</span>
                                    <span className="text-[8px] font-bold text-theme-muted uppercase tracking-[0.2em] leading-none mt-0.5">Score</span>
                                </div>
                                <div className="ml-auto flex items-center gap-3 text-theme-muted">
                                    <div className="flex items-center gap-1">
                                        <svg className={`w-3.5 h-3.5 ${idea.voteScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 24 24">
                                            {idea.voteScore >= 0
                                                ? <path d="M12 4L4 12H9V20H15V12H20L12 4Z" />
                                                : <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />
                                            }
                                        </svg>
                                        <span className={`text-xs font-bold tabular-nums ${scoreColor}`}>{scoreSign}{idea.voteScore}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <span className="text-xs font-bold">{idea.commentCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black text-theme-primary tracking-tight leading-snug line-clamp-2 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-indigo-400 transition-all duration-500">
                                {idea.title}
                            </h3>

                            {/* Short summary preview */}
                            <p className="text-theme-secondary text-sm leading-relaxed line-clamp-2 mb-auto">
                                {idea.summary}
                            </p>

                            {/* Flip hint row */}
                            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[var(--border-color)] text-theme-muted opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-[9px] font-bold uppercase tracking-widest">Hover to flip</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════ BACK FACE ═══════ */}
                <div className="flip-card-back absolute inset-0">
                    <div className={`relative w-full h-full rounded-3xl overflow-hidden border ${meta.border} bg-[var(--card-bg)] backdrop-blur-xl shadow-2xl ${meta.glow}`}>
                        {/* Top gradient line */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500" />

                        {/* Decorative corner glow */}
                        <div className={`absolute -top-16 -left-16 w-48 h-48 rounded-full ${meta.bg} blur-3xl opacity-50 pointer-events-none`} />

                        <div className="relative z-10 flex flex-col h-full p-6">
                            {/* Back header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${meta.bg} ${meta.color} text-[9px] font-black uppercase tracking-[0.15em]`}>
                                    {catIcon[idea.category] || null}
                                    {idea.category}
                                </span>
                                <span className="text-[9px] font-black text-theme-muted uppercase tracking-widest">Description</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 tracking-tight leading-snug mb-3">
                                {idea.title}
                            </h3>

                            {/* Full description */}
                            <div className="flex-1 overflow-y-auto scrollbar-hide mb-3">
                                <p className="text-theme-secondary text-sm leading-[1.8]">
                                    {idea.summary}
                                </p>
                            </div>

                            {/* ═══ STATS on back ═══ */}
                            <div className="flex items-center gap-3 mb-3 py-2.5 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                                {/* Validation mini ring */}
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                                        <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                                        <circle cx="16" cy="16" r="13" fill="none"
                                            stroke={idea.validationScore >= 70 ? '#34d399' : idea.validationScore >= 40 ? '#fbbf24' : '#fb923c'}
                                            strokeWidth="2.5" strokeLinecap="round"
                                            strokeDasharray={`${(idea.validationScore / 100) * 81.68} 81.68`}
                                        />
                                    </svg>
                                    <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black tabular-nums ${idea.validationScore >= 70 ? 'text-emerald-400' : idea.validationScore >= 40 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                        {idea.validationScore}
                                    </span>
                                </div>
                                <div className="w-px h-5 bg-[var(--border-color)]" />
                                {/* Vote score */}
                                <div className="flex items-center gap-1">
                                    <svg className={`w-3.5 h-3.5 ${scoreColor}`} fill="currentColor" viewBox="0 0 24 24">
                                        {idea.voteScore >= 0
                                            ? <path d="M12 4L4 12H9V20H15V12H20L12 4Z" />
                                            : <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />
                                        }
                                    </svg>
                                    <span className={`text-sm font-black tabular-nums ${scoreColor}`}>{scoreSign}{idea.voteScore}</span>
                                </div>
                                <div className="w-px h-5 bg-[var(--border-color)]" />
                                {/* Comments */}
                                <div className="flex items-center gap-1 text-theme-muted">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                    <span className="text-xs font-bold">{idea.commentCount || 0}</span>
                                </div>
                            </div>

                            {/* Action buttons row */}
                            <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
                                <VoteButtons
                                    ideaId={idea._id}
                                    initialScore={idea.voteScore}
                                    initialStatus={idea.userVote ?? null}
                                    layout="horizontal"
                                    compact
                                />

                                <div className="flex-1" />

                                {user && user.id !== idea.userId._id && (
                                    <button
                                        onClick={handleMessage}
                                        className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 transition-all"
                                        title="Message founder"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </button>
                                )}

                                <Link
                                    href={`/ideas/${idea._id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View Details
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
