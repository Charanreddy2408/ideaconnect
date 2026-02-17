import bcrypt from "bcryptjs";
import { connectDB } from "@lib/db";
import { NextResponse } from "next/server";
import User from "../../../../models/usermodel";
import { z } from "zod";
import jwt from "jsonwebtoken";

const registrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const validation = registrationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Validation failed",
                details: validation.error.format()
            }, { status: 400 });
        }

        const { name, email, password } = validation.data;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        const response = NextResponse.json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        }, { status: 201 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400, // 1 day
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}