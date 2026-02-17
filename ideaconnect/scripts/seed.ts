import 'dotenv/config';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/usermodel';
import Idea from '../src/models/Idea';
import Comment from '../src/models/Comment';
import Vote from '../src/models/Vote';
import Conversation from '../src/models/Conversation';
import Message from '../src/models/Message';
import { calculateValidationScore } from '../src/utils/validationScore';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ideaconnect';

if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not found. Using default: mongodb://localhost:27017/ideaconnect');
}

// App uses these exact categories for filters
const categories = ['Tech', 'Social', 'Fintech', 'Health', 'Education', 'AI', 'Web3'];

// Broad skills so any kind of founder can match
const allSkills = [
    'Marketing', 'Sales', 'Design', 'Writing', 'Social Media', 'Customer Service',
    'Accounting', 'Operations', 'Product Management', 'Research', 'Teaching',
    'Cooking', 'Photography', 'Video', 'Community Building', 'Events',
    'React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Excel', 'Data Analysis',
    'SEO', 'Content Writing', 'Branding', 'Partnerships', 'Legal', 'HR',
];

const interests = [
    'Startups', 'Small Business', 'Social Impact', 'Sustainability', 'Health & Wellness',
    'Education', 'Food & Beverage', 'Creative Arts', 'Local Community', 'Fintech',
    'E-commerce', 'Parenting', 'Fitness', 'Travel', 'Fashion', 'Agriculture',
    'Real Estate', 'Gaming', 'Music', 'Writing', 'Volunteering',
];

const revenueModels = [
    'Subscription-based (SaaS)',
    'Freemium model with premium features',
    'Transaction fees (marketplace)',
    'Advertising revenue',
    'Enterprise licensing',
    'Pay-per-use pricing',
    'Commission-based model',
    'One-time purchase with add-ons',
    'Hybrid: Subscription + Transaction fees',
];

const budgetRanges = [
    '$5k - $15k', '$15k - $50k', '$50k - $100k', '$100k - $250k', '$250k+',
    'Bootstrapped', 'Seeking funding',
];

