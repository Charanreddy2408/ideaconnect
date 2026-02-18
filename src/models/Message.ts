import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
}, { timestamps: true });

// Index conversationid and createdAt to quickly fetch messages for a chat in order.
messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;