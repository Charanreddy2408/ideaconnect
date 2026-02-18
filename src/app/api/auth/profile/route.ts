import { NextResponse } from "next/server";
import { connectDB } from "@lib/db";
import User from "../../../../models/usermodel";
import { getAuthUserId } from "@lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim().optional(),
    bio: z.string().max(500).optional(),
    skills: z.array(z.string().trim()).optional(),
    interests: z.array(z.string().trim()).optional(),
});

export async function GET() {
    try {
        await connectDB();
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = updateProfileSchema.safeParse(body);

        if (!result.success) {
            const message = result.error.issues[0]?.message ?? "Invalid data";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updates = result.data;
        if (updates.name !== undefined) user.name = updates.name;
        if (updates.bio !== undefined) user.bio = updates.bio;
        if (updates.skills !== undefined) user.skills = updates.skills;
        if (updates.interests !== undefined) user.interests = updates.interests;

        await user.save();

        const updated = await User.findById(userId).select("-password");
        return NextResponse.json({ user: updated }, { status: 200 });
    } catch (error) {
        console.error("Profile PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}