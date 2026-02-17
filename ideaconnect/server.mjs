import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ---- Load .env ----
import "dotenv/config";

// ---- Config ----
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// ---- JWT verify ----
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// ---- MongoDB ----
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected (Socket server)");
}

// ---- Register Mongoose models ----
const userSchema = new mongoose.Schema({
    name: String, email: String, password: String,
    bio: String, skills: [String], interests: [String],
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema);

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
conversationSchema.index({ participants: 1, updatedAt: -1 });
const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: 1 });
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

// ---- Next.js + Socket.IO ----
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
    await connectDB();

    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            origin: dev ? `http://${hostname}:${port}` : undefined,
            credentials: true,
        },
    });

    // Auth middleware
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) return next(new Error("Authentication error: No cookies"));

            const cookies = parse(cookieHeader);
            const token = cookies.token;
            if (!token) return next(new Error("Authentication error: No token"));

            const decoded = verifyToken(token);
            if (!decoded) return next(new Error("Authentication error: Invalid token"));

            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    // Event handlers
    io.on("connection", (socket) => {
        const userId = socket.userId;
        console.log(`🔌 User connected: ${userId}`);

        // Join a conversation room
        socket.on("join_conversation", ({ conversationId }) => {
            socket.join(conversationId);
            console.log(`📥 User ${userId} joined room ${conversationId}`);
        });

        // Send a message
        socket.on("send_message", async ({ conversationId, content }) => {
            try {
                if (!content || !content.trim()) return;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });

                if (!conversation) {
                    socket.emit("error_message", { message: "You are not part of this conversation" });
                    return;
                }

                const newMessage = await Message.create({
                    conversationId,
                    senderId: userId,
                    content: content.trim(),
                });

                const populated = await Message.findById(newMessage._id).populate("senderId", "name");

                // Touch conversation so it sorts to top
                await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

                io.to(conversationId).emit("new_message", populated);
            } catch (err) {
                console.error("send_message error:", err);
                socket.emit("error_message", { message: "Failed to send message" });
            }
        });

        // Typing indicator
        socket.on("typing", async ({ conversationId }) => {
            try {
                const user = await User.findById(userId, "name");
                socket.to(conversationId).emit("user_typing", {
                    userId,
                    name: user?.name || "Someone",
                });
            } catch {
                // ignore
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 User disconnected: ${userId}`);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`🚀 Ready on http://${hostname}:${port}`);
        });
});
