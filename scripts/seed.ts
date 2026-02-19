/**
 * Seed script for IdeaConnect.
 * Clears DB, creates 3 users, then seeds 20 ideas with real AI reports (Cerebras).
 * Run: npm run seed
 * Requires: MONGODB_URI, CEREBRAS_API_KEY in .env
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
import { generateAIReport } from "../src/lib/aiReport";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in .env or .env.local");
  process.exit(1);
}
if (!process.env.CEREBRAS_API_KEY) {
  console.error("Missing CEREBRAS_API_KEY in .env (required for AI report on each idea)");
  process.exit(1);
}

const TEST_PASSWORD = "password123";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SEED_IDEAS: Array<{
  title: string;
  summary: string;
  problem: string;
  targetAudience: string;
  revenueModel: string;
  requiredSkills: string[];
  category: string;
  budget?: string;
}> = [
  {
    title: "AI-Powered Study Buddy",
    summary: "An app that adapts to your learning style and generates quizzes from your notes.",
    problem: "Students struggle to retain information and don't have personalized study tools.",
    targetAudience: "College students and lifelong learners",
    revenueModel: "Freemium with premium features and institutional licenses",
    requiredSkills: ["ML", "Mobile", "EdTech"],
    category: "Education",
    budget: "₹5L - ₹15L",
  },
  {
    title: "Local Food Marketplace",
    summary: "Connect local farmers with restaurants and households for fresh produce delivery.",
    problem: "Food waste and long supply chains make fresh produce expensive and unsustainable.",
    targetAudience: "Restaurants, households, and small farms",
    revenueModel: "Commission on transactions and subscription for farms",
    requiredSkills: ["Logistics", "Marketplace", "Mobile"],
    category: "Social",
    budget: "₹20L - ₹50L",
  },
  {
    title: "Micro-Savings for Gig Workers",
    summary: "Round-up and auto-save from gig payouts with optional goals and nudges.",
    problem: "Gig workers often lack access to simple savings tools tied to irregular income.",
    targetAudience: "Gig workers and freelancers",
    revenueModel: "Premium subscriptions and partner referrals",
    requiredSkills: ["FinTech", "Compliance", "Mobile"],
    category: "Fintech",
    budget: "₹50L+",
  },
  {
    title: "Mental Health Check-in Bot",
    summary: "Daily micro-check-ins with optional therapist matching and crisis resources.",
    problem: "Many people delay seeking mental health support due to stigma and cost.",
    targetAudience: "Young adults and remote workers",
    revenueModel: "B2B workplace wellness and B2C premium features",
    requiredSkills: ["AI/ML", "Product", "Clinical partnerships"],
    category: "Health",
    budget: "₹10L - ₹30L",
  },
  {
    title: "No-Code API Builder",
    summary: "Turn spreadsheets and forms into secure APIs in minutes.",
    problem: "Non-technical teams wait months for simple integrations.",
    targetAudience: "Ops teams, startups, SMBs",
    revenueModel: "Usage-based pricing and team plans",
    requiredSkills: ["Backend", "DevTools", "DX"],
    category: "Tech",
    budget: "₹15L - ₹40L",
  },
  {
    title: "Carbon Footprint Tracker for SMEs",
    summary: "Track and report emissions with actionable reduction suggestions.",
    problem: "SMEs lack affordable tools to measure and reduce their carbon footprint.",
    targetAudience: "Small and medium enterprises",
    revenueModel: "SaaS subscription and certification fees",
    requiredSkills: ["Sustainability", "Data", "Compliance"],
    category: "Tech",
    budget: "₹20L - ₹50L",
  },
  {
    title: "Neighborhood Task Barter",
    summary: "Exchange skills and tasks locally without money (e.g. dog walk for tutoring).",
    problem: "People have unused skills and time but no easy way to barter locally.",
    targetAudience: "Local communities and housing societies",
    revenueModel: "Premium features and partner lead gen",
    requiredSkills: ["Mobile", "Community", "Trust & Safety"],
    category: "Social",
    budget: "₹5L - ₹15L",
  },
  {
    title: "Invoice Financing for Creators",
    summary: "Advance against pending brand and platform payouts with transparent fees.",
    problem: "Creators face cash flow gaps between work done and payment received.",
    targetAudience: "Content creators and freelancers",
    revenueModel: "Fee on advance and optional subscription",
    requiredSkills: ["FinTech", "Compliance", "Partnerships"],
    category: "Fintech",
    budget: "₹50L+",
  },
  {
    title: "Voice Notes to Structured Notes",
    summary: "Record voice, get searchable notes and action items with one tap.",
    problem: "Meetings and ideas are lost in long voice memos no one revisits.",
    targetAudience: "Executives, sales, and field teams",
    revenueModel: "Per-seat SaaS and enterprise contracts",
    requiredSkills: ["AI/ML", "Speech", "Product"],
    category: "AI",
    budget: "₹25L - ₹60L",
  },
  {
    title: "Decentralized Reputation for Freelancers",
    summary: "Portable, on-chain reputation scores that follow freelancers across platforms.",
    problem: "Freelancers rebuild reputation on every new platform.",
    targetAudience: "Freelancers and hiring managers",
    revenueModel: "Protocol fees and premium verification",
    requiredSkills: ["Web3", "Smart contracts", "UX"],
    category: "Web3",
    budget: "₹30L - ₹80L",
  },
  {
    title: "Smart Queue for Local Services",
    summary: "Book slots at salons, clinics, and repair shops with real-time wait times.",
    problem: "Walk-ins waste time; appointments leave slots empty.",
    targetAudience: "Local service businesses and their customers",
    revenueModel: "Subscription for businesses and small booking fee",
    requiredSkills: ["Mobile", "Scheduling", "Operations"],
    category: "Tech",
    budget: "₹10L - ₹25L",
  },
  {
    title: "Parent Co-op Childcare Network",
    summary: "Parents form small co-ops for flexible, trusted childcare and activity swaps.",
    problem: "Childcare is expensive and inflexible for irregular schedules.",
    targetAudience: "Parents in urban areas",
    revenueModel: "Membership and optional insurance tie-ups",
    requiredSkills: ["Community", "Trust & Safety", "Mobile"],
    category: "Social",
    budget: "₹5L - ₹20L",
  },
  {
    title: "Compliance Assistant for Startups",
    summary: "Checklists and reminders for company law, tax, and sector-specific compliance.",
    problem: "Founders miss deadlines and filings due to complexity and cost of advisors.",
    targetAudience: "Early-stage startups and solo founders",
    revenueModel: "Freemium and paid compliance packs",
    requiredSkills: ["Legal", "Product", "Automation"],
    category: "Fintech",
    budget: "₹15L - ₹40L",
  },
  {
    title: "Personalized Habit Streaks",
    summary: "Habit tracking with smart reminders and optional accountability partners.",
    problem: "People start habits but drop them without structure or social accountability.",
    targetAudience: "Health-conscious adults and students",
    revenueModel: "Premium features and coaching upsells",
    requiredSkills: ["Mobile", "Behavioral design", "Backend"],
    category: "Health",
    budget: "₹5L - ₹15L",
  },
  {
    title: "Skill-Based Match for Co-founders",
    summary: "Match potential co-founders by skills, stage, and idea fit with verified profiles.",
    problem: "Finding a compatible co-founder is slow and opaque.",
    targetAudience: "Pre-seed founders and idea-stage builders",
    revenueModel: "Subscription and success fee",
    requiredSkills: ["Matching", "Trust", "Community"],
    category: "Tech",
    budget: "₹20L - ₹50L",
  },
  {
    title: "Local Language Voice Assistant",
    summary: "Voice assistant that understands and responds in regional Indian languages.",
    problem: "Most voice tech is English-first; vernacular users are underserved.",
    targetAudience: "Vernacular internet users and SMBs",
    revenueModel: "B2B API and white-label licensing",
    requiredSkills: ["NLP", "Speech", "Indian languages"],
    category: "AI",
    budget: "₹40L+",
  },
  {
    title: "Fair Price Discovery for Agri Produce",
    summary: "Real-time price and demand signals for farmers to decide when and where to sell.",
    problem: "Farmers lack transparency on market prices and often sell at a loss.",
    targetAudience: "Small and marginal farmers",
    revenueModel: "Subscription and commission on verified transactions",
    requiredSkills: ["Agri", "Data", "Mobile"],
    category: "Tech",
    budget: "₹25L - ₹60L",
  },
  {
    title: "NFT Gated Community Tools",
    summary: "Discord-like tools for NFT communities: roles, rewards, and governance.",
    problem: "NFT communities rely on scattered tools and manual work for engagement.",
    targetAudience: "NFT project admins and community managers",
    revenueModel: "Subscription per community and premium features",
    requiredSkills: ["Web3", "Community", "Backend"],
    category: "Web3",
    budget: "₹20L - ₹50L",
  },
  {
    title: "One-Click Legal Doc Generator",
    summary: "Generate NDAs, offer letters, and simple contracts from templates with e-sign.",
    problem: "Startups overpay for basic legal docs or use inconsistent templates.",
    targetAudience: "Startups and SMBs",
    revenueModel: "Per-doc and subscription plans",
    requiredSkills: ["Legal", "Product", "E-sign"],
    category: "Fintech",
    budget: "₹15L - ₹35L",
  },
  {
    title: "Peer-to-Peer Skill Workshops",
    summary: "Experts host short paid workshops; learners book by topic and level.",
    problem: "Structured upskilling is expensive; free content is unstructured.",
    targetAudience: "Professionals and career switchers",
    revenueModel: "Commission on workshops and subscriptions",
    requiredSkills: ["Marketplace", "Payments", "Video"],
    category: "Education",
    budget: "₹10L - ₹30L",
  },
];

async function seed(mongoUri: string) {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const collections = await mongoose.connection.db?.listCollections().toArray();
  const names = (collections ?? []).map((c) => c.name);
  for (const name of names) {
    await mongoose.connection.db?.dropCollection(name);
    console.log("Dropped", name);
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
  console.log("Created 3 users: alice@test.com, bob@test.com, carol@test.com");

  const ideas: mongoose.Types.ObjectId[] = [];
  for (let i = 0; i < SEED_IDEAS.length; i++) {
    const payload = SEED_IDEAS[i];
    const owner = users[i % users.length];
    process.stdout.write(`  [${i + 1}/${SEED_IDEAS.length}] AI evaluating: ${payload.title.slice(0, 40)}... `);
    try {
      const aiReport = await generateAIReport({
        title: payload.title,
        summary: payload.summary,
        problem: payload.problem,
        targetAudience: payload.targetAudience,
        revenueModel: payload.revenueModel,
        requiredSkills: payload.requiredSkills,
        category: payload.category,
        budget: payload.budget,
      });
      const idea = await Idea.create({
        ...payload,
        userId: owner._id,
        aiReport,
        voteScore: 0,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
      });
      ideas.push(idea._id);
      console.log("OK");
    } catch (err) {
      console.log("FAILED");
      throw err;
    }
    await delay(1500);
  }
  console.log(`Created ${ideas.length} ideas with AI reports.`);

  const idea1 = await Idea.findById(ideas[0]).orFail();
  const idea2 = await Idea.findById(ideas[1]).orFail();
  const idea3 = await Idea.findById(ideas[2]).orFail();

  await Comment.create([
    { userId: bob._id, ideaId: idea1._id, comment: "Love the personalization angle. Have you looked at spaced repetition research?" },
    { userId: carol._id, ideaId: idea1._id, comment: "EdTech is crowded but this has a clear differentiator." },
    { userId: alice._id, ideaId: idea2._id, comment: "We need this in our city. Happy to beta test." },
  ]);
  await Idea.updateOne({ _id: idea1._id }, { $inc: { commentCount: 2 } });
  await Idea.updateOne({ _id: idea2._id }, { $inc: { commentCount: 1 } });
  console.log("Created comments");

  await Vote.insertMany([
    { userId: bob._id, ideaId: idea1._id, voteType: 1 },
    { userId: carol._id, ideaId: idea1._id, voteType: 1 },
    { userId: alice._id, ideaId: idea2._id, voteType: 1 },
    { userId: carol._id, ideaId: idea2._id, voteType: -1 },
    { userId: alice._id, ideaId: idea3._id, voteType: 1 },
    { userId: bob._id, ideaId: idea3._id, voteType: 1 },
  ]);
  await Idea.updateOne({ _id: idea1._id }, { voteScore: 2, upvotes: 2, downvotes: 0 });
  await Idea.updateOne({ _id: idea2._id }, { voteScore: 0, upvotes: 1, downvotes: 1 });
  await Idea.updateOne({ _id: idea3._id }, { voteScore: 2, upvotes: 2, downvotes: 0 });
  console.log("Created votes");

  const conv1 = await Conversation.create({ participants: [alice._id, bob._id] });
  await Message.insertMany([
    { conversationId: conv1._id, senderId: alice._id, content: "Hey Bob, would you be up for giving feedback on my study buddy idea?" },
    { conversationId: conv1._id, senderId: bob._id, content: "Sure! Send me the link and I'll leave comments." },
  ]);
  const conv2 = await Conversation.create({ participants: [bob._id, carol._id] });
  await Message.create({ conversationId: conv2._id, senderId: carol._id, content: "Bob, let's sync on the food marketplace concept next week." });
  console.log("Created conversations and messages");

  console.log("\nSeed done.");
  console.log("  Logins: alice@test.com | bob@test.com | carol@test.com — password:", TEST_PASSWORD);
  console.log("  Ideas: 20 with AI reports (Cerebras GPT-OSS-120B).");
  await mongoose.disconnect();
}

seed(uri).catch((err) => {
  console.error(err);
  process.exit(1);
});
