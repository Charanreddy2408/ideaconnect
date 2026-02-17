import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
    userId: mongoose.Types.ObjectId;
    ideaId: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    parentCommentId: mongoose.Types.ObjectId | null;
}

const commentSchema = new Schema<IComment>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true },
    comment: { type: String, required: true, trim: true },
    parentCommentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },

}, { timestamps: true });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);

export default Comment;