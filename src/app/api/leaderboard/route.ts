import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Idea from "@/models/Idea";
import "@/models/usermodel";

const LIMIT = 10;
const PERIODS = ["daily", "weekly", "monthly"] as const;

function getSinceDate(period: string): Date {
    const now = new Date();
    const since = new Date(now);

    switch (period) {
        case "daily": {
            since.setUTCHours(0, 0, 0, 0);
            return since;
        }
        case "weekly": {
            since.setDate(since.getDate() - 7);
            return since;
        }
        case "monthly": {
            since.setDate(since.getDate() - 30);
            return since;
        }
        default:
            since.setDate(since.getDate() - 30);
            return since;
    }
}

/**
 * GET /api/leaderboard?period=daily|weekly|monthly
 * Public — no auth. Returns ideas ranked by upvotes in the given period.
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const period = searchParams.get("period") || "weekly";
        const validPeriod = PERIODS.includes(period as any) ? period : "weekly";

        const since = getSinceDate(validPeriod);

        const ideas = await Idea.find({
            createdAt: { $gte: since },
            aiReport: { $exists: true },
        })
            .sort({ upvotes: -1, createdAt: -1 })
            .limit(LIMIT)
            .populate("userId", "name")
            .lean();

        const list = ideas.map((idea: any, index: number) => ({
            rank: index + 1,
            _id: idea._id,
            title: idea.title,
            summary: idea.summary,
            category: idea.category,
            upvotes: idea.upvotes ?? 0,
            downvotes: idea.downvotes ?? 0,
            voteScore: idea.voteScore ?? 0,
            commentCount: idea.commentCount ?? 0,
            createdAt: idea.createdAt,
            userId: idea.userId ? { _id: idea.userId._id, name: idea.userId.name } : null,
        }));

        return NextResponse.json({
            period: validPeriod,
            since: since.toISOString(),
            leaderboard: list,
        });
    } catch (error) {
        console.error("LEADERBOARD ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
