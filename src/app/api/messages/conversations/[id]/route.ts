import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthUserId } from "@/lib/auth";

/**
 * DELETE — Delete a conversation and all its messages.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is a participant in this conversation
        const conversation = await Conversation.findOne({
            _id: id,
            participants: userId,
        });

        if (!conversation) {
            return NextResponse.json({ message: "Conversation not found or access denied" }, { status: 404 });
        }

        // Delete all messages in the conversation
        await Message.deleteMany({ conversationId: id });

        // Delete the conversation itself
        await conversation.deleteOne();

        return NextResponse.json({
            message: "Conversation and all associated messages deleted successfully",
        }, { status: 200 });

    } catch (error: any) {
        console.error("DELETE CONVERSATION ERROR:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
