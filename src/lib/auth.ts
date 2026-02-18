import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getAuthUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { userId: string; email?: string };

        return decoded.userId;
    } catch {
        return null;
    }
}

export async function getAuthUserEmail() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { userId: string; email?: string };

        return decoded.email || null;
    } catch {
        return null;
    }
}

/**
 * Verify a JWT token string directly (for use outside Next.js request context, e.g. Socket.IO).
 */
export function verifyToken(token: string): { userId: string; email?: string } | null {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { userId: string; email?: string };
        return decoded;
    } catch {
        return null;
    }
}
