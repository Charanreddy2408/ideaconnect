import type { IAIReport, CompetitionRisk } from "@/models/Idea";

const SYSTEM_PROMPT = `You are an AI Startup Intelligence Engine.

Your task is to evaluate startup ideas and generate a structured business intelligence report.

Score each metric from 0-100 realistically. Do not inflate scores.

Metrics:
- problemClarity
- audienceScore
- monetizationScore
- innovationScore
- feasibilityScore
- scalabilityScore
- validationReadiness
- competitionRisk ("Low", "Medium", "High")

Also generate:
- strengths (array)
- risks (array)
- suggestions (array)

Return ONLY valid JSON in this format:

{
  "problemClarity": number,
  "audienceScore": number,
  "monetizationScore": number,
  "innovationScore": number,
  "feasibilityScore": number,
  "scalabilityScore": number,
  "validationReadiness": number,
  "competitionRisk": "Low" | "Medium" | "High",
  "strengths": ["string"],
  "risks": ["string"],
  "suggestions": ["string"]
}`;

function userPrompt(data: {
    title: string;
    summary: string;
    problem: string;
    targetAudience: string;
    revenueModel: string;
    requiredSkills: string[];
    category: string;
}): string {
    return `Evaluate the following startup idea:

Title: ${data.title}
Summary: ${data.summary}
Problem: ${data.problem}
Target Audience: ${data.targetAudience}
Revenue Model: ${data.revenueModel}
Required Skills: ${Array.isArray(data.requiredSkills) ? data.requiredSkills.join(", ") : String(data.requiredSkills)}
Category: ${data.category}`;
}

const SCORE_KEYS = [
    "problemClarity",
    "audienceScore",
    "monetizationScore",
    "innovationScore",
    "feasibilityScore",
    "scalabilityScore",
    "validationReadiness",
] as const;

const VALID_RISK: CompetitionRisk[] = ["Low", "Medium", "High"];

function validateAIReport(raw: unknown): IAIReport {
    if (raw === null || typeof raw !== "object") {
        throw new Error("AI report must be an object");
    }
    const o = raw as Record<string, unknown>;

    for (const key of SCORE_KEYS) {
        const v = o[key];
        if (typeof v !== "number" || v < 0 || v > 100) {
            throw new Error(`Invalid or missing score: ${key} must be a number 0-100`);
        }
    }

    const risk = o.competitionRisk;
    if (typeof risk !== "string" || !VALID_RISK.includes(risk as CompetitionRisk)) {
        throw new Error(`competitionRisk must be one of: ${VALID_RISK.join(", ")}`);
    }

    const arr = (v: unknown, name: string): string[] => {
        if (!Array.isArray(v)) throw new Error(`${name} must be an array`);
        return v.filter((x): x is string => typeof x === "string");
    };

    const report: IAIReport = {
        problemClarity: o.problemClarity as number,
        audienceScore: o.audienceScore as number,
        monetizationScore: o.monetizationScore as number,
        innovationScore: o.innovationScore as number,
        feasibilityScore: o.feasibilityScore as number,
        scalabilityScore: o.scalabilityScore as number,
        validationReadiness: o.validationReadiness as number,
        competitionRisk: risk as CompetitionRisk,
        strengths: arr(o.strengths, "strengths"),
        risks: arr(o.risks, "risks"),
        suggestions: arr(o.suggestions, "suggestions"),
        generatedAt: new Date(),
    };
    return report;
}

export interface IdeaInputForAI {
    title: string;
    summary: string;
    problem: string;
    targetAudience: string;
    revenueModel: string;
    requiredSkills: string[];
    category: string;
    budget?: string;
}

const CEREBRAS_ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";

export async function generateAIReport(data: IdeaInputForAI): Promise<IAIReport> {
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) {
        throw new Error("CEREBRAS_API_KEY must be set");
    }

    const userContent = userPrompt({
        title: data.title,
        summary: data.summary,
        problem: data.problem,
        targetAudience: data.targetAudience,
        revenueModel: data.revenueModel,
        requiredSkills: data.requiredSkills || [],
        category: data.category,
    });

    const res = await fetch(CEREBRAS_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-oss-120b",
            stream: false,
            max_tokens: 32768,
            temperature: 1,
            top_p: 1,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userContent },
            ],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI API error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
        throw new Error("AI response missing content");
    }

    const trimmed = content.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}") + 1;
    const jsonStr = jsonStart >= 0 && jsonEnd > jsonStart ? trimmed.slice(jsonStart, jsonEnd) : trimmed;
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonStr);
    } catch {
        throw new Error("AI response is not valid JSON");
    }

    return validateAIReport(parsed);
}
