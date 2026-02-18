"use client";

import { useEffect, useState, useRef, type ReactElement } from "react";
import IdeaCard from "@/components/IdeaCard";
import TinderStack from "@/components/TinderStack";
import Modal from "@/components/Modal";
import CreateIdeaForm from "@/components/CreateIdeaForm";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const categories = ["All", "Tech", "Social", "Fintech", "Health", "Education", "AI", "Web3"];

const categoryIcons: Record<string, ReactElement> = {
    All: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ),
    Tech: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
    Social: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    Fintech: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    Health: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    ),
    Education: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    ),
    AI: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    ),
    Web3: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
    ),
};

const IDEAS_PER_PAGE = 9;

export default function IdeasPage() {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("recent");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, limit: IDEAS_PER_PAGE, total: 0, pages: 1 });
    const [hasFetchedSuccess, setHasFetchedSuccess] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const headerAnimated = useRef(false);

    const fetchIdeas = async (pageNum: number = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (sort) params.append("sort", sort);
            if (category) params.append("category", category);
            params.set("page", String(pageNum));
            params.set("limit", String(IDEAS_PER_PAGE));

            const res = await fetch(`/api/ideas?${params.toString()}`);
            const data = await res.json();
            if (res.ok && Array.isArray(data.ideas)) {
                setIdeas(data.ideas);
                setPagination(data.pagination || { page: pageNum, limit: IDEAS_PER_PAGE, total: data.ideas.length, pages: 1 });
                setHasFetchedSuccess(true);
            }
        } catch (error) {
            console.error("Failed to fetch ideas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, sort, category]);

    useEffect(() => {
        const timeoutId = setTimeout(() => fetchIdeas(page), 300);
        return () => clearTimeout(timeoutId);
    }, [search, sort, category, page]);

    // Header entrance + 3D (once) and scroll parallax
    useEffect(() => {
        if (!pageRef.current || headerAnimated.current) return;
        headerAnimated.current = true;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

            tl.from(".mp-badge", { y: 30, opacity: 0, duration: 0.8 });
            tl.from(".mp-title", {
                y: 70,
                opacity: 0,
                rotationX: -12,
                transformPerspective: 1000,
                duration: 1.1,
            }, 0.1);
            tl.from(".mp-desc", { y: 45, opacity: 0, filter: "blur(8px)", duration: 0.9 }, 0.25);
            tl.from(".mp-controls", { y: 35, opacity: 0, rotationX: 5, transformPerspective: 800, duration: 0.85 }, 0.4);
            tl.from(".mp-pill", {
                scale: 0.8,
                opacity: 0,
                rotationY: -8,
                transformPerspective: 600,
                stagger: 0.05,
                duration: 0.55,
            }, 0.5);

            // Header parallax on scroll (subtle depth)
            gsap.to(".mp-header-wrap", {
                y: 25,
                opacity: 0.92,
                scale: 0.98,
                ease: "none",
                scrollTrigger: {
                    trigger: ".mp-header-wrap",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5,
                },
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={pageRef} className="marketplace-page px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto space-y-8 sm:space-y-12">
            {/* Header */}
            <div className="mp-header-wrap flex flex-col gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="mp-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-black tracking-[0.3em] text-violet-400 uppercase">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Explore
                        </span>
                    </div>
                    <h1 className="mp-title text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-theme-primary">
                        Idea Marketplace
                    </h1>
                    <p className="mp-desc text-theme-secondary text-sm sm:text-base max-w-lg">
                        Discover, collaborate, and invest in groundbreaking ideas from builders worldwide.
                    </p>
                </div>

                {/* Controls */}
                <div className="mp-controls flex flex-col sm:flex-row gap-3 sm:items-center">
                    {user && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-violet-500/20 text-sm flex items-center gap-2 justify-center sm:w-auto active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Post Idea
                        </button>
                    )}

                    <div className="relative flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="Search ideas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-10 text-sm"
                        />
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="input-field text-sm w-auto pr-8 cursor-pointer"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="validation">Highest Trust</option>
                    </select>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat === "All" ? "" : cat)}
                            className={`mp-pill px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                                (cat === "All" && !category) || category === cat
                                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/10"
                                    : "bg-[var(--input-bg)] border border-[var(--input-border)] text-theme-secondary hover:text-theme-primary hover:bg-[var(--surface-hover)] hover:border-violet-500/20"
                            }`}
                        >
                            {categoryIcons[cat]}
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ideas Display */}
            {loading ? (
                /* Shimmer Loading */
                <>
                    {/* Desktop skeleton */}
                    <div className="hidden lg:grid grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[340px] rounded-3xl animate-shimmer" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }} />
                        ))}
                    </div>
                    {/* Mobile skeleton - horizontal scroll */}
                    <div className="lg:hidden flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-shrink-0 w-[85vw] max-w-sm h-[500px] rounded-3xl animate-shimmer" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }} />
                        ))}
                    </div>
                </>
            ) : hasFetchedSuccess && ideas.length > 0 ? (
                <>
                    <div ref={gridRef} className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                        {ideas.map((idea: any) => (
                            <IdeaCard key={idea._id} idea={idea} />
                        ))}
                    </div>
                    <div className="lg:hidden">
                        <TinderStack ideas={ideas as any} />
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-theme-primary font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-theme-secondary font-medium px-2">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    disabled={page >= pagination.pages}
                                    className="px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-theme-primary font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    Next
                                </button>
                            </div>
                            <p className="text-xs text-theme-muted">
                                {pagination.total} idea{pagination.total !== 1 ? "s" : ""} total
                            </p>
                        </div>
                    )}
                </>
            ) : hasFetchedSuccess && ideas.length === 0 ? (
                <div className="py-24 sm:py-32 text-center space-y-4 glass-card rounded-3xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-theme-primary">No ideas found</h2>
                        <p className="text-theme-secondary text-sm">Try adjusting your search or filters.</p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm"
                        >
                            Be the first to post
                        </button>
                    )}
                </div>
            ) : !loading && !hasFetchedSuccess ? (
                <div className="py-24 sm:py-32 text-center space-y-4 glass-card rounded-3xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-theme-secondary text-sm">Unable to load ideas.</p>
                    <button
                        onClick={() => fetchIdeas(1)}
                        className="mt-4 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500"
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Launch a New Idea"
            >
                <CreateIdeaForm onSuccessAction={() => {
                    setIsCreateModalOpen(false);
                    setPage(1);
                    fetchIdeas(1);
                }} />
            </Modal>
        </div>
    );
}