// ─── Full idea definitions: any industry, business or product, so the platform feels open to all ───
const ideaPool: Array<{
    category: string;
    title: string;
    problem: string;
    summary: string;
    targetAudience: string;
    requiredSkills: string[];
}> = [
    // Tech — products, apps, tools (broad)
    { category: 'Tech', title: 'Neighbourhood Tool-Lending App', problem: 'People buy power tools and gardening equipment they use once a year. Sharing between neighbours is awkward without trust and scheduling. A simple app could connect people nearby and track who has what.', summary: 'A local peer-to-peer lending app for tools and equipment. Reduces waste and cost; builds community. Pilot in 3 suburbs showed 40% drop in duplicate purchases in year one.', targetAudience: 'Homeowners and renters in suburban and urban areas', requiredSkills: ['Marketing', 'Design', 'Community Building'] },
    { category: 'Tech', title: 'Menu Board System for Small Cafes', problem: 'Small cafes and food trucks change menus often. Printed boards are costly and outdated. They need a simple digital display that staff can update in seconds.', summary: 'Affordable digital menu boards for independent food businesses. Cloud-updated, no IT needed. Starting at under $200 per screen with a 6-month pilot in 12 locations.', targetAudience: 'Independent cafe owners, food trucks, and small restaurants', requiredSkills: ['Design', 'Operations', 'Customer Service'] },
    { category: 'Tech', title: 'Booking System for Local Coaches', problem: 'Fitness coaches, music teachers, and tutors waste hours on back-and-forth messages for scheduling. Generic booking tools don’t fit how they work or their clients.', summary: 'Scheduling and payments built for solo coaches and tutors. Recurring slots, reminders, and simple invoicing. Used by 50+ coaches in 2 cities with 90% retention.', targetAudience: 'Freelance coaches, tutors, and wellness instructors', requiredSkills: ['Product Management', 'Customer Service'] },
    { category: 'Tech', title: 'Family Photo and Video Safe Vault', problem: 'Families have thousands of photos and videos scattered across phones and clouds. They want one private place that survives device changes and is easy for grandparents to use.', summary: 'Family-focused photo and video storage with simple sharing and legacy options. No ads, clear privacy. Early waitlist of 500 families.', targetAudience: 'Parents and extended families who care about preserving memories', requiredSkills: ['Design', 'Marketing', 'Customer Service'] },
    { category: 'Tech', title: 'Inventory Tracker for Small Retail Shops', problem: 'Small shops lose sales because they don’t know what’s low until it’s out. Spreadsheets are error-prone and don’t alert in time.', summary: 'Lightweight stock tracking with low-stock alerts and simple reports. Works offline and on tablets. Piloted in 8 small retail stores with 30% fewer stockouts.', targetAudience: 'Independent retail and boutique owners', requiredSkills: ['Operations', 'Excel', 'Customer Service'] },
    // Social — community, local, events, lifestyle
    { category: 'Social', title: 'Local Skill-Swap Marketplace', problem: 'People have skills they’d happily trade (e.g. plumbing for tutoring) but there’s no trusted way to find and swap locally. Facebook groups are messy and unsafe.', summary: 'A local platform to offer and request skill swaps with simple verification and ratings. Launched in one city; 200+ active swappers in 4 months.', targetAudience: 'Residents who want to trade skills instead of paying cash', requiredSkills: ['Community Building', 'Operations', 'Design'] },
    { category: 'Social', title: 'Playdate and Parent Meetup Finder', problem: 'Parents new to an area struggle to find other families with kids the same age. Playgrounds are hit-or-miss and parent groups are often closed or inactive.', summary: 'Match parents by location, child age, and interests. Suggest parks and activities. Beta in 2 neighbourhoods with 400 sign-ups and 60% monthly active.', targetAudience: 'Parents of young children looking for local connections', requiredSkills: ['Community Building', 'Marketing', 'Design'] },
    { category: 'Social', title: 'Community Garden Plot and Water Sharing', problem: 'Community gardens have long waitlists and uneven water access. Coordinating plots, rotas, and shared tools is done on paper or chaotic WhatsApp groups.', summary: 'One place to manage plots, waitlists, watering rotas, and tool booking. Piloted in 5 gardens; coordinators report 50% less admin time.', targetAudience: 'Community garden coordinators and local councils', requiredSkills: ['Operations', 'Community Building'] },
    { category: 'Social', title: 'Micro-Event Host Matching for Coworking Spaces', problem: 'Coworking spaces want workshops and meetups but don’t know who’s willing to host. Hosts don’t know which spaces are open to one-off events.', summary: 'Connect event hosts (talks, workshops, networking) with spaces that have capacity. Revenue share model. Live in 3 cities with 20 spaces and 100+ hosts.', targetAudience: 'Coworking and flexible space operators and independent facilitators', requiredSkills: ['Partnerships', 'Events', 'Operations'] },
    { category: 'Social', title: 'Elder Companion and Errand Matching', problem: 'Older adults who live alone need occasional company and help with errands. Families live far away. Existing services are expensive or impersonal.', summary: 'Match vetted volunteers and part-time helpers with seniors for regular visits and errands. Pilot with 30 families; high satisfaction and repeat use.', targetAudience: 'Families of older adults and seniors who want to age in place', requiredSkills: ['Community Building', 'Operations', 'Customer Service'] },
    // Fintech — small business, personal, micro
    { category: 'Fintech', title: 'Simple Invoicing for Freelancers and Sole Traders', problem: 'Freelancers and sole traders lose time on invoices and chasing payment. Generic tools are too heavy or too expensive for someone with 5–20 clients.', summary: 'Invoicing and payment reminders built for solo workers. Templates, reminders, and basic reporting. Free tier for up to 10 invoices/month; 2,000+ users.', targetAudience: 'Freelancers, consultants, and sole traders', requiredSkills: ['Accounting', 'Product Management', 'Customer Service'] },
    { category: 'Fintech', title: 'Savings Circles for Friends and Families', problem: 'People want to save together (e.g. for a trip or a gift) but sending cash around is messy. There’s no simple, transparent way to pool and track.', summary: 'Group savings pots with clear rules and visibility. No interest; just structure and accountability. Used by 150+ groups in closed beta.', targetAudience: 'Friends and families who save together for goals', requiredSkills: ['Product Management', 'Design', 'Legal'] },
    { category: 'Fintech', title: 'Micro-Loan Marketplace for Small Business', problem: 'Small businesses need small loans (e.g. $2k–$15k) for stock or equipment. Banks don’t serve them; online lenders are expensive and opaque.', summary: 'Transparent micro-loans for registered small businesses with clear terms and repayment tracking. Partnering with 2 local lenders; 80 applications in first 2 months.', targetAudience: 'Small business owners who need short-term working capital', requiredSkills: ['Partnerships', 'Legal', 'Operations'] },
    { category: 'Fintech', title: 'Tip and Gratuity Splitting for Restaurant Staff', problem: 'Restaurant staff split tips manually or via messy spreadsheets. Mistakes cause tension and wage disputes.', summary: 'App for managers to log tips and hours; automatic fair split by role and shift. Integrates with existing POS. Trial in 5 venues; 100% adoption by staff.', targetAudience: 'Restaurant and bar managers and owners', requiredSkills: ['Operations', 'Customer Service', 'Excel'] },
    { category: 'Fintech', title: 'Budget and Goals for First-Time Savers', problem: 'Young earners want to save but don’t know where to start. Generic apps feel overwhelming; they need simple goals and gentle nudges.', summary: 'Goal-based saving with round-ups and weekly check-ins. Plain language, no jargon. 1,000+ users in beta; average 15% increase in amount saved.', targetAudience: 'First-time earners and young adults building savings habits', requiredSkills: ['Design', 'Marketing', 'Product Management'] },
    // Health — fitness, food, wellness, care
    { category: 'Health', title: 'Meal Planning for Busy Families', problem: 'Parents know they should plan meals but run out of ideas and time. Recipe apps don’t account for picky kids, leftovers, or a tight grocery budget.', summary: 'Weekly meal plans that respect budget, preferences, and leftovers. Shopping list and simple recipes. 500+ families in trial; 70% stick past 4 weeks.', targetAudience: 'Busy parents who want to cook more and waste less', requiredSkills: ['Content Writing', 'Design', 'Marketing'] },
    { category: 'Health', title: 'At-Home Physio and Stretch Video Library', problem: 'People get basic physio exercises but forget them at home. YouTube is overwhelming and not tailored to their injury or goal.', summary: 'Short video programmes by goal (e.g. lower back, desk posture) with progress tracking. Designed with a physio; 200 users in pilot, strong completion rates.', targetAudience: 'Adults with mild injuries or posture issues who want to self-manage', requiredSkills: ['Content Writing', 'Video', 'Design'] },
    { category: 'Health', title: 'Mental Health Check-In and Journaling', problem: 'People want to track mood and stress but find long journals hard to keep. They need something quick and private that still helps spot patterns.', summary: 'Daily 1-minute check-in and optional short journal. Simple charts and reminders. No diagnosis; just awareness. Used by 800+ in waitlist phase.', targetAudience: 'Adults who want to build awareness of mood and stress', requiredSkills: ['Design', 'Product Management', 'Research'] },
    { category: 'Health', title: 'Allergy-Safe Restaurant and Cafe Finder', problem: 'People with food allergies avoid eating out because menus are unclear and staff are often unsure. They need trusted, up-to-date info by location.', summary: 'Crowdsourced and venue-verified allergy info with filters and reviews. Piloted in one city with 40 venues; 60% of users use it at least once a month.', targetAudience: 'People with food allergies and their families', requiredSkills: ['Community Building', 'Operations', 'Design'] },
    { category: 'Health', title: 'Hydration and Caffeine Tracker for Shift Workers', problem: 'Shift workers struggle with sleep and energy. They don’t know how much they’re drinking or how late they’re having caffeine.', summary: 'Simple logging for water and caffeine with gentle nudges and sleep-friendly cut-off reminders. Designed with input from nurses and drivers; 300+ users.', targetAudience: 'Shift workers, nurses, drivers, and night workers', requiredSkills: ['Research', 'Design', 'Marketing'] },
    // Education — tutoring, courses, hobbies, kids
    { category: 'Education', title: 'Tutor Matching by Learning Style and Goal', problem: 'Parents and students pick tutors by subject and price but not by how the student learns best. Mismatches lead to drop-off and wasted money.', summary: 'Matching based on subject, level, learning style, and goals. Trial sessions and feedback. Live in 2 cities; 85% of matches continue past 5 sessions.', targetAudience: 'Parents and adult learners looking for one-on-one tutoring', requiredSkills: ['Teaching', 'Operations', 'Customer Service'] },
    { category: 'Education', title: 'Short Courses for Career Switchers', problem: 'People want to switch careers but can’t commit to long degrees. Short courses are either too generic or too technical with no support.', summary: '6–8 week courses with live sessions and peer groups. Focus on one skill (e.g. data basics, writing) and next steps. First cohort of 50; 80% completed.', targetAudience: 'Career switchers and upskillers with limited time', requiredSkills: ['Teaching', 'Content Writing', 'Community Building'] },
    { category: 'Education', title: 'Language Practice with Native Speakers', problem: 'Language learners need speaking practice but don’t have a steady partner. Apps are mostly solo; conversation clubs are irregular.', summary: 'Structured conversation sessions with native speakers and simple topics. Subscription or credit model. 400+ learners and 100+ speakers in beta.', targetAudience: 'Language learners who want regular speaking practice', requiredSkills: ['Community Building', 'Teaching', 'Operations'] },
    { category: 'Education', title: 'Homework and Revision Planner for Teens', problem: 'Teens leave homework and revision to the last minute. Parents nag; planners and apps feel like school and get abandoned.', summary: 'Visual planner that breaks tasks into small steps and links to resources. Co-designed with students; 200 users in 3 schools with better on-time submission.', targetAudience: 'Secondary school students and their parents', requiredSkills: ['Design', 'Teaching', 'Research'] },
    { category: 'Education', title: 'Hobby and Craft Workshop Discovery', problem: 'People want to try pottery, woodwork, or painting but don’t know where to go. Studios exist but are hard to find and compare.', summary: 'Search and book one-off and short workshops by location and interest. Reviews and gift vouchers. Listed 80 studios in one region; 30% repeat bookers.', targetAudience: 'Adults looking for in-person hobby and craft workshops', requiredSkills: ['Partnerships', 'Operations', 'Design'] },
    // AI — practical use in any field
    { category: 'AI', title: 'AI Summaries for Long Council and School Documents', problem: 'Parents and residents need to understand council and school reports but don’t have time to read 50-page PDFs. They want plain-language summaries.', summary: 'Upload a document; get a short summary and key points in simple language. Piloted with 2 councils and 3 schools; 90% of users found it helpful.', targetAudience: 'Parents, residents, and community groups reading official documents', requiredSkills: ['Product Management', 'Content Writing', 'Design'] },
    { category: 'AI', title: 'Smart Reply Suggestions for Small Business Inbox', problem: 'Small business owners spend hours on email. Templates help but don’t fit every message; they need quick, professional replies they can edit.', summary: 'Browser extension that suggests short replies based on the email. One-click insert and edit. Used by 200+ sole traders; average 25% less time on email.', targetAudience: 'Solo and small business owners who handle their own email', requiredSkills: ['Product Management', 'Design', 'Customer Service'] },
    { category: 'AI', title: 'Recipe Ideas from What You Have at Home', problem: 'People have ingredients but don’t know what to cook. Recipe sites assume you’ll buy everything; they want ideas from what’s already in the fridge.', summary: 'Enter ingredients; get simple recipes that use them. Filters for diet and time. 1,000+ users; 3x weekly return rate in first month.', targetAudience: 'Home cooks who want to reduce waste and decide dinner quickly', requiredSkills: ['Content Writing', 'Design', 'Marketing'] },
    { category: 'AI', title: 'Meeting Notes and Action Items for Small Teams', problem: 'Small teams have meetings but notes are scattered and action items get lost. They don’t need enterprise tools; they need something simple and accurate.', summary: 'Upload or record; get a summary and action list. Editable and shareable. Tested with 15 teams; 80% use it for every meeting.', targetAudience: 'Small teams and startups who run regular meetings', requiredSkills: ['Product Management', 'Design', 'Customer Service'] },
    { category: 'AI', title: 'Local Event Descriptions and Accessibility Info', problem: 'Event listings are copy-pasted and lack accessibility details. People with mobility or sensory needs can’t tell if a venue suits them.', summary: 'Tool for organisers to add clear descriptions and accessibility info; outputs standardised text for listings. Adopted by 20 venues in one city.', targetAudience: 'Event and venue managers who want inclusive listings', requiredSkills: ['Content Writing', 'Operations', 'Design'] },
    // Web3 — creator, community, simple use cases
    { category: 'Web3', title: 'Creator Membership and Early Access Passes', problem: 'Creators want to offer memberships and early access without depending on a single platform. They need simple tools and fair payouts.', summary: 'Membership tiers and early-access passes with transparent rules and payouts. No crypto required for fans. 30 creators in pilot; 2,000+ members total.', targetAudience: 'Creators and small communities who want membership revenue', requiredSkills: ['Community Building', 'Operations', 'Partnerships'] },
    { category: 'Web3', title: 'Community-Owned Local Space Funding', problem: 'Communities want to fund a local space (e.g. cafe, garden) but don’t have a clear way to contribute and share in ownership or benefits.', summary: 'Transparent crowdfunding with clear ownership or reward tiers. First project: a neighbourhood cafe; 150 backers, 80% of target in 6 weeks.', targetAudience: 'Community groups and local organisers raising funds', requiredSkills: ['Community Building', 'Legal', 'Operations'] },
    { category: 'Web3', title: 'Digital Collectibles for Events and Conferences', problem: 'Events want to offer digital keepsakes and proof of attendance without complex tech. Attendees want something shareable and verifiable.', summary: 'Simple minting of attendance or achievement badges for events. Claim via QR or link. Used at 5 conferences; 40% of attendees claimed a badge.', targetAudience: 'Event and conference organisers', requiredSkills: ['Partnerships', 'Design', 'Operations'] },
    { category: 'Web3', title: 'Tip Jar and Support for Independent Artists', problem: 'Fans want to support artists directly. Platforms take a cut and don’t always pay quickly. Artists need a simple, low-fee way to receive support.', summary: 'Direct tips and optional perks with minimal fees. No lock-in; artists keep control. 100+ artists onboarded; average tip size $8.', targetAudience: 'Independent musicians, writers, and visual artists', requiredSkills: ['Community Building', 'Partnerships', 'Operations'] },
    { category: 'Web3', title: 'Certificates and Credentials for Workshops', problem: 'Workshop providers want to issue certificates that participants can keep and share. Paper is easy to lose; they need something verifiable and simple.', summary: 'Issue and verify completion certificates via a simple link. No blockchain jargon for participants. 10 providers; 500+ certificates issued.', targetAudience: 'Workshop providers, bootcamps, and training organisations', requiredSkills: ['Operations', 'Design', 'Partnerships'] },
];

