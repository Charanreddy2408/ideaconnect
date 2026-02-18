import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { getAuthUserId } from "@/lib/auth";
import { z } from "zod";
import Idea from "@/models/Idea";

const commentSchema = z.object({
    comment: z.string(),
    parentCommentId: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id: ideaId } = await params;
        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = commentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: "Invalid comment data" },
                { status: 400 }
            );
        }

        const { comment, parentCommentId } = result.data;

        const ideaExists = await Idea.exists({ _id: ideaId });

        if (!ideaExists) {
            return NextResponse.json(
                { message: "Idea not found" },
                { status: 404 }
            );
        }

        let validatedParentId = null;

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);

            if (!parentComment) {
                return NextResponse.json(
                    { message: "Parent comment not found" },
                    { status: 404 }
                );
            }

            if (parentComment.ideaId.toString() !== ideaId) {
                return NextResponse.json(
                    { message: "Parent comment does not belong to this idea" },
                    { status: 400 }
                );
            }

            // Enforce only 1-level nesting (replies cannot have replies)
            if (parentComment.parentCommentId) {
                return NextResponse.json(
                    { message: "Cannot reply to a sub-comment. Only 1-level nesting allowed." },
                    { status: 400 }
                );
            }

            validatedParentId = parentCommentId;
        }

        const newComment = await Comment.create({
            userId,
            ideaId,
            comment,
            parentCommentId: validatedParentId
        });

        await Idea.findByIdAndUpdate(ideaId, { $inc: { commentCount: 1 } });

        return NextResponse.json(
            {
                message: "Comment added",
                comment: newComment,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("COMMENT ERROR DETAILS:", {
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
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id: ideaId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // 1. Fetch main comments (parentCommentId = null) with pagination
        const mainComments = await Comment.find({
            ideaId: ideaId,
            parentCommentId: null
        })
            .populate("userId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // 2. Fetch replies for these main comments separately
        const mainCommentIds = mainComments.map((c: any) => c._id);
        const replies = await Comment.find({
            parentCommentId: { $in: mainCommentIds }
        })
            .populate("userId", "name")
            .sort({ createdAt: 1 }) // Replies usually in chronological order
            .lean();

        // 3. Attach replies to each main comment
        const commentsWithReplies = mainComments.map((parent: any) => ({
            ...parent,
            replies: replies.filter((reply: any) =>
                reply.parentCommentId && reply.parentCommentId.toString() === parent._id.toString()
            )
        }));

        const totalMainComments = await Comment.countDocuments({
            ideaId: ideaId,
            parentCommentId: null
        });

        return NextResponse.json(
            {
                message: "Comments fetched successfully",
                comments: commentsWithReplies,
                pagination: {
                    total: totalMainComments,
                    page,
                    limit,
                    pages: Math.ceil(totalMainComments / limit)
                }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("COMMENT ERROR DETAILS:", {
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