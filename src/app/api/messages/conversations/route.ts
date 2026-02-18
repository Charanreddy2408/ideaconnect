import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/usermodel";
import { getAuthUserId } from "@/lib/auth";
import { z } from "zod";

const createConversationSchema = z.object({
    participantId: z.string(), // The other user's ID
});

/**
 * POST — Start a conversation (or return existing one) between the authenticated user and another user.
 */
export async function POST(req: Request) {
    try {
        await connectDB();

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = createConversationSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const { participantId } = result.data;

        if (participantId === userId) {
            return NextResponse.json({ message: "Cannot start a conversation with yourself" }, { status: 400 });
        }

        // Check if the other user exists
        const otherUser = await User.exists({ _id: participantId });
        if (!otherUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if a conversation already exists between these two users
        const existingConversation = await Conversation.findOne({
            participants: { $all: [userId, participantId], $size: 2 },
        }).populate("participants", "name email");

        if (existingConversation) {
            return NextResponse.json({
                message: "Conversation already exists",
                conversation: existingConversation,
            }, { status: 200 });
        }

        // Create new conversation
        const newConversation = await Conversation.create({
            participants: [userId, participantId],
        });

        const populated = await Conversation.findById(newConversation._id)
            .populate("participants", "name email");

        return NextResponse.json({
            message: "Conversation created",
            conversation: populated,
        }, { status: 201 });

    } catch (error: any) {
        console.error("CREATE CONVERSATION ERROR:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}

/**
 * GET — List all conversations for the authenticated user, with last message preview.
 */
export async function GET() {
    try {
        await connectDB();

        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "name email")
            .sort({ updatedAt: -1 })
            .lean();

        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (conv: any) => {
                const conversationId = conv._id.toString();
                const lastMessage = await Message.findOne({ conversationId: conversationId })
                    .sort({ createdAt: -1 })
                    .populate("senderId", "name")
                    .lean();
                return { ...conv, lastMessage: lastMessage || null };
            })
        );

        return NextResponse.json({
            message: "Conversations fetched",
            conversations: conversationsWithLastMessage,
        }, { status: 200 });

    } catch (error: any) {
        console.error("GET CONVERSATIONS ERROR:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
