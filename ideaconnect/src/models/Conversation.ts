import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
    participants: { type: [Schema.Types.ObjectId], ref: "User", required: true },
}, { timestamps: true });
// Index participants to quickly find a user's conversations.
// We include updatedAt: -1 to make fetching the "recent chats" list very fast.
conversationSchema.index({ participants: 1, updatedAt: -1 });
const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);


export default Conversation;