import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Idea from "@/models/Idea";
import Vote from "@/models/Vote";
import { getAuthUserId } from "@/lib/auth";
import { calculateValidationScore } from "@/utils/validationScore";
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

        const validationScore = calculateValidationScore(data);

        const newIdea = await Idea.create({
            ...data,
            requiredSkills: data.requiredSkills || [],
            validationScore,
            userId,
        });

        return NextResponse.json(newIdea, { status: 201 });

    } catch (error) {
        console.error("CREATE IDEA ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/* ---------------- GET ALL IDEAS ---------------- */

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const sort = searchParams.get("sort");
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        const query: any = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        let ideasQuery = Idea.find(query).populate("userId", "name");

        if (sort === "recent") {
            ideasQuery = ideasQuery.sort({ createdAt: -1 });
        } else if (sort === "popular") {
            ideasQuery = ideasQuery.sort({ voteScore: -1 });
        } else if (sort === "validation") {
            ideasQuery = ideasQuery.sort({ validationScore: -1 });
        }

        const ideas = await ideasQuery;

        // If user is authenticated, include their vote status
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

            return NextResponse.json(ideasWithVotes, { status: 200 });
        }

        // If not authenticated, add null userVote
        const ideasWithoutVotes = ideas.map((idea: any) => ({
            ...idea.toObject(),
            userVote: null
        }));

        return NextResponse.json(ideasWithoutVotes, { status: 200 });

    } catch (error) {
        console.error("GET IDEAS ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
