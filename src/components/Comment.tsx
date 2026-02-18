"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface CommentProps {
    comment: {
        _id: string;
        comment: string;
        createdAt: string;
        userId?: {
            _id: string;
            name: string;
        };
        replies?: any[];
    };
    ideaId: string;
    onRefreshAction: () => void;
    depth?: number;
}

export default function Comment({ comment, ideaId, onRefreshAction, depth = 0 }: CommentProps) {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/ideas/${ideaId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    comment: replyContent,
                    parentCommentId: comment._id
                }),
            });
            if (res.ok) {
                setReplyContent("");
                setIsReplying(false);
                onRefreshAction();
            }
        } catch (error) {
            console.error("Reply failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure? All replies will also be deleted.")) return;
        try {
            const res = await fetch(`/api/comments/${comment._id}`, { method: "DELETE" });
            if (res.ok) onRefreshAction();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const isOwner = user?.id === comment.userId?._id;

    return (
        <div className={`mt-4 space-y-3`}>
            <div className="flex gap-3 group">
                {/* Thread line */}
                <div className="w-0.5 flex-shrink-0 rounded-full transition-colors" style={{ background: 'var(--border-color)' }} />

                <div className="flex-1 space-y-3 p-4 sm:p-5 glass-card rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] flex items-center justify-center font-bold text-xs text-theme-primary">
                                {comment.userId?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                                <span className="text-xs font-bold text-theme-primary">{comment.userId?.name}</span>
                                <span className="text-[9px] text-theme-muted uppercase tracking-widest font-bold ml-2">
                                    {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-theme-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <p className="text-sm text-theme-secondary leading-relaxed">
                        {comment.comment}
                    </p>

                    {user && (
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            {isReplying ? "Cancel" : "Reply"}
                        </button>
                    )}

                    {isReplying && (
                        <div className="space-y-3 pt-3 border-t border-[var(--border-color)] animate-fade-in-up">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="input-field h-20 resize-none text-sm"
                                rows={2}
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleReply}
                                    disabled={loading || !replyContent.trim()}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-[10px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                                >
                                    {loading ? "Posting..." : "Post Reply"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 sm:ml-8 space-y-3">
                    {comment.replies.map((reply: any) => (
                        <Comment key={reply._id} comment={reply} ideaId={ideaId} onRefreshAction={onRefreshAction} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
