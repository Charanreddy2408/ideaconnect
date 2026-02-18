/**
 * Seed script for IdeaConnect.
 * Run: npm run seed  (or npx tsx scripts/seed.ts)
 * Requires: MONGODB_URI in .env or .env.local
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/usermodel";
import Idea from "../src/models/Idea";
import Comment from "../src/models/Comment";
import Vote from "../src/models/Vote";
import Conversation from "../src/models/Conversation";
import Message from "../src/models/Message";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in .env or .env.local");
  process.exit(1);
}

const TEST_PASSWORD = "password123";

async function seed(mongoUri: string) {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const collections = await mongoose.connection.db?.listCollections().toArray();
  const names = (collections ?? []).map((c) => c.name);
  if (names.length) {
    for (const name of names) {
      await mongoose.connection.db?.dropCollection(name);
      console.log("Dropped", name);
    }
  }

  const alice = await User.create({
    name: "Alice Test",
    email: "alice@test.com",
    password: await bcrypt.hash(TEST_PASSWORD, 10),
    bio: "Product person and idea enthusiast.",
    skills: ["Product", "Design", "Marketing"],
    interests: ["SaaS", "EdTech", "Sustainability"],
  });

  const bob = await User.create({
    name: "Bob Demo",
    email: "bob@test.com",
    password: await bcrypt.hash(TEST_PASSWORD, 10),
    bio: "Developer and startup advisor.",
    skills: ["Engineering", "DevOps", "APIs"],
    interests: ["AI", "DevTools", "FinTech"],
  });

  const carol = await User.create({
    name: "Carol Seed",
    email: "carol@test.com",
    password: await bcrypt.hash(TEST_PASSWORD, 10),
    bio: "Investor and mentor.",
    skills: ["Strategy", "Finance"],
    interests: ["HealthTech", "CleanTech"],
  });

  const users = [alice, bob, carol];
  console.log("Created users: alice@test.com, bob@test.com, carol@test.com");

  const idea1 = await Idea.create({
    title: "AI-Powered Study Buddy",
    summary: "An app that adapts to your learning style and generates quizzes from your notes.",
    problem: "Students struggle to retain information and don't have personalized study tools.",
    targetAudience: "College students and lifelong learners",
    revenueModel: "Freemium with premium features and institutional licenses",
    requiredSkills: ["ML", "Mobile", "EdTech"],
    budget: "Low",
    category: "EdTech",
    userId: alice._id,
    validationScore: 75,
    voteScore: 5,
    upvotes: 6,
    downvotes: 1,
    commentCount: 2,
  });

  const idea2 = await Idea.create({
    title: "Local Food Marketplace",
    summary: "Connect local farmers with restaurants and households for fresh produce delivery.",
    problem: "Food waste and long supply chains make fresh produce expensive and unsustainable.",
    targetAudience: "Restaurants, households, and small farms",
    revenueModel: "Commission on transactions and subscription for farms",
    requiredSkills: ["Logistics", "Marketplace", "Mobile"],
    budget: "Medium",
    category: "Sustainability",
    userId: bob._id,
    validationScore: 60,
    voteScore: 3,
    upvotes: 4,
    downvotes: 1,
    commentCount: 1,
  });

  const idea3 = await Idea.create({
    title: "Micro-Savings for Gig Workers",
    summary: "Round-up and auto-save from gig payouts with optional goals and nudges.",
    problem: "Gig workers often lack access to simple savings tools tied to irregular income.",
    targetAudience: "Gig workers and freelancers",
    revenueModel: "Premium subscriptions and partner referrals",
    requiredSkills: ["FinTech", "Compliance", "Mobile"],
    budget: "High",
    category: "FinTech",
    userId: carol._id,
    validationScore: 80,
    voteScore: 4,
    upvotes: 4,
    downvotes: 0,
    commentCount: 0,
  });

  const ideas = [idea1, idea2, idea3];
  console.log("Created 3 ideas");

  await Comment.create([
    { userId: bob._id, ideaId: idea1._id, comment: "Love the personalization angle. Have you looked at spaced repetition research?" },
    { userId: carol._id, ideaId: idea1._id, comment: "EdTech is crowded but this has a clear differentiator." },
    { userId: alice._id, ideaId: idea2._id, comment: "We need this in our city. Happy to beta test." },
  ]);
  console.log("Created comments");

  await Vote.insertMany([
    { userId: bob._id, ideaId: idea1._id, voteType: 1 },
    { userId: carol._id, ideaId: idea1._id, voteType: 1 },
    { userId: alice._id, ideaId: idea2._id, voteType: 1 },
    { userId: carol._id, ideaId: idea2._id, voteType: -1 },
    { userId: alice._id, ideaId: idea3._id, voteType: 1 },
    { userId: bob._id, ideaId: idea3._id, voteType: 1 },
  ]);
  console.log("Created votes");

  const conv1 = await Conversation.create({ participants: [alice._id, bob._id] });
  await Message.insertMany([
    { conversationId: conv1._id, senderId: alice._id, content: "Hey Bob, would you be up for giving feedback on my study buddy idea?" },
    { conversationId: conv1._id, senderId: bob._id, content: "Sure! Send me the link and I'll leave comments." },
  ]);
  const conv2 = await Conversation.create({ participants: [bob._id, carol._id] });
  await Message.create({ conversationId: conv2._id, senderId: carol._id, content: "Bob, let's sync on the food marketplace concept next week." });
  console.log("Created conversations and messages");

  console.log("\nSeed done. Test logins: alice@test.com / bob@test.com / carol@test.com with password:", TEST_PASSWORD);
  await mongoose.disconnect();
}

seed(uri).catch((err) => {
  console.error(err);
  process.exit(1);
});