// More ideas so we can generate 80+ with variety (repeat pool with slight variation via faker where needed)
function getRandomIdea(): typeof ideaPool[0] {
    const base = faker.helpers.arrayElement(ideaPool);
    const summarySuffix = faker.helpers.arrayElement([
        ' We are looking for 1–2 collaborators to help with design and launch.',
        ' Early feedback has been very positive; next step is a wider pilot.',
        ' Revenue model is clear; we need support with marketing and operations.',
    ]);
    return {
        ...base,
        summary: base.summary.length >= 50 ? base.summary + summarySuffix : base.summary + ' ' + summarySuffix,
    };
}

// Diverse user bios — not just tech
const bioTemplates = [
    'Former teacher, now building tools for parents and educators.',
    'Small business owner. Passionate about helping other independents.',
    'Designer and community organiser. Love bringing people together.',
    'Ex-nurse. Focused on simple health and wellness tools.',
    'Parent and volunteer. Interested in local and family-focused ideas.',
    'Chef and food lover. Want to make cooking and eating easier for everyone.',
    'Accountant by day, idea person by night. Love numbers and clarity.',
    'Writer and content creator. Care about clear communication.',
    'Work in events and hospitality. See a lot of pain points we could fix.',
    'Gardener and sustainability advocate. Believe in local and green.',
    'Music and arts background. Want to help creators earn and connect.',
    'Career switcher. Learning to build and ship products.',
    'Marketing and social media. Love helping ideas reach the right people.',
    'Engineer who wants to build things that help everyday life.',
    'Student with a side project. Eager to learn and collaborate.',
];

