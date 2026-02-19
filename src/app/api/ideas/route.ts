import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Idea from "@/models/Idea";
import Vote from "@/models/Vote";
import "@/models/usermodel"; // register User schema for populate("userId")
import { getAuthUserId } from "@/lib/auth";
import { generateAIReport } from "@/lib/aiReport";
import { calculateSimilarity } from "@/utils/similarity";
import { z } from "zod";

/* ---------------- CREATE IDEA ---------------- */
const ideaSchema = z.object({
    title: z.string().min(5),
    summary: z.string().min(20),
    problem: z.string().min(20),
    targetAudience: z.string().min(10),
    revenueModel: z.string().min(10),
    requiredSkills: z.array(z.string()).optional(),
    budget: z.string().optional(),
    category: z.string().min(3),
});

export async function POST(req: Request) {
    try {
        await connectDB();

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = ideaSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = result.data;

        // Anti-clone
        const existingIdeas = await Idea.find();
        for (const idea of existingIdeas) {
            const similarity = calculateSimilarity(data.title, idea.title);
            if (similarity > 0.6) {
                return NextResponse.json(
                    { message: "Similar idea already exists" },
                    { status: 400 }
                );
            }
        }

        let aiReport;
        try {
            aiReport = await generateAIReport({
                title: data.title,
                summary: data.summary,
                problem: data.problem,
                targetAudience: data.targetAudience,
                revenueModel: data.revenueModel,
                requiredSkills: data.requiredSkills || [],
                category: data.category,
                budget: data.budget,
            });
        } catch (aiError) {
            const message = aiError instanceof Error ? aiError.message : "AI evaluation failed";
            console.error("AI report error:", aiError);
            return NextResponse.json(
                { message: "AI evaluation failed. Idea not saved.", error: message },
                { status: 502 }
            );
        }

        const newIdea = await Idea.create({
            ...data,
            requiredSkills: data.requiredSkills || [],
            userId,
            aiReport,
        });

        return NextResponse.json(newIdea, { status: 201 });

    } catch (error) {
        console.error("CREATE IDEA ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;

/* ---------------- GET ALL IDEAS ---------------- */

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const sort = searchParams.get("sort");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const page = Math.max(1, parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10));
        const limit = Math.min(30, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)));

        const query: any = { aiReport: { $exists: true } };

        if (category) {
            query.category = category;
        }

        if (search && search.trim()) {
            const trimmed = search.trim();
            query.$or = [
                { title: { $regex: trimmed, $options: "i" } },
                { summary: { $regex: trimmed, $options: "i" } },
            ];
        }

        const baseQuery = Idea.find(query);
        const total = await Idea.countDocuments(query);
        const pages = Math.max(1, Math.ceil(total / limit));
        const skip = (page - 1) * limit;

        let ideasQuery = baseQuery
            .populate("userId", "name")
            .skip(skip)
            .limit(limit);

        if (sort === "recent") {
            ideasQuery = ideasQuery.sort({ createdAt: -1 });
        } else if (sort === "popular") {
            ideasQuery = ideasQuery.sort({ voteScore: -1 });
        } else {
            ideasQuery = ideasQuery.sort({ createdAt: -1 });
        }

        const ideas = await ideasQuery;

        const userId = await getAuthUserId();
        if (userId) {
            const ideaIds = ideas.map((idea: any) => idea._id);
            const userVotes = await Vote.find({
                userId,
                ideaId: { $in: ideaIds }
            }).lean();

            const voteMap = new Map(
                userVotes.map((vote: any) => [vote.ideaId.toString(), vote.voteType])
            );

            const ideasWithVotes = ideas.map((idea: any) => ({
                ...idea.toObject(),
                userVote: voteMap.get(idea._id.toString()) || null
            }));

            return NextResponse.json({
                ideas: ideasWithVotes,
                pagination: { page, limit, total, pages },
            }, { status: 200 });
        }

        const ideasWithoutVotes = ideas.map((idea: any) => ({
            ...idea.toObject(),
            userVote: null
        }));

        return NextResponse.json({
            ideas: ideasWithoutVotes,
            pagination: { page, limit, total, pages },
        }, { status: 200 });

    } catch (error) {
        console.error("GET IDEAS ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
