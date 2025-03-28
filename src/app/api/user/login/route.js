import databaseConnection from "@/config/databaseConnection";
import UserModel from "@/models/userSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import * as yup from "yup";

const loginSchema = yup.object({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
});


export const POST = async (req) => {
    try {
        const body = await req.json();

        await databaseConnection(process.env.DATABASE_URL, process.env.DATABASE_NAME);
        await loginSchema.validate(body, { abortEarly: false });

        const { email, password } = body;

        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
            return NextResponse.json({ status: false, message: "User not found" }, { status: 404 });
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return NextResponse.json({ status: false, message: "Invalid password" }, { status: 400 });
        }

        const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.TOKEN_EXPIRES || "1h" }
        );

        return NextResponse.json({ status: true, message: "User logged in successfully", token }, { status: 200 });

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return NextResponse.json({
                status: false,
                message: "Validation error",
                errors: error.errors,
            }, { status: 400 });
        }

        console.error("Error in user login:", error.message);
        return NextResponse.json({ status: false, message: "User login failed" }, { status: 500 });
    }
};