// Friendly, encouraging comments
const commentTemplates = [
    'This is exactly the kind of idea I was looking for. Would love to support or collaborate.',
    'Really clear problem and solution. Have you thought about starting in one neighbourhood first?',
    'I know people in this space – happy to make intros if useful.',
    'The pilot numbers are promising. What’s the main thing you need help with next?',
    'Similar to something I’ve been thinking about. Would be great to compare notes.',
    'Love that it’s focused on a real audience. How can others get involved?',
    'This could work well in my city too. Keen to hear how you’re rolling it out.',
    'Simple and practical. That’s what wins. Good luck with the next phase.',
];

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Idea.deleteMany({});
    await Comment.deleteMany({});
    await Vote.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Database cleared');
}

async function createUsers(count: number = 30) {
    console.log(`👥 Creating ${count} users...`);
    const users = [];
    const password = await bcrypt.hash('password123', 10);
    const usedEmails = new Set<string>();

    for (let i = 0; i < count; i++) {
        const first = faker.person.firstName();
        const last = faker.person.lastName();
        const name = `${first} ${last}`;
        let email = faker.internet.email({ firstName: first, lastName: last }).toLowerCase();
        let attempts = 0;
        while (usedEmails.has(email) && attempts < 50) {
            email = faker.internet.email().toLowerCase();
            attempts++;
        }
        if (usedEmails.has(email)) email = `user${i + 1}-${Date.now()}@example.com`;
        usedEmails.add(email);

        const user = await User.create({
            name,
            email,
            password,
            bio: faker.helpers.arrayElement(bioTemplates),
            skills: faker.helpers.arrayElements(allSkills, { min: 2, max: 6 }),
            interests: faker.helpers.arrayElements(interests, { min: 2, max: 5 }),
        });
        users.push(user);
        if ((i + 1) % 10 === 0) console.log(`   Created ${i + 1}/${count} users...`);
    }
    console.log(`✅ Created ${users.length} users`);
    return users;
}

