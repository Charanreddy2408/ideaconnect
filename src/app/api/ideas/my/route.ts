import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Idea from "@/models/Idea";
import { getAuthUserId } from "@/lib/auth";

/**
 * GET /api/ideas/my — Returns the logged-in user's ideas (including aiReport).
 */
export async function GET() {
    try {
        await connectDB();

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const ideas = await Idea.find({ userId, aiReport: { $exists: true } })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(ideas, { status: 200 });
    } catch (error) {
        console.error("GET MY IDEAS ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
