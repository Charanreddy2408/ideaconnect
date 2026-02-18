import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/usermodel";
import { getAuthUserId } from "@/lib/auth";

/**
 * GET — Search for users by name, skills, or interests.
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q");

        if (!q) {
            return NextResponse.json({ message: "Search query required" }, { status: 400 });
        }

        // Search users excluding the current user
        const users = await User.find({
            $text: { $search: q },
            _id: { $ne: userId }
        })
            .select("name email bio skills interests")
            .limit(20)
            .lean();

        return NextResponse.json({ users }, { status: 200 });

    } catch (error: any) {
        console.error("SEARCH USERS ERROR:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