async function createIdeas(users: mongoose.Document[], count: number = 80) {
    console.log(`💡 Creating ${count} ideas...`);
    const ideas: mongoose.Document[] = [];

    for (let i = 0; i < count; i++) {
        const raw = getRandomIdea();
        const revenueModel = faker.helpers.arrayElement(revenueModels);
        const budget = faker.helpers.arrayElement(budgetRanges);
        const ideaData = {
            title: raw.title,
            summary: raw.summary,
            problem: raw.problem,
            targetAudience: raw.targetAudience,
            revenueModel,
            requiredSkills: raw.requiredSkills,
            budget,
            category: raw.category,
        };
        const validationScore = calculateValidationScore(ideaData);
        const idea = await Idea.create({
            ...ideaData,
            validationScore,
            userId: faker.helpers.arrayElement(users)._id,
            voteScore: 0,
            upvotes: 0,
            downvotes: 0,
            commentCount: 0,
        });
        ideas.push(idea);
        if ((i + 1) % 20 === 0) console.log(`   Created ${i + 1}/${count} ideas...`);
    }
    console.log(`✅ Created ${ideas.length} ideas`);
    return ideas;
}

async function createComments(users: mongoose.Document[], ideas: mongoose.Document[]) {
    console.log('💬 Creating comments...');
    let total = 0;

    for (const idea of ideas) {
        const numMain = faker.number.int({ min: 1, max: 5 });
        const commenters = faker.helpers.arrayElements(users, Math.min(numMain + 2, users.length));
        for (let i = 0; i < numMain && i < commenters.length; i++) {
            const text = faker.helpers.arrayElement(commentTemplates);
            const parent = await Comment.create({
                userId: commenters[i]._id,
                ideaId: idea._id,
                comment: text,
                parentCommentId: null,
            });
            total++;
            if (faker.datatype.boolean(0.3)) {
                const other = commenters.find((c) => c._id.toString() !== commenters[i]._id.toString());
                if (other) {
                    await Comment.create({
                        userId: other._id,
                        ideaId: idea._id,
                        comment: faker.helpers.arrayElement(['Agreed!', 'Same here – would love to connect.', 'Thanks for sharing.']),
                        parentCommentId: parent._id,
                    });
                    total++;
                }
            }
        }
        const actualCount = await Comment.countDocuments({ ideaId: idea._id });
        await Idea.findByIdAndUpdate(idea._id, { commentCount: actualCount });
    }
    console.log(`✅ Created ${total} comments`);
}

