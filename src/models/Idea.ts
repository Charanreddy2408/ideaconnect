import mongoose, { Schema, Document, Model } from "mongoose";

export type CompetitionRisk = "Low" | "Medium" | "High";

export interface IAIReport {
    problemClarity: number;
    audienceScore: number;
    monetizationScore: number;
    innovationScore: number;
    feasibilityScore: number;
    scalabilityScore: number;
    validationReadiness: number;
    competitionRisk: CompetitionRisk;
    strengths: string[];
    risks: string[];
    suggestions: string[];
    generatedAt: Date;
}

export interface IIdea extends Document {
    title: string;
    summary: string;
    problem: string;
    targetAudience: string;
    revenueModel: string;
    requiredSkills: string[];
    budget?: string;
    category: string;
    voteScore: number;
    upvotes: number;
    downvotes: number;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    commentCount: number;
    aiReport: IAIReport;
}

const aiReportSchema = new Schema<IAIReport>({
    problemClarity: { type: Number, required: true },
    audienceScore: { type: Number, required: true },
    monetizationScore: { type: Number, required: true },
    innovationScore: { type: Number, required: true },
    feasibilityScore: { type: Number, required: true },
    scalabilityScore: { type: Number, required: true },
    validationReadiness: { type: Number, required: true },
    competitionRisk: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true,
    },
    strengths: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    generatedAt: { type: Date, required: true },
}, { _id: false });

const ideaSchema = new Schema<IIdea>({
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    problem: { type: String, required: true, trim: true },
    targetAudience: { type: String, required: true, trim: true },
    revenueModel: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    budget: { type: String },
    category: { type: String, required: true, trim: true },
    voteScore: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentCount: { type: Number, default: 0 },
    aiReport: { type: aiReportSchema, required: true },
}, { timestamps: true });

ideaSchema.index({ title: "text", summary: "text" });

if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Idea;
}
const Idea: Model<IIdea> = mongoose.models.Idea || mongoose.model<IIdea>("Idea", ideaSchema);

export default Idea;
