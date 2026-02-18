import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  skills: string[];
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
},
  { timestamps: true }
);

userSchema.index({ name: "text", skills: "text", interests: "text" });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;