async function createVotes(users: mongoose.Document[], ideas: mongoose.Document[]) {
    console.log('👍 Creating votes...');
    let total = 0;
    for (const idea of ideas) {
        const voters = faker.helpers.arrayElements(users, faker.number.int({ min: 4, max: 18 }));
        let up = 0, down = 0;
        for (const u of voters) {
            if (u._id.toString() === (idea as any).userId.toString()) continue;
            const v = faker.helpers.arrayElement([1, 1, 1, -1]) as 1 | -1;
            try {
                await Vote.create({ userId: u._id, ideaId: idea._id, voteType: v });
                if (v === 1) up++; else down++;
                total++;
            } catch {}
        }
        await Idea.findByIdAndUpdate(idea._id, { voteScore: up - down, upvotes: up, downvotes: down });
    }
    console.log(`✅ Created ${total} votes`);
}

const messageTemplates = [
    'Saw your idea on IdeaConnect – would love to chat and see if we can collaborate.',
    'I have experience in this space. Happy to share what worked for me.',
    'When are you planning to launch? I might be able to help with testing or feedback.',
];

async function createConversations(users: mongoose.Document[]) {
    console.log('💬 Creating conversations...');
    const n = faker.number.int({ min: 12, max: 28 });
    for (let i = 0; i < n; i++) {
        const [u1, u2] = faker.helpers.arrayElements(users, 2);
        const conv = await Conversation.create({ participants: [u1._id, u2._id] });
        const numMsg = faker.number.int({ min: 2, max: 8 });
        for (let j = 0; j < numMsg; j++) {
            const sender = j % 2 === 0 ? u1 : u2;
            await Message.create({
                conversationId: conv._id,
                senderId: sender._id,
                content: faker.helpers.arrayElement(messageTemplates),
            });
        }
    }
    console.log(`✅ Created ${await Conversation.countDocuments()} conversations, ${await Message.countDocuments()} messages`);
}

async function seed() {
    try {
        await connectDB();
        await clearDatabase();

        const users = await createUsers(30);
        const ideas = await createIdeas(users, 80);
        await createComments(users, ideas);
        await createVotes(users, ideas);
        await createConversations(users);

        const first = users[0] as any;
        console.log('\n🎉 Seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Ideas: ${ideas.length}`);
        console.log(`   Comments: ${await Comment.countDocuments()}`);
        console.log(`   Votes: ${await Vote.countDocuments()}`);
        console.log(`   Conversations: ${await Conversation.countDocuments()}`);
        console.log(`   Messages: ${await Message.countDocuments()}`);
        console.log('\n🔑 Test login:');
        console.log(`   Email: ${first.email}`);
        console.log('   Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seed();
