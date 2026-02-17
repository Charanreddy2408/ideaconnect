"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface VoteButtonsProps {
    ideaId: string;
    initialScore: number;
    initialStatus: number | null;
    layout?: "vertical" | "horizontal";
    compact?: boolean;
}

export default function VoteButtons({ ideaId, initialScore, initialStatus, layout = "vertical", compact = false }: VoteButtonsProps) {
    const { user } = useAuth();
    const [score, setScore] = useState(initialScore);
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleVote = async (voteType: 1 | -1) => {
        if (!user || loading) return;
        setLoading(true);

        // Optimistic: if same vote, toggle off
        const newStatus = status === voteType ? null : voteType;

        try {
            const res = await fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ideaId, voteType }),
            });

            if (res.ok) {
                const data = await res.json();
                setScore(data.voteScore);
                setStatus(newStatus);
            }
        } catch (error) {
            console.error("Vote failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const isHorizontal = layout === "horizontal";
    const btnSize = compact ? "p-1.5" : "p-2.5";
    const iconSize = compact ? "w-4 h-4" : "w-5 h-5";
    const scoreSize = compact ? "text-sm" : "text-lg";

    return (
        <div className={`flex items-center gap-1 ${isHorizontal ? "flex-row" : "flex-col"}`}>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1); }}
                disabled={!user}
                className={`${btnSize} rounded-xl transition-all ${
                    status === 1 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "hover:bg-[var(--input-bg)] text-theme-muted hover:text-emerald-400 border border-transparent"
                }`}
            >
                <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4L4 12H9V20H15V12H20L12 4Z" />
                </svg>
            </button>
            
            <span className={`${scoreSize} font-black ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {score}
            </span>

            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(-1); }}
                disabled={!user}
                className={`${btnSize} rounded-xl transition-all ${
                    status === -1 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "hover:bg-[var(--input-bg)] text-theme-muted hover:text-red-400 border border-transparent"
                }`}
            >
                <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 20L20 12H15V4H9V12H4L12 20Z" />
                </svg>
            </button>
        </div>
    );
}
