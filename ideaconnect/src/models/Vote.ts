import mongoose, { Schema, Document, Model } from "mongoose";
export interface IVote extends Document {
    userId: mongoose.Types.ObjectId;
    ideaId: mongoose.Types.ObjectId;
    voteType: 1 | -1;
    createdAt: Date;
    updatedAt: Date;
}

const voteSchema = new Schema<IVote>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true },
    voteType: { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });
voteSchema.index({ userId: 1, ideaId: 1 }, { unique: true });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>("Vote", voteSchema);
export default Vote;