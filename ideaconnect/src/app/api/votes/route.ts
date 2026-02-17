import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Vote from "@/models/Vote";
import Idea from "@/models/Idea";
import { getAuthUserId } from "@/lib/auth";
import { z } from "zod";

const voteSchema = z.object({
    ideaId: z.string(),
    voteType: z.number().refine(val => val === 1 || val === -1),
});

export async function POST(req: Request) {
    try {
        await connectDB();

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = voteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: "Invalid vote data" },
                { status: 400 }
            );
        }

        const { ideaId, voteType } = result.data;

        if (!(await Idea.exists({ _id: ideaId }))) {
            return NextResponse.json(
                { message: "Idea not found" },
                { status: 404 }
            );
        }

        const existingVote = await Vote.findOne({ userId, ideaId });

        let updateInc = {};
        if (!existingVote) {
            // 🟢 First vote
            await Vote.create({ userId, ideaId, voteType });
            updateInc = voteType === 1
                ? { upvotes: 1, voteScore: 1 }
                : { downvotes: 1, voteScore: -1 };
        } else if (existingVote.voteType === voteType) {
            // 🔄 Remove vote (toggle off)
            await existingVote.deleteOne();
            updateInc = voteType === 1
                ? { upvotes: -1, voteScore: -1 }
                : { downvotes: -1, voteScore: 1 };
        } else {
            // 🔁 Switch vote
            existingVote.voteType = voteType;
            await existingVote.save();
            updateInc = voteType === 1
                ? { upvotes: 1, downvotes: -1, voteScore: 2 }
                : { upvotes: -1, downvotes: 1, voteScore: -2 };
        }

        // Perform the atomic update and get the new document back
        const updatedIdea = await Idea.findByIdAndUpdate(
            ideaId,
            { $inc: updateInc },
            { new: true, runValidators: false, lean: true } // Get the updated doc
        );

        if (!updatedIdea) {
            return NextResponse.json({ message: "Idea not found" }, { status: 404 });
        }

        // Since we are lean, we need to cast or access directly
        const upvotes = (updatedIdea as any).upvotes || 0;
        const downvotes = (updatedIdea as any).downvotes || 0;
        const voteScore = (updatedIdea as any).voteScore || 0;

        return NextResponse.json(
            {
                message: "Vote updated",
                upvotes: upvotes,
                downvotes: downvotes,
                voteScore: voteScore,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("VOTE ERROR DETAILS:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
