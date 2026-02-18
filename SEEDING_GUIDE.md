# Database Seeding & API Testing Guide

## ✅ What's Been Done

### 1. **Comprehensive Seed Script Created**
   - Location: `scripts/seed.ts`
   - Uses `@faker-js/faker` for realistic data generation
   - Generates:
     - **30 Users** with profiles, skills, interests, and bios
     - **80 Ideas** across all categories with proper validation scores
     - **Comments** on ideas (2-8 per idea)
     - **Votes** on ideas (5-20 per idea, realistic distribution)
     - **Conversations** between users (15-30 conversations)
     - **Messages** in conversations (3-10 per conversation)

### 2. **API Fixes**
   - ✅ Updated `/api/ideas` to include `userVote` status for authenticated users
   - ✅ Updated `/api/ideas/[id]` to include `userVote` status
   - ✅ All APIs properly handle authentication and authorization

### 3. **Package.json Updated**
   - Added `seed` script: `npm run seed`

## 🚀 How to Use

### Step 1: Ensure MongoDB is Running
Make sure your MongoDB instance is accessible and `MONGODB_URI` is set in your `.env` or `.env.local` file.

### Step 2: Run the Seed Script
```bash
npm run seed
```

This will:
- Clear all existing data
- Generate 30 users, 80 ideas, comments, votes, conversations, and messages
- Display a summary of what was created

### Step 3: Test the Website
After seeding, you can:
- **Login** with any user email (password: `password123`)
- **Browse ideas** in the marketplace
- **View idea details** with comments and votes
- **Vote on ideas** (upvote/downvote)
- **Comment on ideas**
- **Start conversations** with other users
- **Send messages** in conversations

## 📊 Generated Data Details

### Users
- Realistic names and emails
- Skills: Mix of tech (React, Python, etc.) and business (Marketing, Sales, etc.)
- Interests: Startup-related topics
- Bios: Generated professional bios

### Ideas
- **Categories**: Tech, Social, Fintech, Health, Education, AI, Web3
- **Titles**: Category-specific, realistic startup ideas
- **Problems**: Detailed problem statements
- **Target Audiences**: Founders, Developers, Students, etc.
- **Revenue Models**: Subscription, Freemium, Marketplace, etc.
- **Validation Scores**: Calculated based on completeness
- **Vote Scores**: Realistic distribution (mostly positive)

### Comments
- Natural-sounding comments
- Distributed across all ideas
- Some ideas have more engagement than others

### Votes
- 75% upvotes, 25% downvotes
- Users can't vote on their own ideas
- Realistic vote score distribution

### Conversations & Messages
- Conversations between random pairs of users
- Multiple messages per conversation
- Natural conversation flow

## 🔑 Test Credentials

After seeding, use any of these to log in:
- **Email**: Any email from the seeded users (check MongoDB or use the first user's email)
- **Password**: `password123`

## 🧪 Testing APIs

All APIs are now properly configured:

1. **Authentication**
   - `/api/auth/register` - Create new user
   - `/api/auth/login` - Login user
   - `/api/auth/logout` - Logout user
   - `/api/auth/profile` - Get user profile

2. **Ideas**
   - `GET /api/ideas` - List all ideas (with filters, search, sort)
   - `POST /api/ideas` - Create new idea
   - `GET /api/ideas/[id]` - Get single idea details
   - `PATCH /api/ideas/[id]` - Update idea (owner only)
   - `DELETE /api/ideas/[id]` - Delete idea (owner only)

3. **Comments**
   - `GET /api/ideas/[id]/comments` - Get comments for an idea
   - `POST /api/ideas/[id]/comments` - Add comment
   - `DELETE /api/comments/[id]` - Delete comment (owner only)

4. **Votes**
   - `POST /api/votes` - Vote on an idea (upvote/downvote/toggle)

5. **Messages**
   - `GET /api/messages/conversations` - List user's conversations
   - `POST /api/messages/conversations` - Start new conversation
   - `GET /api/messages/[conversationId]` - Get messages in conversation

6. **Users**
   - `GET /api/users/search` - Search users by skills/interests/name

## ⚠️ Important Notes

- The seed script **clears all existing data** before seeding
- All passwords are hashed using bcrypt
- Validation scores are calculated using the same logic as the API
- Vote scores are properly maintained (upvotes - downvotes)
- Comment counts are automatically updated

## 🐛 Troubleshooting

If you encounter issues:

1. **MongoDB Connection Error**
   - Check that MongoDB is running
   - Verify `MONGODB_URI` in `.env` file

2. **Seed Script Fails**
   - Make sure `@faker-js/faker` is installed: `npm install`
   - Check that `tsx` is available (should be in devDependencies)

3. **API Errors**
   - Check server logs for detailed error messages
   - Ensure JWT_SECRET is set in `.env`
   - Verify database connection

## 📝 Next Steps

1. Run `npm run seed` to populate the database
2. Test the website functionality
3. Verify all features work correctly
4. The website is now ready for users!
