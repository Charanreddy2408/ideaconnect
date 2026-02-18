# Database Seeding Script

This script populates the database with realistic mock data for testing and development.

## Prerequisites

1. Make sure MongoDB is running and accessible
2. Set `MONGODB_URI` in your `.env` or `.env.local` file

## Usage

```bash
npm run seed
```

## What it creates

- **30 Users** with realistic profiles, skills, and interests
- **80 Ideas** across all categories (Tech, Social, Fintech, Health, Education, AI, Web3)
- **Comments** on ideas (2-8 comments per idea)
- **Votes** on ideas (5-20 votes per idea, with realistic upvote/downvote distribution)
- **Conversations** between users (15-30 conversations)
- **Messages** in conversations (3-10 messages per conversation)

## Test Credentials

After seeding, you can log in with any user:
- **Email**: Use any email from the seeded users
- **Password**: `password123`

## Notes

- The script will **clear all existing data** before seeding
- All data is generated using `@faker-js/faker` for realism
- Ideas have proper validation scores calculated
- Votes and comments are distributed realistically across ideas
