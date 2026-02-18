require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { parse } = require("cookie");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const httpServer = http.createServer(app);
const port = parseInt(process.env.PORT || "3001", 10);

const CORS_ORIGIN = process.env.CORS_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || "*";
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!JWT_SECRET || !MONGODB_URI) {
    console.error("Missing JWT_SECRET or MONGODB_URI");
    process.exit(1);
}

// Health check for Render
app.get("/health", (_, res) => {
    res.status(200).json({ ok: true, service: "ideaconnect-socket" });
});

app.get("/", (_, res) => {
    res.redirect("/health");
});

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// Mongoose models
const userSchema = new mongoose.Schema({
    name: String, email: String, password: String,
    bio: String, skills: [String], interests: [String],
}, { timestamps: true });
const User = mongoose.models?.User || mongoose.model("User", userSchema);

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
conversationSchema.index({ participants: 1, updatedAt: -1 });
const Conversation = mongoose.models?.Conversation || mongoose.model("Conversation", conversationSchema);

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: 1 });
const Message = mongoose.models?.Message || mongoose.model("Message", messageSchema);

const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((o) => o.trim()),
        credentials: true,
        methods: ["GET", "POST"],
    },
});

io.use((socket, next) => {
    try {
        // Prefer token from handshake auth (cross-origin, e.g. Render); else cookie (same-origin)
        const token =
            socket.handshake.auth?.token ||
            (socket.handshake.headers.cookie && parse(socket.handshake.headers.cookie).token);
        if (!token) return next(new Error("Authentication error: No token"));
        const decoded = verifyToken(token);
        if (!decoded) return next(new Error("Authentication error: Invalid token"));
        socket.userId = decoded.userId;
        next();
    } catch {
        next(new Error("Authentication error"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("User connected:", userId);

    socket.on("join_conversation", ({ conversationId }) => {
        socket.join(conversationId);
    });

    socket.on("send_message", async ({ conversationId, content }) => {
        try {
            if (!content?.trim()) return;
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
            await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
            io.to(conversationId).emit("new_message", populated);
        } catch (err) {
            console.error("send_message error:", err);
            socket.emit("error_message", { message: "Failed to send message" });
        }
    });

    socket.on("typing", async ({ conversationId }) => {
        try {
            const user = await User.findById(userId, "name");
            socket.to(conversationId).emit("user_typing", {
                userId,
                name: user?.name || "Someone",
            });
        } catch {}
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", userId);
    });
});

async function start() {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected (socket server)");

    httpServer.listen(port, "0.0.0.0", () => {
        console.log("Socket server listening on port", port);
        console.log("CORS origin:", CORS_ORIGIN);
    });
}

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
