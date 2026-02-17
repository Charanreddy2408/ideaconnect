import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIdea extends Document {
    title: string;
    summary: string;
    problem: string;
    targetAudience: string;
    revenueModel: string;
    requiredSkills: string[];
    budget?: string;
    category: string;
    validationScore: number;
    voteScore: number;
    upvotes: number;
    downvotes: number;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    commentCount: number;
}

const ideaSchema = new Schema<IIdea>({
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    problem: { type: String, required: true, trim: true },
    targetAudience: { type: String, required: true, trim: true },
    revenueModel: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    budget: { type: String },
    category: { type: String, required: true, trim: true },
    validationScore: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentCount: { type: Number, default: 0 },
}, { timestamps: true });

ideaSchema.index({ title: "text", summary: "text" });

if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Idea;
}
const Idea: Model<IIdea> = mongoose.models.Idea || mongoose.model<IIdea>("Idea", ideaSchema);

export default Idea;