"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type ProfileUser = { name?: string; email?: string; bio?: string; skills?: string[]; interests?: string[] };

export default function ProfilePage() {
    const { user, checkAuth } = useAuth();
    const router = useRouter();
    const pageRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState<ProfileUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editSkills, setEditSkills] = useState<string[]>([]);
    const [editInterests, setEditInterests] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [newInterest, setNewInterest] = useState("");
    const [myIdeas, setMyIdeas] = useState<any[]>([]);
    const [myIdeasLoading, setMyIdeasLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/auth/profile");
            if (res.ok) {
                const data = await res.json();
                setProfileData(data.user);
                setEditName(data.user.name ?? "");
                setEditBio(data.user.bio ?? "");
                setEditSkills(Array.isArray(data.user.skills) ? [...data.user.skills] : []);
                setEditInterests(Array.isArray(data.user.interests) ? [...data.user.interests] : []);
            }
        } catch (error) {
            console.error("Profile fetch failed:", error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (targetId: string) => {
        try {
            const res = await fetch("/api/messages/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: targetId }),
            });
            if (res.ok) {
                router.push("/messages");
            }
        } catch (error) {
            console.error("Chat start failed:", error);
        }
    };

    const handleSaveProfile = async () => {
        setEditError("");
        if (!editName.trim()) {
            setEditError("Name is required.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editName.trim(),
                    bio: editBio.trim() || undefined,
                    skills: editSkills.length ? editSkills : undefined,
                    interests: editInterests.length ? editInterests : undefined,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchProfile();
                await checkAuth();
                setIsEditing(false);
            } else {
                setEditError(data.error || "Failed to update profile.");
            }
        } catch (error) {
            setEditError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditName(profileData?.name ?? user?.name ?? "");
        setEditBio(profileData?.bio ?? "");
        setEditSkills(Array.isArray(profileData?.skills) ? [...profileData.skills] : []);
        setEditInterests(Array.isArray(profileData?.interests) ? [...profileData.interests] : []);
        setNewSkill("");
        setNewInterest("");
        setEditError("");
        setIsEditing(false);
    };

    const addSkill = () => {
        const v = newSkill.trim();
        if (v && !editSkills.includes(v)) setEditSkills((s) => [...s, v]);
        setNewSkill("");
    };
    const removeSkill = (skill: string) => setEditSkills((s) => s.filter((x) => x !== skill));
    const addInterest = () => {
        const v = newInterest.trim();
        if (v && !editInterests.includes(v)) setEditInterests((i) => [...i, v]);
        setNewInterest("");
    };
    const removeInterest = (interest: string) => setEditInterests((i) => i.filter((x) => x !== interest));

    const fetchMyIdeas = async () => {
        setMyIdeasLoading(true);
        try {
            const res = await fetch("/api/ideas/my");
            if (res.ok) {
                const data = await res.json();
                setMyIdeas(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Fetch my ideas failed:", error);
        } finally {
            setMyIdeasLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchMyIdeas();
        }
    }, [user]);

    // Entrance (no tilt) + smooth scroll: horizontal drift & lag parallax (different from idea detail)
    useEffect(() => {
        if (!pageRef.current || !user) return;
        const ctx = gsap.context(() => {
            gsap.from(".profile-card", { y: 36, opacity: 0, duration: 0.8, ease: "power2.out" });

            // Profile card: "lag" parallax — moves down as you scroll past (opposite of idea detail hero)
            gsap.to(".profile-card", {
                y: 28,
                ease: "none",
                scrollTrigger: {
                    trigger: ".profile-card",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.2,
                },
            });

            // Discovery section: horizontal drift (no reveal — always visible)
            gsap.fromTo(
                ".discovery-section",
                { x: -28 },
                {
                    x: 12,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".discovery-section",
                        start: "top bottom",
                        end: "top 35%",
                        scrub: 1.2,
                    },
                }
            );

            // Result cards: horizontal drift per card (staggered by position, no reveal)
            gsap.utils.toArray<HTMLElement>(".discovery-result-card").forEach((el, i) => {
                const sign = i % 2 === 0 ? 1 : -1;
                gsap.fromTo(
                    el,
                    { x: sign * 24 },
                    {
                        x: sign * -8,
                        ease: "none",
                        scrollTrigger: {
                            trigger: el,
                            start: "top bottom",
                            end: "top 40%",
                            scrub: 1.1,
                        },
                    }
                );
            });
        }, pageRef);
        return () => ctx.revert();
    }, [user]);

    if (!user) {
        return (
            <div className="py-32 text-center animate-fade-in-up px-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <p className="text-theme-muted mb-4 font-bold uppercase tracking-widest text-xs">Access Restricted</p>
                <h2 className="text-2xl sm:text-3xl font-black text-theme-primary mb-8">Sign in to join the network</h2>
                <button 
                    onClick={() => router.push("/login")} 
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="profile-page px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto space-y-12 sm:space-y-16">
            {/* Profile Card */}
            <div className="profile-card glass-card p-6 sm:p-10 lg:p-16 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-60 h-60 rounded-full -mr-20 -mt-20 animate-float-slow" style={{ background: 'var(--glow-primary)', filter: 'blur(80px)' }} />
                <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-500 p-0.5 shadow-2xl transition-transform duration-700 group-hover:rotate-3 shrink-0">
                        <div className="w-full h-full rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-black text-theme-primary" style={{ background: 'var(--bg)' }}>
                            {(isEditing ? editName : user.name).charAt(0) || "?"}
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                        {!isEditing ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-3">
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-theme-primary tracking-tight">{user.name}</h1>
                                        <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Trusted Member
                                            </span>
                                            <span className="flex items-center gap-1.5 text-sm text-theme-muted font-medium">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--surface-hover)] border border-[var(--input-border)] text-theme-primary font-bold text-sm transition-all hover:border-violet-500/30 shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit profile
                                    </button>
                                </div>
                                {profileData?.bio && (
                                    <p className="text-theme-secondary text-sm sm:text-base max-w-2xl">{profileData.bio}</p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[var(--border-color)]">
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-theme-muted uppercase tracking-widest justify-center md:justify-start">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            Expertise
                                        </h3>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            {(profileData?.skills && profileData.skills.length > 0) ? profileData.skills.map((s: string) => (
                                                <span key={s} className="px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[10px] font-bold text-theme-primary uppercase tracking-widest">
                                                    {s}
                                                </span>
                                            )) : <span className="text-theme-muted italic text-xs">No skills listed</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="flex items-center gap-2 text-xs font-bold text-theme-muted uppercase tracking-widest justify-center md:justify-start">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Focus
                                        </h3>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            {(profileData?.interests && profileData.interests.length > 0) ? profileData.interests.map((i: string) => (
                                                <span key={i} className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                                                    {i}
                                                </span>
                                            )) : <span className="text-theme-muted italic text-xs">No interests listed</span>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4 text-left">
                                    <h2 className="text-xl font-bold text-theme-primary">Edit profile</h2>
                                    {editError && (
                                        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            {editError}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-1.5">Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="input-field w-full"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-1.5">Bio</label>
                                        <textarea
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            className="input-field w-full min-h-[100px] resize-y"
                                            placeholder="Short bio (optional)"
                                            maxLength={500}
                                        />
                                        <p className="text-[10px] text-theme-muted mt-1">{editBio.length}/500</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-1.5">Skills</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {editSkills.map((s) => (
                                                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-bold text-theme-primary">
                                                    {s}
                                                    <button type="button" onClick={() => removeSkill(s)} className="text-theme-muted hover:text-red-400 transition-colors" aria-label="Remove">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                                className="input-field flex-1"
                                                placeholder="Add a skill..."
                                            />
                                            <button type="button" onClick={addSkill} className="px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 font-bold text-sm hover:bg-violet-500/30 transition-all">
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-1.5">Interests</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {editInterests.map((i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400">
                                                    {i}
                                                    <button type="button" onClick={() => removeInterest(i)} className="text-violet-400/70 hover:text-red-400 transition-colors" aria-label="Remove">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newInterest}
                                                onChange={(e) => setNewInterest(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                                                className="input-field flex-1"
                                                placeholder="Add an interest..."
                                            />
                                            <button type="button" onClick={addInterest} className="px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 font-bold text-sm hover:bg-violet-500/30 transition-all">
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border-color)]">
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                Save changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="px-6 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-theme-primary font-bold text-sm hover:bg-[var(--surface-hover)] transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* My Posted Ideas */}
            <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight">My Ideas</h2>
                    <Link
                        href="/ideas"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold text-sm hover:bg-violet-500/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        Browse all
                    </Link>
                </div>
                {myIdeasLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 rounded-2xl animate-shimmer" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }} />
                        ))}
                    </div>
                ) : myIdeas.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--card-border)] p-10 sm:p-12 text-center" style={{ background: "var(--card-bg)" }}>
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <p className="text-theme-secondary font-medium mb-4">You haven&apos;t posted any ideas yet.</p>
                        <Link
                            href="/ideas"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all"
                        >
                            Post your first idea
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {myIdeas.map((idea: any) => (
                            <Link
                                key={idea._id}
                                href={`/ideas/${idea._id}`}
                                className="block rounded-2xl border border-[var(--card-border)] p-5 sm:p-6 hover:border-violet-500/30 transition-all group overflow-hidden"
                                style={{ background: "var(--card-bg)" }}
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                                        {idea.category || "Idea"}
                                    </span>
                                    <span className="text-[10px] text-theme-muted font-medium">
                                        {idea.voteScore > 0 ? "+" : ""}{idea.voteScore} pts
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-theme-primary group-hover:text-violet-400 transition-colors line-clamp-2 mb-2">
                                    {idea.title}
                                </h3>
                                <p className="text-sm text-theme-secondary line-clamp-2">{idea.summary}</p>
                                <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-violet-400 group-hover:gap-2 transition-all">
                                    View idea
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Discovery Section */}
            <div className="discovery-section space-y-8 sm:space-y-12">
                <div className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Discovery
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-theme-primary tracking-tight">
                        Expand Your <span className="text-gradient">Circle</span>
                    </h2>
                    <p className="text-theme-secondary text-sm sm:text-base max-w-2xl mx-auto">
                        Search the global database of elite founders and builders ready to collaborate.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto relative group">
                    <input
                        type="text"
                        placeholder="Search skills, industry, or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="input-field pl-12 pr-28 py-5 text-base rounded-2xl"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted group-focus-within:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <button 
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all active:scale-95"
                    >
                        Search
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl animate-shimmer" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }} />)}
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((u: any) => (
                            <div key={u._id} className="discovery-result-card glass-card p-8 rounded-3xl space-y-6 flex flex-col justify-between group h-full">
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center justify-center font-black text-xl text-theme-primary group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-500">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-theme-primary text-lg tracking-tight group-hover:text-violet-500 transition-colors">{u.name}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <p className="text-[9px] text-theme-muted uppercase font-bold tracking-widest">Connectable</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {u.skills.slice(0, 4).map((s: string) => (
                                            <span key={s} className="px-3 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[9px] font-bold text-theme-secondary uppercase tracking-widest">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleStartChat(u._id)}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    Connect
                                </button>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
