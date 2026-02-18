/**
 * API test script for IdeaConnect.
 * Run: npx tsx scripts/test-apis.ts
 * Requires: dev server running (npm run dev), and DB seeded (npm run seed).
 * Optional env: BASE_URL (default http://localhost:3000), TEST_EMAIL, TEST_PASSWORD (seeded user).
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

let cookieHeader = '';

async function fetchApi(
    path: string,
    options: RequestInit & { expectStatus?: number } = {}
): Promise<{ ok: boolean; status: number; data?: any; error?: string }> {
    const { expectStatus, ...init } = options;
    const url = `${BASE_URL}${path}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string>),
    };
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    try {
        const res = await fetch(url, { ...init, headers });
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookieHeader = setCookie.split(',').map((c) => c.split(';')[0].trim()).join('; ');
        }

        let data: any = null;
        const text = await res.text();
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        const expected = expectStatus !== undefined ? expectStatus : (res.ok ? res.status : null);
        const ok = expected !== null ? res.status === expected : res.ok;

        return {
            ok,
            status: res.status,
            data,
            error: data?.message || data?.error || (ok ? undefined : text || `HTTP ${res.status}`),
        };
    } catch (err: any) {
        return {
            ok: false,
            status: 0,
            error: err.message || String(err),
        };
    }
}

function test(name: string, fn: () => Promise<boolean>): () => Promise<void> {
    return async () => {
        try {
            const pass = await fn();
            console.log(pass ? `  ✅ ${name}` : `  ❌ ${name}`);
            if (!pass) process.exitCode = 1;
        } catch (e: any) {
            console.log(`  ❌ ${name}: ${e.message}`);
            process.exitCode = 1;
        }
    };
}

async function main() {
    console.log(`\n🧪 IdeaConnect API tests (BASE_URL=${BASE_URL})\n`);

    let testUserId: string | null = null;
    let testIdeaId: string | null = null;
    let testCommentId: string | null = null;
    let testConversationId: string | null = null;
    let otherUserId: string | null = null;

    // ---- Auth ----
    console.log('--- Auth ---');

    const registerRes = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            name: 'API Test User',
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
        }),
        expectStatus: 201,
    });

    if (registerRes.ok && registerRes.data?.user?.id) {
        testUserId = registerRes.data.user.id;
        console.log('  ✅ POST /api/auth/register');
    } else {
        // Try login with seeded user if register failed (e.g. server not fresh)
        const loginEmail = TEST_EMAIL || `test-${Date.now()}@example.com`;
        const loginRes = await fetchApi('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: loginEmail, password: TEST_PASSWORD }),
            expectStatus: 200,
        });
        if (loginRes.ok && loginRes.data?.user?.id) {
            testUserId = loginRes.data.user.id;
            console.log('  ✅ POST /api/auth/login (seeded user)');
        } else {
            console.log('  ❌ POST /api/auth/register or login:', registerRes.error || loginRes.error);
            console.log('     Tip: Run "npm run seed" and set TEST_EMAIL to a seeded user email, or ensure server is up.');
            process.exitCode = 1;
        }
    }

    const profileRes = await fetchApi('/api/auth/profile', { expectStatus: 200 });
    if (profileRes.ok) {
        console.log('  ✅ GET /api/auth/profile');
        if (!testUserId && profileRes.data?.user?._id) testUserId = profileRes.data.user._id;
    } else {
        console.log('  ❌ GET /api/auth/profile:', profileRes.error);
        process.exitCode = 1;
    }

    // ---- Ideas (public + auth) ----
    console.log('\n--- Ideas ---');

    const ideasListRes = await fetchApi('/api/ideas', { expectStatus: 200 });
    if (ideasListRes.ok && Array.isArray(ideasListRes.data)) {
        console.log('  ✅ GET /api/ideas (list)');
        if (ideasListRes.data.length > 0) {
            testIdeaId = ideasListRes.data[0]._id;
            const firstIdea = ideasListRes.data[0];
            if (firstIdea.userId?._id) otherUserId = firstIdea.userId._id;
            if (firstIdea.userId?.id) otherUserId = firstIdea.userId.id;
        }
    } else {
        console.log('  ❌ GET /api/ideas:', ideasListRes.error);
        process.exitCode = 1;
    }

    const ideasSortRes = await fetchApi('/api/ideas?sort=recent&category=Tech', { expectStatus: 200 });
    console.log(ideasSortRes.ok ? '  ✅ GET /api/ideas?sort=recent&category=Tech' : `  ❌ GET /api/ideas (query): ${ideasSortRes.error}`);
    if (!ideasSortRes.ok) process.exitCode = 1;

    if (testIdeaId) {
        const oneIdeaRes = await fetchApi(`/api/ideas/${testIdeaId}`, { expectStatus: 200 });
        if (oneIdeaRes.ok) {
            console.log('  ✅ GET /api/ideas/[id]');
        } else {
            console.log('  ❌ GET /api/ideas/[id]:', oneIdeaRes.error);
            process.exitCode = 1;
        }
    }

    const createIdeaRes = await fetchApi('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({
            title: 'API Test Idea Title Here',
            summary: 'This is a test idea created by the API test script. It has more than twenty characters and some numbers like 42.',
            problem: 'Teams need a way to verify APIs work. This is a realistic problem statement that is long enough.',
            targetAudience: 'Developers and QA engineers in product teams',
            revenueModel: 'Subscription-based (SaaS)',
            requiredSkills: ['TypeScript', 'Node.js'],
            budget: '$15k - $50k',
            category: 'Tech',
        }),
        expectStatus: 201,
    });
    if (createIdeaRes.ok && createIdeaRes.data?._id) {
        testIdeaId = createIdeaRes.data._id;
        console.log('  ✅ POST /api/ideas');
    } else {
        console.log('  ❌ POST /api/ideas:', createIdeaRes.error);
        process.exitCode = 1;
    }

    if (testIdeaId) {
        const patchRes = await fetchApi(`/api/ideas/${testIdeaId}`, {
            method: 'PATCH',
            body: JSON.stringify({ summary: 'Updated summary for API test. Still long enough to pass validation and include numbers like 100.' }),
            expectStatus: 200,
        });
        console.log(patchRes.ok ? '  ✅ PATCH /api/ideas/[id]' : `  ❌ PATCH /api/ideas/[id]: ${patchRes.error}`);
        if (!patchRes.ok) process.exitCode = 1;
    }

    // ---- Comments ----
    console.log('\n--- Comments ---');

    if (testIdeaId) {
        const getCommentsRes = await fetchApi(`/api/ideas/${testIdeaId}/comments`, { expectStatus: 200 });
        if (getCommentsRes.ok && getCommentsRes.data?.comments) {
            console.log('  ✅ GET /api/ideas/[id]/comments');
            if (getCommentsRes.data.comments.length > 0) {
                testCommentId = getCommentsRes.data.comments[0]._id;
            }
        } else {
            console.log('  ❌ GET /api/ideas/[id]/comments:', getCommentsRes.error);
            process.exitCode = 1;
        }

        const postCommentRes = await fetchApi(`/api/ideas/${testIdeaId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ comment: 'API test comment for this idea.' }),
            expectStatus: 201,
        });
        if (postCommentRes.ok && postCommentRes.data?.comment?._id) {
            testCommentId = testCommentId || postCommentRes.data.comment._id;
            console.log('  ✅ POST /api/ideas/[id]/comments');
        } else {
            console.log('  ❌ POST /api/ideas/[id]/comments:', postCommentRes.error);
            process.exitCode = 1;
        }
    }

    // ---- Votes ----
    console.log('\n--- Votes ---');

    if (testIdeaId) {
        const voteRes = await fetchApi('/api/votes', {
            method: 'POST',
            body: JSON.stringify({ ideaId: testIdeaId, voteType: 1 }),
            expectStatus: 200,
        });
        console.log(voteRes.ok ? '  ✅ POST /api/votes (upvote)' : `  ❌ POST /api/votes: ${voteRes.error}`);
        if (!voteRes.ok) process.exitCode = 1;
    }

    // ---- Conversations & Messages ----
    console.log('\n--- Conversations & Messages ---');

    const getConvsRes = await fetchApi('/api/messages/conversations', { expectStatus: 200 });
    if (getConvsRes.ok && Array.isArray(getConvsRes.data?.conversations)) {
        console.log('  ✅ GET /api/messages/conversations');
        if (getConvsRes.data.conversations.length > 0) {
            testConversationId = getConvsRes.data.conversations[0]._id;
        }
    } else {
        console.log('  ❌ GET /api/messages/conversations:', getConvsRes.error);
        process.exitCode = 1;
    }

    if (otherUserId && otherUserId !== testUserId) {
        const createConvRes = await fetchApi('/api/messages/conversations', {
            method: 'POST',
            body: JSON.stringify({ participantId: otherUserId }),
            expectStatus: 201,
        });
        if (createConvRes.ok) {
            if (createConvRes.data?.conversation?._id) {
                testConversationId = testConversationId || createConvRes.data.conversation._id;
            }
            console.log('  ✅ POST /api/messages/conversations');
        } else {
            // 200 = already exists
            if (createConvRes.status === 200 && createConvRes.data?.conversation?._id) {
                testConversationId = testConversationId || createConvRes.data.conversation._id;
                console.log('  ✅ POST /api/messages/conversations (existing)');
            } else {
                console.log('  ❌ POST /api/messages/conversations:', createConvRes.error);
                process.exitCode = 1;
            }
        }
    }

    if (testConversationId) {
        const getMsgsRes = await fetchApi(`/api/messages/${testConversationId}`, { expectStatus: 200 });
        console.log(getMsgsRes.ok ? '  ✅ GET /api/messages/[conversationId]' : `  ❌ GET /api/messages/[conversationId]: ${getMsgsRes.error}`);
        if (!getMsgsRes.ok) process.exitCode = 1;
    }

    // ---- User search ----
    console.log('\n--- Users ---');

    const searchRes = await fetchApi('/api/users/search?q=React', { expectStatus: 200 });
    if (searchRes.ok && Array.isArray(searchRes.data?.users)) {
        console.log('  ✅ GET /api/users/search?q=React');
    } else {
        console.log('  ❌ GET /api/users/search:', searchRes.error);
        process.exitCode = 1;
    }

    const searchNoQ = await fetchApi('/api/users/search', { expectStatus: 400 });
    console.log(searchNoQ.status === 400 ? '  ✅ GET /api/users/search (no q → 400)' : `  ❌ GET /api/users/search (no q): expected 400, got ${searchNoQ.status}`);

    // ---- Comment delete (optional, so we don't break seed data) ----
    if (testCommentId) {
        const delCommentRes = await fetchApi(`/api/comments/${testCommentId}`, { method: 'DELETE', expectStatus: 200 });
        console.log(delCommentRes.ok ? '  ✅ DELETE /api/comments/[id]' : `  ⚠️ DELETE /api/comments/[id]: ${delCommentRes.error} (may be not owner)`);
    }

    // ---- Delete test idea (cleanup) ----
    if (testIdeaId) {
        await fetchApi(`/api/ideas/${testIdeaId}`, { method: 'DELETE', expectStatus: 200 });
        // ignore result; idea might be from seed
    }

    // ---- Logout ----
    const logoutRes = await fetchApi('/api/auth/logout', { method: 'POST', expectStatus: 200 });
    console.log(logoutRes.ok ? '  ✅ POST /api/auth/logout' : `  ❌ POST /api/auth/logout: ${logoutRes.error}`);

    // ---- Unauthenticated access ----
    console.log('\n--- Unauthenticated (no cookie) ---');
    cookieHeader = '';
    const profileUnauth = await fetchApi('/api/auth/profile', { expectStatus: 401 });
    console.log(profileUnauth.status === 401 ? '  ✅ GET /api/auth/profile → 401 when not logged in' : `  ❌ GET /api/auth/profile: expected 401, got ${profileUnauth.status}`);

    const ideasUnauth = await fetchApi('/api/ideas', { expectStatus: 200 });
    console.log(ideasUnauth.ok ? '  ✅ GET /api/ideas works without auth' : `  ❌ GET /api/ideas: ${ideasUnauth.error}`);

    console.log('\n🏁 API test run finished.\n');
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
