"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Period = "daily" | "weekly" | "monthly";

interface LeaderboardEntry {
    rank: number;
    _id: string;
    title: string;
    summary: string;
    category: string;
    upvotes: number;
    downvotes: number;
    voteScore: number;
    commentCount: number;
    createdAt: string;
    userId: { _id: string; name: string } | null;
}

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<Period>("weekly");
    const [data, setData] = useState<{ leaderboard: LeaderboardEntry[]; since: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/leaderboard?period=${period}`)
            .then((res) => res.json())
            .then((json) => {
                if (json.leaderboard) {
                    setData({ leaderboard: json.leaderboard, since: json.since });
                } else {
                    setData({ leaderboard: [], since: "" });
                }
            })
            .catch(() => setData({ leaderboard: [], since: "" }))
            .finally(() => setLoading(false));
    }, [period]);

    const top3 = data?.leaderboard?.slice(0, 3) ?? [];
    const rest = data?.leaderboard?.slice(3) ?? [];

    const periodLabel = { daily: "Today", weekly: "This Week", monthly: "This Month" };

    return (
        <div className="min-h-screen bg-theme overflow-x-hidden">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[var(--border-color)]">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
                <div
                    className={`relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 text-center transition-all duration-700 ease-out ${
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-theme-primary break-words" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">Leaderboard</span>
                    </h1>
                    <p className="mt-2 sm:mt-3 text-theme-secondary text-sm sm:text-base md:text-lg max-w-xl mx-auto">
                        Top ideas by upvotes — no login needed.
                    </p>

                    {/* Period tabs — touch-friendly on mobile */}
                        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
                        {(["daily", "weekly", "monthly"] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPeriod(p)}
                                className={`min-h-[44px] min-w-[100px] sm:min-w-0 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all touch-manipulation ${
                                    period === p
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                                        : "bg-[var(--input-bg)] border border-[var(--input-border)] text-theme-secondary hover:text-theme-primary hover:border-violet-500/30 active:opacity-90"
                                }`}
                            >
                                {periodLabel[p]}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                        <p className="text-theme-muted font-medium text-sm sm:text-base">Loading leaderboard…</p>
                    </div>
                ) : !data?.leaderboard?.length ? (
                    <div className="text-center py-16 sm:py-24 px-2">
                        <p className="text-theme-muted font-medium text-sm sm:text-base">No ideas in this period yet. Be the first to post and get upvotes!</p>
                        <Link href="/ideas" className="inline-block mt-6 min-h-[44px] px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 active:opacity-90 transition-colors touch-manipulation">
                            Browse ideas
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Podium — top 3, compact on mobile */}
                        <div
                            className={`grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end max-w-3xl mx-auto mb-8 sm:mb-14 transition-all duration-700 ease-out ${
                                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                            style={{ transitionDelay: mounted ? "80ms" : "0ms" }}
                        >
                            {/* 2nd place — left */}
                            {top3[1] && (
                                <div className="order-2 sm:order-1 flex flex-col items-center min-w-0">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-black text-white shadow-lg mb-2 sm:mb-3 shrink-0">
                                        2
                                    </div>
                                    <Link
                                        href={`/ideas/${top3[1]._id}`}
                                        className="block w-full min-w-0 rounded-xl sm:rounded-2xl border-2 border-[var(--border-color)] p-2.5 sm:p-4 md:p-5 bg-[var(--surface)] hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-1 active:opacity-90 transition-all text-center touch-manipulation"
                                    >
                                        <p className="font-bold text-theme-primary line-clamp-2 text-xs sm:text-sm md:text-base break-words">{top3[1].title}</p>
                                        <p className="text-[9px] sm:text-[10px] md:text-xs text-theme-muted mt-0.5 sm:mt-1 truncate">{top3[1].userId?.name ?? "Anonymous"}</p>
                                        <div className="mt-1.5 sm:mt-3 flex items-center justify-center gap-0.5 sm:gap-1">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 2 2 0 00-2 2v4H4.48a2 2 0 00-1.923 2.523l.5 2A2 2 0 004.98 12H8v4z" /></svg>
                                            <span className="text-sm sm:text-lg font-black text-theme-primary tabular-nums">{top3[1].upvotes}</span>
                                        </div>
                                    </Link>
                                    <div className="w-full h-16 sm:h-24 md:h-28 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-t from-gray-400/20 to-gray-400/5 mt-1 sm:mt-2" />
                                </div>
                            )}
                            {/* 1st place — center */}
                            {top3[0] && (
                                <div className="order-1 sm:order-2 flex flex-col items-center min-w-0">
                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl sm:text-3xl md:text-4xl font-black text-white shadow-lg sm:shadow-xl shadow-amber-500/30 mb-2 sm:mb-3 shrink-0">
                                        <span className="leading-none">1</span>
                                        <svg
                                            className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M7 3h10v3h2a1 1 0 0 1 .97 1.243l-1.5 6A1 1 0 0 1 17.5 14H15v1a3 3 0 0 1-2 2.83V20h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.17A3 3 0 0 1 9 15v-1H6.5a1 1 0 0 1-.97-.757l-1.5-6A1 1 0 0 1 6 6h1V3Zm2 0v3h6V3H9Zm-2.24 5 1 4H9v-4H6.76Zm8.24 4h1.24l1-4H15v4Z" />
                                        </svg>
                                    </div>
                                    <Link
                                        href={`/ideas/${top3[0]._id}`}
                                        className="block w-full min-w-0 rounded-xl sm:rounded-2xl border-2 border-violet-500/40 p-2.5 sm:p-4 md:p-5 bg-gradient-to-b from-violet-500/10 to-transparent hover:border-violet-500/80 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-1.5 active:opacity-90 transition-all text-center touch-manipulation"
                                    >
                                        <p className="font-bold text-theme-primary line-clamp-2 text-xs sm:text-sm md:text-base break-words">{top3[0].title}</p>
                                        <p className="text-[9px] sm:text-[10px] md:text-xs text-theme-muted mt-0.5 sm:mt-1 truncate">{top3[0].userId?.name ?? "Anonymous"}</p>
                                        <div className="mt-1.5 sm:mt-3 flex items-center justify-center gap-0.5 sm:gap-1">
                                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 2 2 0 00-2 2v4H4.48a2 2 0 00-1.923 2.523l.5 2A2 2 0 004.98 12H8v4z" /></svg>
                                            <span className="text-base sm:text-xl font-black text-theme-primary tabular-nums">{top3[0].upvotes}</span>
                                        </div>
                                    </Link>
                                    <div className="w-full h-20 sm:h-32 md:h-40 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-t from-amber-500/25 to-amber-500/5 mt-1 sm:mt-2" />
                                </div>
                            )}
                            {/* 3rd place — right */}
                            {top3[2] && (
                                <div className="order-3 flex flex-col items-center min-w-0">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-black text-white shadow-lg mb-2 sm:mb-3 shrink-0">
                                        3
                                    </div>
                                    <Link
                                        href={`/ideas/${top3[2]._id}`}
                                        className="block w-full min-w-0 rounded-xl sm:rounded-2xl border-2 border-[var(--border-color)] p-2.5 sm:p-4 md:p-5 bg-[var(--surface)] hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-1 active:opacity-90 transition-all text-center touch-manipulation"
                                    >
                                        <p className="font-bold text-theme-primary line-clamp-2 text-xs sm:text-sm md:text-base break-words">{top3[2].title}</p>
                                        <p className="text-[9px] sm:text-[10px] md:text-xs text-theme-muted mt-0.5 sm:mt-1 truncate">{top3[2].userId?.name ?? "Anonymous"}</p>
                                        <div className="mt-1.5 sm:mt-3 flex items-center justify-center gap-0.5 sm:gap-1">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 2 2 0 00-2 2v4H4.48a2 2 0 00-1.923 2.523l.5 2A2 2 0 004.98 12H8v4z" /></svg>
                                            <span className="text-sm sm:text-lg font-black text-theme-primary tabular-nums">{top3[2].upvotes}</span>
                                        </div>
                                    </Link>
                                    <div className="w-full h-14 sm:h-20 md:h-24 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-t from-amber-700/20 to-amber-700/5 mt-1 sm:mt-2" />
                                </div>
                            )}
                        </div>

                        {/* Rest — two parallel lists: left column + right column */}
                        {rest.length > 0 && (() => {
                            const mid = Math.ceil(rest.length / 2);
                            const leftList = rest.slice(0, mid);
                            const rightList = rest.slice(mid);
                            const row = (entry: (typeof rest)[0]) => (
                                <Link
                                    key={entry._id}
                                    href={`/ideas/${entry._id}`}
                                    className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 min-h-[56px] rounded-xl sm:rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-1 active:opacity-90 transition-all group touch-manipulation"
                                >
                                    <span className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center justify-center text-xs sm:text-sm font-black text-theme-muted tabular-nums">
                                        {entry.rank}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-theme-primary line-clamp-2 sm:truncate text-sm sm:text-base group-hover:text-violet-400 transition-colors break-words">{entry.title}</p>
                                        <p className="text-[10px] sm:text-xs text-theme-muted truncate mt-0.5">{entry.userId?.name ?? "Anonymous"} · {entry.category}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 2 2 0 00-2 2v4H4.48a2 2 0 00-1.923 2.523l.5 2A2 2 0 004.98 12H8v4z" /></svg>
                                        <span className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums">{entry.upvotes}</span>
                                    </div>
                                </Link>
                            );
                            return (
                                <div
                                    className={`space-y-4 sm:space-y-6 transition-all duration-700 ease-out ${
                                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                    }`}
                                    style={{ transitionDelay: mounted ? "140ms" : "0ms" }}
                                >
                                    <h2 className="text-xs sm:text-sm font-black text-theme-muted uppercase tracking-widest mb-4 sm:mb-6">Top ideas</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                        <div className="space-y-2 sm:space-y-3">
                                            {leftList.map(row)}
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            {rightList.map(row)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>
        </div>
    );
}
