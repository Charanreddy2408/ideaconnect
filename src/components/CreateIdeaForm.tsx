"use client";

import { useState } from "react";

export default function CreateIdeaForm({ onSuccessAction }: { onSuccessAction: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        summary: "",
        problem: "",
        targetAudience: "",
        revenueModel: "",
        category: "",
        budget: "",
        requiredSkills: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/ideas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(s => s),
                }),
            });

            if (res.ok) {
                onSuccessAction();
            } else {
                const data = await res.json();
                setError(data.message || "Failed to create idea");
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
                    <input type="text" required className="input-field text-sm" placeholder="e.g. IdeaConnect" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Category</label>
                    <input type="text" required className="input-field text-sm" placeholder="e.g. Social, Fintech" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">One-Line Summary</label>
                <input type="text" required className="input-field text-sm" placeholder="Capture the essence in 50-100 characters" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">What problem are you solving?</label>
                <textarea required rows={3} className="input-field text-sm resize-none" placeholder="Describe the pain point clearly..." value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Target Audience</label>
                    <input type="text" required className="input-field text-sm" placeholder="e.g. Students, HR Managers" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Revenue Model</label>
                    <input type="text" required className="input-field text-sm" placeholder="e.g. Subscription, Freemium" value={form.revenueModel} onChange={(e) => setForm({ ...form, revenueModel: e.target.value })} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Budget/Stage (INR)</label>
                    <input type="text" className="input-field text-sm" placeholder="e.g. ₹10L - ₹50L" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Skills Needed (comma separated)</label>
                    <input type="text" className="input-field text-sm" placeholder="e.g. React, Python, Marketing" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? "Launching..." : "Launch Idea 🚀"}
            </button>
        </form>
    );
}
