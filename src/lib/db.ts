import mongoose from "mongoose";
declare global {
    var mongoose: {
        conn: any;
        promise: Promise<any> | null;
    } | undefined;
}

// Check at runtime so Vercel/serverless can fail gracefully if env is missing
function getMongoUri(): string {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set. Add it in Vercel → Project → Settings → Environment Variables.");
    }
    return uri;
}

const cached: { conn: any; promise: Promise<any> | null } = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    const uri = getMongoUri();
    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}