import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Returns the current session token for the Socket.IO handshake when the
 * socket server is on a different origin (e.g. Render). The client cannot
 * read httpOnly cookies, so this route exposes the token for auth.
 */
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ token });
}
