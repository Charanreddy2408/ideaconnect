import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthUserId } from "@/lib/auth";

/**
 * GET — Fetch paginated message history for a conversation.
 */
export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        await connectDB();
        const { conversationId } = await params;

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is a participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });

        if (!conversation) {
            return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "30");
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversationId })
            .populate("senderId", "name")
            .sort({ createdAt: -1 }) // Newest first for pagination
            .skip(skip)
            .limit(limit)
            .lean();

        const totalMessages = await Message.countDocuments({ conversationId });

        return NextResponse.json({
            message: "Messages fetched",
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                total: totalMessages,
                page,
                limit,
                pages: Math.ceil(totalMessages / limit),
            },
        }, { status: 200 });

    } catch (error: any) {
        console.error("GET MESSAGES ERROR:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
