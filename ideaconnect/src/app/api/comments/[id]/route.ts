import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Idea from "@/models/Idea";
import { getAuthUserId } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            return NextResponse.json({ message: "Comment not found" }, { status: 404 });
        }

        if (comment.userId.toString() !== userId) {
            return NextResponse.json({ message: "Forbidden: You can only delete your own comments" }, { status: 403 });
        }

        const ideaId = comment.ideaId;
        let deletedCount = 0;

        if (!comment.parentCommentId) {
            // It's a parent comment - delete it and all its replies
            const replies = await Comment.find({ parentCommentId: id });
            const replyIds = replies.map(r => r._id);

            await Comment.deleteMany({ _id: { $in: [id, ...replyIds] } });
            deletedCount = 1 + replyIds.length;
        } else {
            // It's a reply - just delete itself
            await Comment.findByIdAndDelete(id);
            deletedCount = 1;
        }

        // Decrement commentCount on the Idea
        await Idea.findByIdAndUpdate(ideaId, { $inc: { commentCount: -deletedCount } });

        return NextResponse.json(
            {
                message: comment.parentCommentId ? "Reply deleted" : "Comment and replies deleted",
                deletedCount
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("DELETE COMMENT ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
