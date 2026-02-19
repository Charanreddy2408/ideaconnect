"use client";

/** Compact AI metrics for idea cards (View more). */

export interface AiReportForCard {
    problemClarity: number;
    audienceScore: number;
    monetizationScore: number;
    innovationScore: number;
    feasibilityScore: number;
    scalabilityScore: number;
    validationReadiness: number;
    competitionRisk: "Low" | "Medium" | "High";
}

interface IdeaCardAiMetricsProps {
    aiReport: AiReportForCard | null | undefined;
    className?: string;
}

const SCORE_LABELS: { key: keyof AiReportForCard; label: string }[] = [
    { key: "problemClarity", label: "Clarity" },
    { key: "audienceScore", label: "Audience" },
    { key: "monetizationScore", label: "Monetization" },
    { key: "innovationScore", label: "Innovation" },
    { key: "feasibilityScore", label: "Feasibility" },
    { key: "scalabilityScore", label: "Scale" },
    { key: "validationReadiness", label: "Validation" },
];

export default function IdeaCardAiMetrics({ aiReport, className = "" }: IdeaCardAiMetricsProps) {
    if (!aiReport) return null;

    return (
        <div className={`rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 sm:p-4 ${className}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-[0.2em]">AI evaluation</span>
                <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                        aiReport.competitionRisk === "Low"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : aiReport.competitionRisk === "Medium"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-red-500/15 text-red-400"
                    }`}
                >
                    Risk: {aiReport.competitionRisk}
                </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                {SCORE_LABELS.map(({ key, label }) => {
                    const value = aiReport[key];
                    if (typeof value !== "number") return null;
                    const v = Math.min(100, Math.max(0, value));
                    return (
                        <div key={key} className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-theme-secondary">{label}</span>
                                <span className="text-xs font-bold text-theme-primary tabular-nums shrink-0">{v}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                    style={{ width: `${v}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
