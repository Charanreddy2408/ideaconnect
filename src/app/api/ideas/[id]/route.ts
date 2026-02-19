import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Idea from "@/models/Idea";
import Vote from "@/models/Vote";
import { getAuthUserId } from "@/lib/auth";
import { generateAIReport } from "@/lib/aiReport";
import { z } from "zod";

const updateIdeaSchema = z.object({
    title: z.string().min(5).optional(),
    summary: z.string().min(20).optional(),
    problem: z.string().min(20).optional(),
    targetAudience: z.string().min(10).optional(),
    revenueModel: z.string().min(10).optional(),
    requiredSkills: z.array(z.string()).optional(),
    budget: z.string().optional(),
    category: z.string().min(3).optional(),
});

/**
 * GET — Fetch full details for a single idea.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const idea = await Idea.findById(id).populate("userId", "name email");
        if (!idea || !idea.aiReport) {
            return NextResponse.json({ message: "Idea not found" }, { status: 404 });
        }

        // Include user's vote status if authenticated
        const userId = await getAuthUserId();
        let userVote = null;
        if (userId) {
            const vote = await Vote.findOne({ userId, ideaId: id }).lean();
            userVote = vote ? vote.voteType : null;
        }

        const ideaObj = idea.toObject();
        return NextResponse.json({ ...ideaObj, userVote }, { status: 200 });
    } catch (error) {
        console.error("GET SINGLE IDEA ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * PATCH — Update an idea (owner only).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const idea = await Idea.findById(id);
        if (!idea) {
            return NextResponse.json({ message: "Idea not found" }, { status: 404 });
        }

        // Check ownership
        if (idea.userId.toString() !== userId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const result = updateIdeaSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const updates = result.data;
        Object.assign(idea, updates);

        const updatedData = {
            title: idea.title,
            summary: idea.summary,
            problem: idea.problem,
            targetAudience: idea.targetAudience,
            revenueModel: idea.revenueModel,
            requiredSkills: Array.isArray(idea.requiredSkills) ? idea.requiredSkills : [],
            category: idea.category,
            budget: idea.budget,
        };

        let newReport;
        try {
            newReport = await generateAIReport(updatedData);
        } catch (aiError) {
            const message = aiError instanceof Error ? aiError.message : "AI evaluation failed";
            console.error("AI report error on update:", aiError);
            return NextResponse.json(
                { message: "AI report regeneration failed.", error: message },
                { status: 502 }
            );
        }

        idea.aiReport = newReport;
        await idea.save();

        const populated = await Idea.findById(id).populate("userId", "name email");
        return NextResponse.json({ message: "Idea updated successfully", idea: populated }, { status: 200 });

    } catch (error) {
        console.error("PATCH IDEA ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE — Delete an idea (owner only).
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const idea = await Idea.findById(id);
        if (!idea) {
            return NextResponse.json({ message: "Idea not found" }, { status: 404 });
        }

        if (idea.userId.toString() !== userId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await idea.deleteOne();

        return NextResponse.json({ message: "Idea deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("DELETE IDEA ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
