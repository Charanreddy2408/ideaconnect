"use client";

import { useState } from "react";

export default function EditIdeaForm({ idea, onSuccessAction }: { idea: any, onSuccessAction: (updated: any) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: idea.title,
        summary: idea.summary,
        problem: idea.problem,
        targetAudience: idea.targetAudience,
        revenueModel: idea.revenueModel,
        category: idea.category,
        budget: idea.budget || "",
        requiredSkills: idea.requiredSkills.join(", "),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/ideas/${idea._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    requiredSkills: form.requiredSkills.split(",").map((s: string) => s.trim()).filter((s: string) => s),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                onSuccessAction(data.idea);
            } else {
                const data = await res.json();
                setError(data.message || "Failed to update idea");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Project Name</label>
                    <input type="text" required className="input-field text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Category</label>
                    <input type="text" required className="input-field text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">One-Line Summary</label>
                <input type="text" required className="input-field text-sm" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Problem Statement</label>
                <textarea required rows={3} className="input-field text-sm resize-none" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? "Updating..." : "Save Changes"}
            </button>
        </form>
    );
}
