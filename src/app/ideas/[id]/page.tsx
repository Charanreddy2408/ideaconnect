"use client";

import { useEffect, useState, useRef, type ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import Comment from "@/components/Comment";
import Modal from "@/components/Modal";
import EditIdeaForm from "@/components/EditIdeaForm";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ── category meta ── */
const catMeta: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
    Tech: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", gradient: "from-blue-500 to-cyan-500" },
    Social: { color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/25", gradient: "from-pink-500 to-rose-500" },
    Fintech: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", gradient: "from-emerald-500 to-teal-500" },
    Health: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", gradient: "from-red-500 to-orange-500" },
    Education: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", gradient: "from-amber-500 to-yellow-500" },
    AI: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25", gradient: "from-violet-500 to-indigo-500" },
    Web3: { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", gradient: "from-indigo-500 to-blue-500" },
    SaaS: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", gradient: "from-sky-500 to-blue-500" },
};

const catIcon: Record<string, ReactElement> = {
    Tech: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Social: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Fintech: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Health: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Education: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    AI: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Web3: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    SaaS: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
};

export default function IdeaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const pageRef = useRef<HTMLDivElement>(null);

    const [idea, setIdea] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState("");
    const [postingComment, setPostingComment] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchIdea = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/ideas/${params.id}`);
            const data = await res.json();
            if (res.ok) {
                setIdea(data);
            } else if (res.status === 404) {
                router.push("/ideas");
            }
        } catch (error) {
            console.error("Fetch idea error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/ideas/${params.id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(Array.isArray(data.comments) ? data.comments : []);
            }
        } catch (error) {
            console.error("Fetch comments error:", error);
        }
    };

    const handlePostComment = async () => {
        if (!commentInput.trim()) return;
        setPostingComment(true);
        const text = commentInput.trim();
        setCommentInput("");
        try {
            const res = await fetch(`/api/ideas/${params.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment: text }),
            });
            const data = await res.json();
            if (res.ok) {
                const newComment = data.comment;
                if (newComment) {
                    const withUser = {
                        ...newComment,
                        userId: newComment.userId || (user ? { _id: user.id, name: user.name } : null),
                        replies: newComment.replies || [],
                    };
                    setComments((prev) => [withUser, ...prev]);
                }
                fetchComments();
            }
        } catch (error) {
            console.error("Post comment error:", error);
        } finally {
            setPostingComment(false);
        }
    };

    const handleStartChat = async () => {
        if (!idea) return;
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/ideas/${params.id}`)}`);
            return;
        }
        try {
            const res = await fetch("/api/messages/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: idea.userId._id }),
            });
            if (res.ok) {
                router.push("/messages");
            }
        } catch (error) {
            console.error("Start chat error:", error);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchIdea();
            fetchComments();
        }
    }, [params.id]);

    // GSAP: entrance (no tilt) + smooth scroll-driven parallax (no reveal)
    useEffect(() => {
        if (loading || !idea || !pageRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.from(".detail-back", { x: -24, opacity: 0, duration: 0.5 });
            tl.from(".detail-hero-bg", { scale: 1.03, opacity: 0, duration: 0.9 }, 0);
            tl.from(".detail-hero-content > *", { y: 24, opacity: 0, stagger: 0.05, duration: 0.6 }, 0.15);
            tl.from(".detail-stat", { y: 20, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.35);
            tl.from(".detail-sidebar > *", { x: 24, opacity: 0, stagger: 0.06, duration: 0.5 }, 0.4);

            // Hero: smooth scroll parallax (moves slower than scroll — no tilt)
            gsap.to(".detail-hero-bg", {
                y: -40,
                ease: "none",
                scrollTrigger: {
                    trigger: ".detail-hero-bg",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.2,
                },
            });

            // Sections: smooth scroll-linked motion (parallax drift, always visible)
            gsap.utils.toArray<HTMLElement>(".detail-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { y: 24 },
                    {
                        y: -16,
                        ease: "none",
                        scrollTrigger: {
                            trigger: section,
                            start: "top bottom",
                            end: "top 30%",
                            scrub: 1.2,
                        },
                    }
                );
            });

            // Comments: same smooth scroll parallax
            gsap.fromTo(
                ".detail-comments",
                { y: 32 },
                {
                    y: -20,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".detail-comments",
                        start: "top bottom",
                        end: "top 25%",
                        scrub: 1.2,
                    },
                }
            );
        }, pageRef);

        return () => ctx.revert();
    }, [loading, idea]);

    if (loading) return (
        <div className="p-4 sm:p-12 space-y-6 max-w-6xl mx-auto">
            <div className="h-10 w-40 rounded-xl animate-shimmer" style={{ background: 'var(--card-bg)' }} />
            <div className="h-72 rounded-3xl animate-shimmer" style={{ background: 'var(--card-bg)' }} />
            <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl animate-shimmer" style={{ background: 'var(--card-bg)' }} />)}
            </div>
            <div className="h-64 rounded-3xl animate-shimmer" style={{ background: 'var(--card-bg)' }} />
        </div>
    );

    if (!idea) return null;

    const meta = catMeta[idea.category] || catMeta.Tech;
    const icon = catIcon[idea.category] || null;
    const scoreColor = idea.voteScore > 0 ? "text-emerald-400" : idea.voteScore < 0 ? "text-red-400" : "text-theme-muted";
    const scoreSign = idea.voteScore > 0 ? "+" : "";

    return (
        <div ref={pageRef} className="detail-page max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
            {/* ═══════════════════════════════
                BACK BUTTON
               ═══════════════════════════════ */}
            <button
                onClick={() => router.push("/ideas")}
                className="detail-back inline-flex items-center gap-2.5 text-sm font-bold text-theme-secondary hover:text-theme-primary transition-colors group/back"
            >
                <div className="w-8 h-8 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center group-hover/back:bg-[var(--surface-hover)] transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
                Back to Marketplace
            </button>

            {/* ═══════════════════════════════
                HERO SECTION
               ═══════════════════════════════ */}
            <div className="detail-hero-bg relative rounded-[32px] overflow-hidden border border-[var(--card-border)]" style={{ background: "var(--card-bg)" }}>
                {/* Gradient background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-[0.04]`} />
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: `linear-gradient(135deg, var(--glow-primary), var(--glow-secondary))` }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-10" style={{ background: 'var(--glow-accent)' }} />

                {/* Top accent line */}
                <div className={`h-1 w-full bg-gradient-to-r ${meta.gradient}`} />

                <div className="detail-hero-content relative z-10 p-6 sm:p-10 lg:p-14 space-y-6">
                    {/* Badge row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl ${meta.bg} border ${meta.border} ${meta.color} text-[10px] font-black uppercase tracking-[0.25em]`}>
                            {icon}
                            {idea.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black text-theme-primary leading-[1.1] tracking-tight max-w-3xl">
                        {idea.title}
                    </h1>

                    {/* Summary — styled as a quote */}
                    <blockquote className="relative pl-5 border-l-[3px] border-violet-500/30 max-w-2xl">
                        <p className="text-lg sm:text-xl text-theme-secondary leading-relaxed font-medium italic">
                            &ldquo;{idea.summary}&rdquo;
                        </p>
                    </blockquote>

                    {/* Founder + Actions */}
                    <div className="flex flex-wrap items-center gap-5 pt-2">
                        <div className="flex items-center gap-3.5 group/founder">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-0.5 shadow-lg shadow-violet-500/20 group-hover/founder:shadow-xl group-hover/founder:shadow-violet-500/30 transition-all duration-500">
                                <div className="w-full h-full rounded-[14px] flex items-center justify-center font-black text-lg text-white">
                                    {idea.userId.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold text-theme-muted uppercase tracking-[0.2em]">Founder</div>
                                <div className="text-base font-bold text-theme-primary">{idea.userId.name}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            {user?.id !== idea.userId._id ? (
                                <button
                                    onClick={handleStartChat}
                                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:translate-y-[-2px] hover:shadow-xl shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Collaborate
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--input-bg)] hover:bg-[var(--surface-hover)] text-theme-primary font-bold text-sm border border-[var(--input-border)] transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm("Delete this idea?")) {
                                                const res = await fetch(`/api/ideas/${idea._id}`, { method: "DELETE" });
                                                if (res.ok) router.push("/ideas");
                                            }
                                        }}
                                        className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════
                STATS ROW
               ═══════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Vote Score — big */}
                <div className="detail-stat relative rounded-2xl border border-[var(--card-border)] overflow-hidden p-5 sm:p-6" style={{ background: 'var(--card-bg)' }}>
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="flex items-center gap-2 mb-2">
                        <svg className={`w-5 h-5 ${scoreColor}`} fill="currentColor" viewBox="0 0 24 24">
                            {idea.voteScore >= 0
                                ? <path d="M12 4L4 12H9V20H15V12H20L12 4Z" />
                                : <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />
                            }
                        </svg>
                        <span className="text-[9px] font-bold text-theme-muted uppercase tracking-[0.2em]">Vote Score</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl sm:text-4xl font-black tabular-nums ${scoreColor}`}>{scoreSign}{idea.voteScore}</span>
                        <span className="text-xs font-bold text-theme-muted">pts</span>
                    </div>
                    {/* Inline vote buttons */}
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <VoteButtons
                            ideaId={idea._id}
                            initialScore={idea.voteScore}
                            initialStatus={idea.userVote ?? null}
                            layout="horizontal"
                            compact
                        />
                    </div>
                </div>

                {/* Comments count */}
                <div className="detail-stat relative rounded-2xl border border-[var(--card-border)] overflow-hidden p-5 sm:p-6" style={{ background: 'var(--card-bg)' }}>
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        <span className="text-[9px] font-bold text-theme-muted uppercase tracking-[0.2em]">Discussion</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tabular-nums text-indigo-400">{comments.length}</span>
                        <span className="text-xs font-bold text-theme-muted">{comments.length === 1 ? 'comment' : 'comments'}</span>
                    </div>
                    <a href="#comments" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider hover:text-indigo-300 transition-colors">
                        Jump to discussion
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </a>
                </div>

                {/* Skills count / Budget */}
                <div className="detail-stat relative rounded-2xl border border-[var(--card-border)] overflow-hidden p-5 sm:p-6" style={{ background: 'var(--card-bg)' }}>
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        <span className="text-[9px] font-bold text-theme-muted uppercase tracking-[0.2em]">Skills</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tabular-nums text-amber-400">{idea.requiredSkills?.length || 0}</span>
                        <span className="text-xs font-bold text-theme-muted">required</span>
                    </div>
                    {idea.budget && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                            <span className="text-[9px] font-bold text-theme-muted uppercase tracking-wider block">Budget (INR)</span>
                            <span className="text-sm font-bold text-amber-400">{idea.budget}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════
                MAIN CONTENT + SIDEBAR
               ═══════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* LEFT — Content sections */}
                <div className="lg:col-span-2 space-y-6">
                    {[
                        {
                            title: "Problem Statement",
                            content: idea.problem,
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            ),
                            gradient: "from-indigo-500 to-blue-500",
                            color: "text-indigo-400",
                        },
                        {
                            title: "Target Audience",
                            content: idea.targetAudience,
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            ),
                            gradient: "from-indigo-500 to-violet-500",
                            color: "text-indigo-400",
                        },
                        {
                            title: "Revenue Model",
                            content: idea.revenueModel,
                            icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ),
                            gradient: "from-pink-500 to-rose-500",
                            color: "text-pink-400",
                        },
                    ].map((section, i) => (
                        section.content ? (
                            <div key={i} className="detail-section">
                                <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                                    {/* Section header */}
                                    <div className="flex items-center gap-3 px-6 sm:px-8 py-4 border-b border-[var(--border-color)]" style={{ background: 'var(--input-bg)' }}>
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg`}>
                                            {section.icon}
                                        </div>
                                        <h2 className="text-base sm:text-lg font-black text-theme-primary">{section.title}</h2>
                                    </div>
                                    {/* Section content */}
                                    <div className="px-6 sm:px-8 py-6 sm:py-8">
                                        <p className="text-theme-secondary leading-[1.85] text-[15px]">{section.content}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    ))}

                    {/* AI Report */}
                    {idea.aiReport && (
                        <div className="detail-section">
                            <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                                <div className="flex items-center gap-3 px-6 sm:px-8 py-4 border-b border-[var(--border-color)]" style={{ background: 'var(--input-bg)' }}>
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-black text-theme-primary">AI Evaluation</h2>
                                    <span className={`ml-auto px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                                        idea.aiReport.competitionRisk === "Low" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                                        idea.aiReport.competitionRisk === "Medium" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                                        "bg-red-500/15 text-red-400 border border-red-500/30"
                                    }`}>
                                        Risk: {idea.aiReport.competitionRisk}
                                    </span>
                                </div>
                                <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6">
                                    {/* Scores grid */}
                                    <div>
                                        <h3 className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-3">Scores (0–100)</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: "Problem clarity", value: idea.aiReport.problemClarity },
                                                { label: "Audience", value: idea.aiReport.audienceScore },
                                                { label: "Monetization", value: idea.aiReport.monetizationScore },
                                                { label: "Innovation", value: idea.aiReport.innovationScore },
                                                { label: "Feasibility", value: idea.aiReport.feasibilityScore },
                                                { label: "Scalability", value: idea.aiReport.scalabilityScore },
                                                { label: "Validation readiness", value: idea.aiReport.validationReadiness },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex flex-col gap-1">
                                                    <span className="text-xs text-theme-muted">{label}</span>
                                                    <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                                                    </div>
                                                    <span className="text-sm font-bold text-theme-primary tabular-nums">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Strengths */}
                                    {idea.aiReport.strengths?.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-2">Strengths</h3>
                                            <ul className="space-y-1.5">
                                                {idea.aiReport.strengths.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                                                        <span className="text-emerald-400 mt-0.5">✓</span>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Risks */}
                                    {idea.aiReport.risks?.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-2">Risks</h3>
                                            <ul className="space-y-1.5">
                                                {idea.aiReport.risks.map((r: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                                                        <span className="text-amber-400 mt-0.5">!</span>
                                                        <span>{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Suggestions — only for the idea owner */}
                                    {idea.aiReport.suggestions?.length > 0 && user?.id === idea.userId?._id && (
                                        <div>
                                            <h3 className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] mb-2">Suggestions</h3>
                                            <ul className="space-y-1.5">
                                                {idea.aiReport.suggestions.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-theme-secondary">
                                                        <span className="text-violet-400 mt-0.5">→</span>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {idea.aiReport.generatedAt && (
                                        <p className="text-[10px] text-theme-muted uppercase tracking-wider">
                                            Generated {new Date(idea.aiReport.generatedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT — Sidebar */}
                <div className="detail-sidebar space-y-6">
                    {/* Required Skills */}
                    {idea.requiredSkills && idea.requiredSkills.length > 0 && (
                        <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-2" style={{ background: 'var(--input-bg)' }}>
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                <h3 className="text-xs font-black text-theme-muted uppercase tracking-[0.2em]">Required Skills</h3>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-wrap gap-2">
                                    {idea.requiredSkills.map((skill: string) => (
                                        <span key={skill} className="px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm font-medium text-theme-secondary hover:text-theme-primary hover:border-violet-500/30 transition-all cursor-default">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Budget / Stage (INR) */}
                    {idea.budget && (
                        <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-2" style={{ background: 'var(--input-bg)' }}>
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="text-xs font-black text-theme-muted uppercase tracking-[0.2em]">Budget / Stage (INR)</h3>
                            </div>
                            <div className="p-5">
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{idea.budget}</span>
                            </div>
                        </div>
                    )}

                    {/* Founder card */}
                    <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-2" style={{ background: 'var(--input-bg)' }}>
                            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <h3 className="text-xs font-black text-theme-muted uppercase tracking-[0.2em]">About the Founder</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-violet-500/20">
                                    {idea.userId.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-theme-primary">{idea.userId.name}</div>
                                    <div className="text-xs text-theme-muted">Idea Creator</div>
                                </div>
                            </div>
                            {user && user.id !== idea.userId._id && (
                                <button
                                    onClick={handleStartChat}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    Send Message
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══════════════════════════════
                COMMENTS SECTION
               ═══════════════════════════════ */}
            <section id="comments" className="detail-comments space-y-6 pt-8">
                <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                    {/* Comments header */}
                    <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-color)] flex items-center justify-between" style={{ background: 'var(--input-bg)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-theme-primary">Discussion</h2>
                        </div>
                        <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-black text-indigo-400 tabular-nums">
                            {comments.length}
                        </span>
                    </div>

                    {/* Comment input */}
                    <div className="px-6 sm:px-8 py-6 border-b border-[var(--border-color)]">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md flex-shrink-0 mt-0.5">
                                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        className="input-field flex-1 min-h-[80px] resize-none"
                                        placeholder="Share your feedback or ask a question..."
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handlePostComment}
                                        disabled={postingComment || !commentInput.trim()}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 text-sm"
                                    >
                                        {postingComment ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                Post Comment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </div>
                                <p className="text-theme-secondary text-sm">Sign in to join the discussion</p>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm"
                                >
                                    Sign In
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Comments list */}
                    <div className="px-6 sm:px-8 py-6">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 space-y-2">
                                <div className="text-3xl mb-2">💭</div>
                                <p className="text-theme-secondary text-sm font-medium">No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {comments.map((comment: any) => (
                                    <Comment key={comment._id} comment={comment} ideaId={idea._id} onRefreshAction={fetchComments} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Your Idea"
            >
                <EditIdeaForm
                    idea={idea}
                    onSuccessAction={(updated: any) => {
                        setIdea(updated);
                        setIsEditModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
